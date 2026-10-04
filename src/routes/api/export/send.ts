import { createFileRoute } from "@tanstack/react-router";
import { requireApiUser } from "@/lib/auth/api-guard.server";
import { materializeRecurring } from "@/lib/budget/recurring.server";
import { exportToCsv } from "@/lib/budget/export-csv";
import { getSql } from "@/lib/db";
import {
  exportCaption,
  exportFilename,
  type ExportKind,
} from "@/lib/telegram/core";
import {
  sendDocument,
  TelegramNotConfiguredError,
} from "@/lib/telegram/bot.server";
import type {
  AppData,
  CategoryBudget,
  RecurringFrequency,
  Transaction,
  TxType,
} from "@/lib/budget/types";

type TxRow = {
  id: string;
  type: string;
  amount: string;
  category: string;
  date: string;
  note: string;
  recurring: RecurringFrequency | null;
};

const KINDS: ExportKind[] = ["csv-month", "csv-all", "backup-json"];

export const Route = createFileRoute("/api/export/send")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const userId = await requireApiUser();
          const body = (await request.json().catch(() => null)) as {
            kind?: string;
            month?: string;
          } | null;
          const kind = KINDS.includes(body?.kind as ExportKind)
            ? (body?.kind as ExportKind)
            : null;
          if (!kind) {
            return Response.json({ error: "invalid_kind" }, { status: 400 });
          }
          const month = body?.month;
          if (kind === "csv-month" && !/^\d{4}-\d{2}$/.test(month ?? "")) {
            return Response.json({ error: "invalid_month" }, { status: 400 });
          }

          const sql = await getSql();
          const links = await sql.query<{ chat_id: string }>(
            `SELECT chat_id FROM telegram_links WHERE user_id = $1`,
            [userId],
          );
          const chatId = links[0]?.chat_id;
          if (!chatId) {
            return Response.json({ error: "telegram_not_linked" }, { status: 409 });
          }

          await materializeRecurring(sql, userId);
          const rows = await sql.query<TxRow>(
            `SELECT id, type, amount, category, date, note, recurring
             FROM transactions WHERE user_id = $1 ORDER BY date ASC, created_at ASC`,
            [userId],
          );
          const transactions: Transaction[] = rows.map((r) => ({
            id: r.id,
            type: r.type as TxType,
            amount: Number(r.amount),
            category: r.category,
            date: r.date,
            note: r.note,
            recurring: r.recurring,
          }));

          let content: string;
          let mimeType: string;
          const filename = exportFilename(kind, month);

          if (kind === "backup-json") {
            const budgetRows = await sql.query<{
              categoryId: string;
              limit: string;
            }>(
              `SELECT category_id as "categoryId", budget_limit as "limit"
               FROM category_budgets WHERE user_id = $1`,
              [userId],
            );
            const settingsRows = await sql.query<{ monthlyGoal: string }>(
              `SELECT monthly_goal as "monthlyGoal" FROM user_settings WHERE user_id = $1`,
              [userId],
            );
            const data: AppData = {
              version: 1,
              transactions,
              monthlyGoal: Number(settingsRows[0]?.monthlyGoal ?? 0),
              categoryBudgets: budgetRows.map(
                (b): CategoryBudget => ({
                  categoryId: b.categoryId,
                  limit: Number(b.limit),
                }),
              ),
              exportedAt: new Date().toISOString(),
            };
            content = JSON.stringify(data, null, 2);
            mimeType = "application/json";
          } else {
            content = exportToCsv(transactions, kind === "csv-month" ? month : undefined);
            mimeType = "text/csv;charset=utf-8";
          }

          await sendDocument(chatId, filename, content, mimeType, exportCaption(kind));
          return Response.json({ status: "ok", filename });
        } catch (e: unknown) {
          if (e instanceof Response) return e;
          if (e instanceof TelegramNotConfiguredError) {
            return Response.json({ error: "bot_not_configured" }, { status: 503 });
          }
          console.error("[api/export/send] failed:", e);
          return Response.json({ error: "telegram_send_failed" }, { status: 502 });
        }
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";
import { getSql } from "@/lib/db";
import { formatMonth } from "@/lib/budget/format";
import {
  formatMonthlySummary,
  secretsMatch,
  type SummaryCategory,
} from "@/lib/telegram/core";
import { sendMessage, TelegramNotConfiguredError } from "@/lib/telegram/bot.server";

const LOG = "[cron/monthly-summary]";

type TotalsRow = {
  income: string;
  expense: string;
  count: string;
};

/** "2026-11-01" (Yangon) → previous month key "2026-10". */
function previousMonthKey(yangonToday: string): string {
  const [y, m, d] = yangonToday.split("-").map(Number);
  const day = new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1));
  return new Date(day.getTime() - 86_400_000).toISOString().slice(0, 7);
}

export const Route = createFileRoute("/api/cron/monthly-summary")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          const secret = env("CRON_SECRET");
          if (!secret) {
            return Response.json({ error: "not_configured" }, { status: 503 });
          }
          const auth = request.headers.get("authorization");
          const token = auth?.startsWith("Bearer ") ? auth.slice(7) : auth;
          if (!secretsMatch(token, secret)) {
            console.warn(`${LOG} rejected: bad cron secret`);
            return new Response("Forbidden", { status: 403 });
          }

          // Daily cron fires 17:30 UTC = 00:00 Asia/Yangon; send on the 1st only.
          const yangonToday = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Yangon",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date());
          if (yangonToday.slice(8, 10) !== "01") {
            return Response.json({ ok: true, skipped: "not_first_of_month" });
          }

          const month = previousMonthKey(yangonToday);
          const sql = await getSql();
          const claimed = await sql.query(
            `INSERT INTO telegram_summary_sent (month) VALUES ($1)
             ON CONFLICT DO NOTHING RETURNING month`,
            [month],
          );
          if (claimed.length === 0) {
            return Response.json({ ok: true, skipped: "already_sent", month });
          }

          const monthPrefix = `${month}%`;
          const links = await sql.query<{ user_id: string; chat_id: string }>(
            `SELECT user_id, chat_id FROM telegram_links`,
          );
          const monthLabel = formatMonth(month);
          let sent = 0;
          let failed = 0;

          for (const link of links) {
            try {
              const totals = await sql.query<TotalsRow>(
                `SELECT
                   coalesce(sum(amount) FILTER (WHERE type = 'income'), 0)::text as income,
                   coalesce(sum(amount) FILTER (WHERE type = 'expense'), 0)::text as expense,
                   count(*)::text as count
                 FROM transactions WHERE user_id = $1 AND date LIKE $2`,
                [link.user_id, monthPrefix],
              );
              const topRows = await sql.query<{ category: string; total: string }>(
                `SELECT category, sum(amount)::text as total
                 FROM transactions
                 WHERE user_id = $1 AND type = 'expense' AND date LIKE $2
                 GROUP BY category ORDER BY sum(amount) DESC LIMIT 5`,
                [link.user_id, monthPrefix],
              );
              const goalRows = await sql.query<{ monthlyGoal: string }>(
                `SELECT monthly_goal as "monthlyGoal" FROM user_settings WHERE user_id = $1`,
                [link.user_id],
              );

              const totals0 = totals[0];
              const topCategories: SummaryCategory[] = topRows.map((r) => ({
                category: r.category,
                total: Number(r.total),
              }));
              const text = formatMonthlySummary({
                monthLabel,
                income: Number(totals0?.income ?? 0),
                expense: Number(totals0?.expense ?? 0),
                transactionCount: Number(totals0?.count ?? 0),
                topCategories,
                goal: Number(goalRows[0]?.monthlyGoal ?? 0),
              });
              await sendMessage(link.chat_id, text);
              sent += 1;
            } catch (err) {
              failed += 1;
              console.error(`${LOG} failed for user ${link.user_id}`, err);
            }
          }

          return Response.json({ ok: true, month, sent, failed });
        } catch (e: unknown) {
          if (e instanceof TelegramNotConfiguredError) {
            return Response.json({ error: "bot_not_configured" }, { status: 503 });
          }
          console.error(`${LOG} failed:`, e);
          return Response.json({ error: "internal" }, { status: 500 });
        }
      },
    },
  },
});

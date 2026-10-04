import { createFileRoute } from "@tanstack/react-router";
import { requireApiUser } from "@/lib/auth/api-guard.server";
import { hasIncomeExcept, incomeRequired } from "@/lib/budget/income-gate.server";
import { materializeRecurring } from "@/lib/budget/recurring.server";
import { parseTransactionInput } from "@/lib/budget/validation";
import { getSql } from "@/lib/db";

export const Route = createFileRoute("/api/transactions/")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const userId = await requireApiUser();
          const sql = await getSql();
          await materializeRecurring(sql, userId);
          const rows = await sql.query(
            `SELECT id, type, amount, category, date, note, recurring
             FROM transactions WHERE user_id = $1 ORDER BY date DESC, created_at DESC`,
            [userId],
          );
          return Response.json(rows);
        } catch (e: any) {
          if (e instanceof Response) return e;
          console.error("[api/transactions] GET failed:", e);
          return Response.json({ error: "Internal server error" }, { status: 500 });
        }
      },
      POST: async ({ request }: { request: Request }) => {
        try {
          const userId = await requireApiUser();
          const body = await request.json().catch(() => null);
          const parsed = parseTransactionInput(body);
          if (!parsed.ok) {
            return Response.json({ error: parsed.error }, { status: 400 });
          }
          const { type, amount, category, date, note, recurring } = parsed.value;

          const id = crypto.randomUUID();
          const sql = await getSql();
          // Income-first gate: no expense may exist before the first income.
          if (type === "expense" && !(await hasIncomeExcept(sql, userId))) {
            return incomeRequired();
          }
          await sql.query(
            `INSERT INTO transactions (id, user_id, type, amount, category, date, note, recurring, series_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [id, userId, type, Math.round(amount), category, date, note, recurring, recurring ? id : null],
          );
          return Response.json({ id, type, amount: Math.round(amount), category, date, note, recurring });
        } catch (e: any) {
          if (e instanceof Response) return e;
          console.error("[api/transactions] POST failed:", e);
          return Response.json({ error: "Internal server error" }, { status: 500 });
        }
      },
      DELETE: async () => {
        try {
          const userId = await requireApiUser();
          const sql = await getSql();
          await sql.query(`DELETE FROM transactions WHERE user_id = $1`, [userId]);
          // Fresh start: drop delete-suppression records too.
          await sql.query(`DELETE FROM recurring_tombstones WHERE user_id = $1`, [userId]);
          return Response.json({ success: true });
        } catch (e: any) {
          if (e instanceof Response) return e;
          console.error("[api/transactions] DELETE failed:", e);
          return Response.json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});

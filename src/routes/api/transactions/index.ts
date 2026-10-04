import { createFileRoute } from "@tanstack/react-router";
import { requireApiUser } from "@/lib/auth/api-guard.server";
import { hasIncomeExcept, incomeRequired } from "@/lib/budget/income-gate.server";
import { dueOccurrences } from "@/lib/budget/recurring";
import { parseTransactionInput } from "@/lib/budget/validation";
import { getSql } from "@/lib/db";
import type { RecurringFrequency } from "@/lib/budget/types";

type AnchorRow = {
  id: string;
  type: string;
  amount: string;
  category: string;
  date: string;
  note: string;
  recurring: RecurringFrequency;
  series_id: string | null;
};

/**
 * Materialize past-due occurrences of every recurring series owned by `userId`
 * (idempotent: a date that already has a row or a user tombstone is never
 * re-inserted; only anchors — rows whose id equals their series_id — generate).
 */
async function materializeRecurring(sql: Awaited<ReturnType<typeof getSql>>, userId: string): Promise<void> {
  const anchors = await sql.query<AnchorRow>(
    `SELECT id, type, amount, category, date, note, recurring, series_id
     FROM transactions WHERE user_id = $1 AND recurring IS NOT NULL`,
    [userId],
  );
  const today = new Date().toISOString().slice(0, 10);

  for (const anchor of anchors) {
    const seriesId = anchor.series_id ?? anchor.id;
    if (seriesId !== anchor.id) continue; // generated occurrences never generate
    const due = dueOccurrences(anchor.date, anchor.recurring, today);
    if (due.length === 0) continue;

    const existing = await sql.query<{ date: string }>(
      `SELECT date FROM transactions
       WHERE user_id = $1 AND series_id = $2 AND date = ANY($3)`,
      [userId, seriesId, due],
    );
    const tombstoned = await sql.query<{ date: string }>(
      `SELECT date FROM recurring_tombstones
       WHERE user_id = $1 AND series_id = $2 AND date = ANY($3)`,
      [userId, seriesId, due],
    );
    const taken = new Set([...existing, ...tombstoned].map((r) => r.date));

    for (const date of due) {
      if (taken.has(date)) continue;
      await sql.query(
        `INSERT INTO transactions (id, user_id, type, amount, category, date, note, recurring, series_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT DO NOTHING`,
        [
          crypto.randomUUID(),
          userId,
          anchor.type,
          anchor.amount,
          anchor.category,
          date,
          anchor.note,
          anchor.recurring,
          seriesId,
        ],
      );
    }
  }
}

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

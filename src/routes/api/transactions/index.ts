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
 *
 * Batched: one SELECT for anchors, one pair-wise SELECT for existing rows, one
 * for tombstones, and a single multi-row INSERT — 4 round trips total instead
 * of 3 + one INSERT per due date (the old N+1 made first load slow for users
 * with old recurring series).
 */
async function materializeRecurring(sql: Awaited<ReturnType<typeof getSql>>, userId: string): Promise<void> {
  const anchors = await sql.query<AnchorRow>(
    `SELECT id, type, amount, category, date, note, recurring, series_id
     FROM transactions WHERE user_id = $1 AND recurring IS NOT NULL`,
    [userId],
  );
  const today = new Date().toISOString().slice(0, 10);
  // Income-first gate: auto-generated expense occurrences are deferred (not lost)
  // while no income exists — dueOccurrences recomputes from the anchor each run.
  let expenseAllowed: boolean | null = null;

  // 1) Collect due dates for every anchor.
  const pending: Array<{ anchor: AnchorRow; seriesId: string; dates: string[] }> = [];
  for (const anchor of anchors) {
    const seriesId = anchor.series_id ?? anchor.id;
    if (seriesId !== anchor.id) continue; // generated occurrences never generate
    const due = dueOccurrences(anchor.date, anchor.recurring, today);
    if (due.length > 0) pending.push({ anchor, seriesId, dates: due });
  }
  if (pending.length === 0) return;

  // 2) Which (series, date) pairs are already taken? Two set-based lookups.
  const flatSeries: string[] = [];
  const flatDates: string[] = [];
  for (const p of pending) {
    for (const d of p.dates) {
      flatSeries.push(p.seriesId);
      flatDates.push(d);
    }
  }
  const [existing, tombstoned] = await Promise.all([
    sql.query<{ series_id: string; date: string }>(
      `SELECT series_id, date FROM transactions
       WHERE user_id = $1 AND (series_id, date) IN
         (SELECT * FROM unnest($2::text[], $3::text[]))`,
      [userId, flatSeries, flatDates],
    ),
    sql.query<{ series_id: string; date: string }>(
      `SELECT series_id, date FROM recurring_tombstones
       WHERE user_id = $1 AND (series_id, date) IN
         (SELECT * FROM unnest($2::text[], $3::text[]))`,
      [userId, flatSeries, flatDates],
    ),
  ]);
  const taken = new Set([
    ...existing.map((r) => `${r.series_id}|${r.date}`),
    ...tombstoned.map((r) => `${r.series_id}|${r.date}`),
  ]);

  // 3) Collect missing rows and insert them all in one statement.
  const ids: string[] = [];
  const userIds: string[] = [];
  const types: string[] = [];
  const amounts: string[] = [];
  const categories: string[] = [];
  const dates: string[] = [];
  const notes: string[] = [];
  const recurrings: string[] = [];
  const seriesIds: string[] = [];
  for (const { anchor, seriesId, dates: dueDates } of pending) {
    if (anchor.type === "expense") {
      if (expenseAllowed === null) expenseAllowed = await hasIncomeExcept(sql, userId);
      if (!expenseAllowed) continue;
    }
    for (const date of dueDates) {
      if (taken.has(`${seriesId}|${date}`)) continue;
      ids.push(crypto.randomUUID());
      userIds.push(userId);
      types.push(anchor.type);
      amounts.push(anchor.amount);
      categories.push(anchor.category);
      dates.push(date);
      notes.push(anchor.note);
      recurrings.push(anchor.recurring);
      seriesIds.push(seriesId);
    }
  }
  if (ids.length === 0) return;
  await sql.query(
    `INSERT INTO transactions (id, user_id, type, amount, category, date, note, recurring, series_id)
     SELECT * FROM unnest(
       $1::text[], $2::text[], $3::text[], $4::numeric[], $5::text[],
       $6::text[], $7::text[], $8::text[], $9::text[]
     )
     ON CONFLICT DO NOTHING`,
    [ids, userIds, types, amounts, categories, dates, notes, recurrings, seriesIds],
  );
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
            `SELECT id, type, amount, category, date, note, recurring, (receipt IS NOT NULL) AS has_receipt
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
          const { type, amount, category, date, note, recurring, receipt } = parsed.value;

          const id = crypto.randomUUID();
          const sql = await getSql();
          // Income-first gate: no expense may exist before the first income.
          if (type === "expense" && !(await hasIncomeExcept(sql, userId))) {
            return incomeRequired();
          }
          await sql.query(
            `INSERT INTO transactions (id, user_id, type, amount, category, date, note, recurring, series_id, receipt)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [id, userId, type, Math.round(amount), category, date, note, recurring, recurring ? id : null, receipt ?? null],
          );
          return Response.json({ id, type, amount: Math.round(amount), category, date, note, recurring, hasReceipt: receipt != null });
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

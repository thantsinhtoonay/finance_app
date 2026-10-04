import { getSql } from "@/lib/db";
import { dueOccurrences } from "./recurring";
import type { RecurringFrequency } from "./types";

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
 * Shared by the transactions REST routes and the Telegram export route so
 * exports see exactly the rows the UI shows.
 */
export async function materializeRecurring(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
): Promise<void> {
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

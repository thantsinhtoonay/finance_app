import { createFileRoute } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth/server";
import { dueOccurrences } from "@/lib/budget/recurring";
import { getSql } from "@/lib/db";
import type { RecurringFrequency } from "@/lib/budget/types";

async function requireUser(): Promise<string> {
  const request = getRequest();
  if (!request) throw new Response("Unauthorized", { status: 401 });
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw new Response("Unauthorized", { status: 401 });
  return session.user.id;
}

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
          const userId = await requireUser();
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
          return Response.json({ error: e.message }, { status: 500 });
        }
      },
      POST: async ({ request }: { request: Request }) => {
        try {
          const userId = await requireUser();
          const body = await request.json();
          const { type, amount, category, date, note, recurring } = body;

          const amountNum = Number(amount);
          if (!type || !Number.isFinite(amountNum) || amountNum <= 0 || !category || !date) {
            return Response.json({ error: "Missing or invalid required fields" }, { status: 400 });
          }

          const id = crypto.randomUUID();
          const sql = await getSql();
          await sql.query(
            `INSERT INTO transactions (id, user_id, type, amount, category, date, note, recurring, series_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [id, userId, type, Math.round(amountNum), category, date, note || "", recurring || null, recurring ? id : null],
          );
          return Response.json({ id, type, amount: Math.round(amountNum), category, date, note: note || "", recurring: recurring || null });
        } catch (e: any) {
          if (e instanceof Response) return e;
          return Response.json({ error: e.message }, { status: 500 });
        }
      },
      DELETE: async () => {
        try {
          const userId = await requireUser();
          const sql = await getSql();
          await sql.query(`DELETE FROM transactions WHERE user_id = $1`, [userId]);
          // Fresh start: drop delete-suppression records too.
          await sql.query(`DELETE FROM recurring_tombstones WHERE user_id = $1`, [userId]);
          return Response.json({ success: true });
        } catch (e: any) {
          if (e instanceof Response) return e;
          return Response.json({ error: e.message }, { status: 500 });
        }
      },
    },
  },
});

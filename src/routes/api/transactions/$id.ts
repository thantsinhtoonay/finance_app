import { createFileRoute } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth/server";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";
import { parseTransactionInput } from "@/lib/budget/validation";
import { getSql } from "@/lib/db";

async function requireUser(): Promise<string> {
  assertSameSiteRequest();
  const request = getRequest();
  if (!request) throw new Response("Unauthorized", { status: 401 });
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw new Response("Unauthorized", { status: 401 });
  return session.user.id;
}

/** Keep a deleted/moved occurrence from being re-generated for its series. */
async function addTombstone(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
  seriesId: string,
  date: string,
): Promise<void> {
  await sql.query(
    `INSERT INTO recurring_tombstones (id, user_id, series_id, date)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, series_id, date) DO NOTHING`,
    [crypto.randomUUID(), userId, seriesId, date],
  );
}

export const Route = createFileRoute("/api/transactions/$id")({
  server: {
    handlers: {
      GET: async () =>
        Response.json(
          { error: "Method not allowed" },
          { status: 405, headers: { Allow: "PUT, DELETE" } },
        ),
      PUT: async ({ request, params }: { request: Request; params: { id: string } }) => {
        try {
          const userId = await requireUser();
          const { id } = params;
          const body = await request.json().catch(() => null);
          const parsed = parseTransactionInput(body);
          if (!parsed.ok) {
            return Response.json({ error: parsed.error }, { status: 400 });
          }
          const { type, amount, category, date, note, recurring } = parsed.value;

          const sql = await getSql();
          const existing = await sql.query<{
            id: string;
            date: string;
            recurring: string | null;
            series_id: string | null;
          }>(
            `SELECT id, date, recurring, series_id FROM transactions WHERE id = $1 AND user_id = $2`,
            [id, userId],
          );
          if (existing.length === 0) {
            return Response.json({ error: "Not found" }, { status: 404 });
          }
          const row = existing[0];

          // Moving an occurrence off its date must stop the series from
          // re-filling the old slot (anchors restart from their new date).
          if (row.recurring && row.date !== date) {
            await addTombstone(sql, userId, row.series_id ?? row.id, row.date);
          }

          const rounded = Math.round(amount);
          // Setting recurring on a non-recurring row makes it the anchor of its
          // own series; otherwise the existing series membership is preserved.
          const nextSeriesId = recurring ? (row.series_id ?? id) : row.series_id;
          await sql.query(
            `UPDATE transactions SET type = $1, amount = $2, category = $3, date = $4, note = $5, recurring = $6, series_id = $7
             WHERE id = $8 AND user_id = $9`,
            [type, rounded, category, date, note, recurring, nextSeriesId, id, userId],
          );
          return Response.json({ id, type, amount: rounded, category, date, note, recurring });
        } catch (e: any) {
          if (e instanceof Response) return e;
          console.error("[api/transactions/$id] PUT failed:", e);
          return Response.json({ error: "Internal server error" }, { status: 500 });
        }
      },
      DELETE: async ({ params }: { request: Request; params: { id: string } }) => {
        try {
          const userId = await requireUser();
          const { id } = params;
          const sql = await getSql();

          const existing = await sql.query<{
            id: string;
            date: string;
            recurring: string | null;
            series_id: string | null;
          }>(
            `SELECT id, date, recurring, series_id FROM transactions WHERE id = $1 AND user_id = $2`,
            [id, userId],
          );
          if (existing.length > 0 && existing[0].recurring) {
            await addTombstone(sql, userId, existing[0].series_id ?? existing[0].id, existing[0].date);
          }

          await sql.query(
            `DELETE FROM transactions WHERE id = $1 AND user_id = $2`,
            [id, userId],
          );
          return Response.json({ success: true });
        } catch (e: any) {
          if (e instanceof Response) return e;
          console.error("[api/transactions/$id] DELETE failed:", e);
          return Response.json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});

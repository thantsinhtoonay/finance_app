import { createFileRoute } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth/server";
import { getSql } from "@/lib/db";

async function requireUser(): Promise<string> {
  const request = getRequest();
  if (!request) throw new Response("Unauthorized", { status: 401 });
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw new Response("Unauthorized", { status: 401 });
  return session.user.id;
}

export const Route = createFileRoute("/api/transactions/$id")({
  server: {
    handlers: {
      PUT: async ({ request, params }: { request: Request; params: { id: string } }) => {
        try {
          const userId = await requireUser();
          const { id } = params;
          const body = await request.json();
          const { type, amount, category, date, note, recurring } = body;

          const sql = await getSql();
          const existing = await sql.query(
            `SELECT id FROM transactions WHERE id = $1 AND user_id = $2`,
            [id, userId],
          );
          if (existing.length === 0) {
            return Response.json({ error: "Not found" }, { status: 404 });
          }

          await sql.query(
            `UPDATE transactions SET type = $1, amount = $2, category = $3, date = $4, note = $5, recurring = $6
             WHERE id = $7 AND user_id = $8`,
            [type, amount, category, date, note || "", recurring || null, id, userId],
          );
          return Response.json({ id, type, amount, category, date, note: note || "", recurring: recurring || null });
        } catch (e: any) {
          if (e instanceof Response) return e;
          return Response.json({ error: e.message }, { status: 500 });
        }
      },
      DELETE: async ({ params }: { params: { id: string } }) => {
        try {
          const userId = await requireUser();
          const { id } = params;
          const sql = await getSql();
          await sql.query(
            `DELETE FROM transactions WHERE id = $1 AND user_id = $2`,
            [id, userId],
          );
          return Response.json({ success: true });
        } catch (e: any) {
          if (e instanceof Response) return e;
          return Response.json({ error: e.message }, { status: 500 });
        }
      },
    },
  },
});

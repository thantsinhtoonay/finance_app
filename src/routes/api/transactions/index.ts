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

export const Route = createFileRoute("/api/transactions/")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const userId = await requireUser();
          const sql = await getSql();
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

          if (!type || !amount || !category || !date) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
          }

          const id = crypto.randomUUID();
          const sql = await getSql();
          await sql.query(
            `INSERT INTO transactions (id, user_id, type, amount, category, date, note, recurring)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [id, userId, type, amount, category, date, note || "", recurring || null],
          );
          return Response.json({ id, type, amount, category, date, note: note || "", recurring: recurring || null });
        } catch (e: any) {
          if (e instanceof Response) return e;
          return Response.json({ error: e.message }, { status: 500 });
        }
      },
    },
  },
});

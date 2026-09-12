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

export const Route = createFileRoute("/api/budgets/")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const userId = await requireUser();
          const sql = await getSql();
          const rows = await sql.query(
            `SELECT category_id as "categoryId", budget_limit as "limit"
             FROM category_budgets WHERE user_id = $1`,
            [userId],
          );
          return Response.json(rows);
        } catch (e: any) {
          if (e instanceof Response) return e;
          return Response.json({ error: e.message }, { status: 500 });
        }
      },
      PUT: async ({ request }: { request: Request }) => {
        try {
          const userId = await requireUser();
          const body = await request.json();
          const { categoryId, limit } = body;

          if (!categoryId || limit === undefined) {
            return Response.json({ error: "Missing categoryId or limit" }, { status: 400 });
          }

          const sql = await getSql();
          await sql.query(
            `INSERT INTO category_budgets (id, user_id, category_id, budget_limit)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, category_id)
             DO UPDATE SET budget_limit = $4`,
            [crypto.randomUUID(), userId, categoryId, limit],
          );
          return Response.json({ categoryId, limit });
        } catch (e: any) {
          if (e instanceof Response) return e;
          return Response.json({ error: e.message }, { status: 500 });
        }
      },
    },
  },
});

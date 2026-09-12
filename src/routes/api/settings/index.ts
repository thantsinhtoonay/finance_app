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

export const Route = createFileRoute("/api/settings/")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const userId = await requireUser();
          const sql = await getSql();
          const rows = await sql.query(
            `SELECT monthly_goal as "monthlyGoal"
             FROM user_settings WHERE user_id = $1`,
            [userId],
          );
          if (rows.length === 0) {
            return Response.json({ monthlyGoal: 3500 });
          }
          return Response.json(rows[0]);
        } catch (e: any) {
          if (e instanceof Response) return e;
          return Response.json({ error: e.message }, { status: 500 });
        }
      },
      PUT: async ({ request }: { request: Request }) => {
        try {
          const userId = await requireUser();
          const body = await request.json();
          const { monthlyGoal } = body;

          if (monthlyGoal === undefined) {
            return Response.json({ error: "Missing monthlyGoal" }, { status: 400 });
          }

          const sql = await getSql();
          await sql.query(
            `INSERT INTO user_settings (user_id, monthly_goal)
             VALUES ($1, $2)
             ON CONFLICT (user_id)
             DO UPDATE SET monthly_goal = $2, updated_at = CURRENT_TIMESTAMP`,
            [userId, monthlyGoal],
          );
          return Response.json({ monthlyGoal });
        } catch (e: any) {
          if (e instanceof Response) return e;
          return Response.json({ error: e.message }, { status: 500 });
        }
      },
    },
  },
});

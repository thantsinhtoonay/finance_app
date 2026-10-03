import { createFileRoute } from "@tanstack/react-router";
import { requireApiUser } from "@/lib/auth/api-guard.server";
import { isValidCategoryId } from "@/lib/budget/validation";
import { getSql } from "@/lib/db";

export const Route = createFileRoute("/api/budgets/")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const userId = await requireApiUser();
          const sql = await getSql();
          const rows = await sql.query(
            `SELECT category_id as "categoryId", budget_limit as "limit"
             FROM category_budgets WHERE user_id = $1`,
            [userId],
          );
          return Response.json(rows);
        } catch (e: any) {
          if (e instanceof Response) return e;
          console.error("[api/budgets] request failed:", e);
          return Response.json({ error: "Internal server error" }, { status: 500 });
        }
      },
      PUT: async ({ request }: { request: Request }) => {
        try {
          const userId = await requireApiUser();
          const body = await request.json();
          const { categoryId, limit } = body;

          const limitNum =
            typeof limit === "number" || (typeof limit === "string" && limit.trim() !== "")
              ? Number(limit)
              : NaN;
          if (!isValidCategoryId(categoryId) || limit === undefined || !Number.isFinite(limitNum) || limitNum < 0) {
            return Response.json({ error: "Missing or invalid categoryId or limit" }, { status: 400 });
          }

          const sql = await getSql();
          const rounded = Math.round(limitNum);
          await sql.query(
            `INSERT INTO category_budgets (id, user_id, category_id, budget_limit)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, category_id)
             DO UPDATE SET budget_limit = $4`,
            [crypto.randomUUID(), userId, categoryId, rounded],
          );
          return Response.json({ categoryId, limit: rounded });
        } catch (e: any) {
          if (e instanceof Response) return e;
          console.error("[api/budgets] request failed:", e);
          return Response.json({ error: "Internal server error" }, { status: 500 });
        }
      },
      DELETE: async ({ request }: { request: Request }) => {
        try {
          const userId = await requireApiUser();
          const raw = await request.text();

          let categoryId: unknown;
          if (raw && raw.trim()) {
            try {
              ({ categoryId } = JSON.parse(raw));
            } catch {
              return Response.json({ error: "Invalid JSON body" }, { status: 400 });
            }
          }

          const sql = await getSql();
          if (categoryId !== undefined && categoryId !== null) {
            if (!isValidCategoryId(categoryId)) {
              return Response.json({ error: "Missing categoryId" }, { status: 400 });
            }
            await sql.query(
              `DELETE FROM category_budgets WHERE user_id = $1 AND category_id = $2`,
              [userId, categoryId],
            );
            return Response.json({ ok: true });
          }

          // No categoryId → clear ALL budgets ("Clear All Data").
          await sql.query(`DELETE FROM category_budgets WHERE user_id = $1`, [userId]);
          return Response.json({ ok: true, all: true });
        } catch (e: any) {
          if (e instanceof Response) return e;
          console.error("[api/budgets] request failed:", e);
          return Response.json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});

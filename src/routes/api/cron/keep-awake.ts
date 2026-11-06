import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";

/**
 * Keep-alive ping (Vercel Cron, daily at 14:00 UTC — see `crons` in
 * vercel.json; Vercel Hobby plans only allow daily cron schedules, so a more
 * frequent schedule fails the whole deployment).
 *
 * Two jobs in one:
 * 1. Runs `SELECT 1` so Neon's compute never autosuspends — a cold DB wake was
 *    the main cause of intermittent multi-second stalls on data operations
 *    (node-postgres would wait with no timeout before this existed).
 * 2. Invokes the server bundle regularly so the serverless function stays warm
 *    and users rarely hit a cold start.
 *
 * Auth: Vercel sends `Authorization: Bearer $CRON_SECRET` on cron invocations,
 * but ONLY when a `CRON_SECRET` env var exists (Vercel does not provision one
 * automatically). So the bearer is enforced when the secret is configured and
 * skipped when it isn't — otherwise every invocation would 401 and the ping
 * would silently never run. The endpoint is harmless either way (SELECT 1, no
 * data or mutations); adding CRON_SECRET to the project later hardens it with
 * no code change.
 */
export const Route = createFileRoute("/api/cron/keep-awake")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const secret = process.env.CRON_SECRET?.trim();
        const auth = request.headers.get("authorization") ?? "";
        if (secret && auth !== `Bearer ${secret}`) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        try {
          const sql = await getSql();
          await sql.query("SELECT 1");
          return Response.json({ ok: true, db: "awake" });
        } catch (e) {
          console.error("[cron/keep-awake] ping failed:", e);
          return Response.json({ ok: false }, { status: 500 });
        }
      },
    },
  },
});

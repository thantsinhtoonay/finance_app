import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import {
  extractSender,
  parseStartCommand,
  startMessageSender,
} from "@/lib/telegram/core";
import {
  sendMessage,
  telegramConfigured,
  webhookSecretMatches,
} from "@/lib/telegram/bot.server";

const LOG = "[telegram/webhook]";

type CodeState = {
  telegram_user_id: string | null;
  claimed_at: Date | string | null;
  expires_at: Date | string;
};

async function reply(chatId: string, text: string): Promise<void> {
  // Non-fatal: the claim/status update is what matters; a failed reply (bad
  // chat, API hiccup) must not make Telegram retry the whole update forever.
  await sendMessage(chatId, text).catch((err) => {
    console.error(`${LOG} reply failed`, err);
  });
}

export const Route = createFileRoute("/api/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        if (!webhookSecretMatches(request.headers.get("x-telegram-bot-api-secret-token"))) {
          console.warn(`${LOG} rejected: bad webhook secret`);
          return new Response("Forbidden", { status: 403 });
        }
        if (!telegramConfigured()) {
          return Response.json({ ok: false, error: "not configured" }, { status: 503 });
        }

        const update = (await request.json().catch(() => null)) as unknown;
        if (!update || typeof update !== "object") {
          return Response.json({ ok: true });
        }

        const start = startMessageSender(update);
        if (!start) {
          // A bare /start (no payload) gets a help nudge; everything else is ignored.
          const sender = extractSender(update);
          const text = (
            update as { message?: { text?: string } }
          ).message?.text?.trim();
          if (sender && parseStartCommand(text) === null && text?.startsWith("/start")) {
            await reply(
              sender.chatId,
              "👋 Open a sign-in link from the Shal Su app (Settings → Telegram), then tap Start here.",
            );
          }
          return Response.json({ ok: true });
        }

        const { code, sender } = start;
        const sql = await getSql();

        const links = await sql.query<{ user_id: string }>(
          `SELECT user_id FROM telegram_links WHERE telegram_user_id = $1`,
          [sender.telegramUserId],
        );

        // Claim the code (idempotent for the same Telegram account — a double
        // tap must not steal it from a retry of the SAME user).
        const claimed = await sql.query(
          `UPDATE telegram_auth_codes
           SET telegram_user_id = $1, chat_id = $2, username = $3, display_name = $4,
               claimed_at = coalesce(claimed_at, now())
           WHERE code = $5 AND expires_at > now()
             AND (claimed_at IS NULL OR telegram_user_id = $1)
           RETURNING code`,
          [
            sender.telegramUserId,
            sender.chatId,
            sender.username,
            sender.displayName,
            code,
          ],
        );

        if (claimed.length > 0) {
          await reply(
            sender.chatId,
            links[0]
              ? "✅ You're linked. Return to the Shal Su app to finish signing in."
              : "✅ Telegram connected. Return to the Shal Su app to finish setting up.",
          );
          return Response.json({ ok: true });
        }

        const states = await sql.query<CodeState>(
          `SELECT telegram_user_id, claimed_at, expires_at
           FROM telegram_auth_codes WHERE code = $1`,
          [code],
        );
        const state = states[0];
        if (!state || new Date(state.expires_at).getTime() < Date.now()) {
          await reply(
            sender.chatId,
            "⛔ That sign-in link has expired. Go back to the app and start again.",
          );
        } else if (state.telegram_user_id !== sender.telegramUserId) {
          await reply(sender.chatId, "⛔ That sign-in link was already used.");
        } else {
          await reply(
            sender.chatId,
            "⏳ Waiting for you in the app — switch back and it will sign you in.",
          );
        }
        return Response.json({ ok: true });
      },
    },
  },
});

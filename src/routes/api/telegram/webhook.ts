import { createFileRoute } from "@tanstack/react-router";
import { extractSender, webAppWelcomeMessage } from "@/lib/telegram/core";
import {
  openAppButton,
  sendMessage,
  telegramConfigured,
  webhookSecretMatches,
} from "@/lib/telegram/bot.server";

const LOG = "[telegram/webhook]";

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

        const sender = extractSender(update);
        if (!sender) {
          return Response.json({ ok: true });
        }

        const text = (update as { message?: { text?: string } }).message?.text?.trim();
        if (text?.startsWith("/start")) {
          // Account creation happens in the Mini App itself (validated initData);
          // here we just point the user at it. Non-fatal on API hiccups — a
          // failed reply must not make Telegram retry the update forever.
          await sendMessage(
            sender.chatId,
            webAppWelcomeMessage(sender.displayName),
            openAppButton(),
          ).catch((err) => {
            console.error(`${LOG} reply failed`, err);
          });
        }
        return Response.json({ ok: true });
      },
    },
  },
});

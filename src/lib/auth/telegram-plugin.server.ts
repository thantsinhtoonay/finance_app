import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, getSessionFromCtx } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import * as z from "zod";
import { getSql } from "@/lib/db";
import {
  generateAuthCode,
  normalizeAuthCode,
  signInProgressMessage,
  telegramLinkedMessage,
  telegramUnlinkedMessage,
  throttle,
} from "@/lib/telegram/core";
import {
  botStartUrl,
  sendMessage,
  telegramConfigured,
} from "@/lib/telegram/bot.server";

const LOG = "[telegram-auth]";
const CODE_TTL_SECONDS = 300;

/** Best-effort per-IP throttle for code minting (module map; warm instance). */
const startHits = new Map<string, number[]>();

type CodeRow = {
  code: string;
  telegram_user_id: string | null;
  chat_id: string | null;
  username: string | null;
  display_name: string | null;
  claimed_at: Date | null;
  expires_at: Date;
};

type LinkRow = {
  user_id: string;
  telegram_user_id: string;
  chat_id: string;
  username: string;
  display_name: string;
};

function clientIp(headers: Headers | undefined): string | null {
  if (!headers) return null;
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip");
}

function myanmarNow(): string {
  return (
    new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Yangon",
    }).format(new Date()) + " MMT"
  );
}

/** Fire-and-forget: a bot hiccup must never fail the auth request. */
function notify(chatId: string | null, text: string): void {
  if (!chatId || !telegramConfigured()) return;
  sendMessage(chatId, text).catch((err) => {
    console.error(`${LOG} sendMessage failed`, err);
  });
}

export function telegramAuthPlugin() {
  return {
    id: "telegram-auth",
    endpoints: {
      /**
       * Mint a one-time deep-link code. Public (throttled): the UI calls it on
       * "Continue with Telegram" — no session required so sign-in works.
       */
      "telegram/start": createAuthEndpoint(
        "/telegram/start",
        {
          method: "POST",
        },
        async (ctx) => {
          if (!telegramConfigured() || !botStartUrl("X")) {
            ctx.setStatus(503);
            return ctx.json({ status: "unconfigured" as const });
          }
          const ip = clientIp(ctx.request?.headers ?? ctx.headers) ?? "unknown";
          if (throttle(startHits, ip, Date.now())) {
            ctx.setStatus(429);
            return ctx.json({ status: "throttled" as const });
          }

          const sql = await getSql();
          await sql.query(
            `DELETE FROM telegram_auth_codes WHERE claimed_at IS NULL AND expires_at < now()`,
          );

          const code = generateAuthCode();
          await sql.query(
            `INSERT INTO telegram_auth_codes (code, expires_at) VALUES ($1, now() + make_interval(secs => $2))`,
            [code, CODE_TTL_SECONDS],
          );
          return ctx.json({
            status: "ok" as const,
            code,
            url: botStartUrl(code),
            expiresIn: CODE_TTL_SECONDS,
          });
        },
      ),

      /**
       * Claim a code the webhook has stamped (user tapped Start in Telegram).
       * Three callers: sign-in without session, link while signed in, first-run
       * account creation. Polling-friendly: always 200 + `status`.
       */
      "telegram/complete": createAuthEndpoint(
        "/telegram/complete",
        {
          method: "POST",
          body: z.object({ code: z.string() }),
        },
        async (ctx) => {
          const code = normalizeAuthCode(ctx.body.code);
          if (!code) {
            return ctx.json({ status: "invalid" as const });
          }

          const sql = await getSql();
          const codes = await sql.query<CodeRow>(
            `SELECT code, telegram_user_id, chat_id, username, display_name, claimed_at, expires_at
             FROM telegram_auth_codes WHERE code = $1`,
            [code],
          );
          const row = codes[0];
          if (!row || new Date(row.expires_at).getTime() < Date.now()) {
            if (row) {
              await sql.query(`DELETE FROM telegram_auth_codes WHERE code = $1`, [code]);
            }
            return ctx.json({ status: "expired" as const });
          }
          if (!row.claimed_at || !row.telegram_user_id || !row.chat_id) {
            return ctx.json({ status: "waiting" as const });
          }

          const tgId = row.telegram_user_id;
          const chatId = row.chat_id;
          const username = row.username ?? "";
          const displayName = row.display_name ?? username ?? "Telegram user";

          const session = await getSessionFromCtx(ctx).catch((err) => {
            console.error(`${LOG} getSessionFromCtx failed`, err);
            return null;
          });

          const links = await sql.query<LinkRow>(
            `SELECT user_id, telegram_user_id, chat_id, username, display_name
             FROM telegram_links WHERE telegram_user_id = $1`,
            [tgId],
          );
          const link = links[0];

          if (link) {
            if (session?.user && session.user.id !== link.user_id) {
              return ctx.json({ status: "conflict" as const });
            }
            const user = await ctx.context.internalAdapter.findUserById(link.user_id);
            if (!user) {
              // Orphan link (shouldn't happen — FK cascades). Drop and rebuild.
              await sql.query(`DELETE FROM telegram_links WHERE user_id = $1`, [
                link.user_id,
              ]);
            } else {
              await sql.query(
                `UPDATE telegram_links
                 SET chat_id = $1, username = $2, display_name = $3
                 WHERE user_id = $4`,
                [chatId, username, displayName, link.user_id],
              );
              await sql.query(`DELETE FROM telegram_auth_codes WHERE code = $1`, [code]);

              if (!session) {
                const newSession = await ctx.context.internalAdapter.createSession(user.id);
                if (!newSession) {
                  ctx.setStatus(500);
            return ctx.json({ status: "error" as const });
                }
                await setSessionCookie(ctx, { session: newSession, user });
                notify(chatId, signInProgressMessage(myanmarNow(), clientIp(ctx.request?.headers ?? ctx.headers)));
                return ctx.json({ status: "ok" as const, signedIn: true });
              }
              return ctx.json({ status: "ok" as const, linked: true });
            }
          }

          // No usable link yet.
          if (session?.user) {
            await sql.query(
              `INSERT INTO telegram_links (user_id, telegram_user_id, chat_id, username, display_name)
               VALUES ($1, $2, $3, $4, $5)`,
              [session.user.id, tgId, chatId, username, displayName],
            );
            await sql.query(`DELETE FROM telegram_auth_codes WHERE code = $1`, [code]);
            notify(chatId, telegramLinkedMessage(displayName));
            return ctx.json({ status: "ok" as const, linked: true });
          }

          // First run: create the app account for this Telegram identity.
          const user = await ctx.context.internalAdapter.createUser({
            email: `tg-${tgId}@shalsu.telegram`,
            name: displayName,
            emailVerified: false,
          });
          if (!user) {
            ctx.setStatus(500);
            return ctx.json({ status: "error" as const });
          }
          await sql.query(
            `INSERT INTO telegram_links (user_id, telegram_user_id, chat_id, username, display_name)
             VALUES ($1, $2, $3, $4, $5)`,
            [user.id, tgId, chatId, username, displayName],
          );
          await sql.query(`DELETE FROM telegram_auth_codes WHERE code = $1`, [code]);

          const newSession = await ctx.context.internalAdapter.createSession(user.id);
          if (!newSession) {
            ctx.setStatus(500);
            return ctx.json({ status: "error" as const });
          }
          await setSessionCookie(ctx, { session: newSession, user });
          notify(chatId, signInProgressMessage(myanmarNow(), clientIp(ctx.request?.headers ?? ctx.headers)));
          return ctx.json({ status: "ok" as const, signedIn: true, created: true });
        },
      ),

      /** Settings view: is this session linked? Is the bot configured at all? */
      "telegram/status": createAuthEndpoint(
        "/telegram/status",
        {
          method: "GET",
        },
        async (ctx) => {
          const session = await getSessionFromCtx(ctx).catch(() => null);
          if (!session?.user) {
            ctx.setStatus(401);
            return ctx.json({ status: "unauthenticated" as const, linked: false });
          }
          const sql = await getSql();
          const links = await sql.query<LinkRow>(
            `SELECT user_id, telegram_user_id, chat_id, username, display_name
             FROM telegram_links WHERE user_id = $1`,
            [session.user.id],
          );
          const link = links[0];
          return ctx.json({
            status: "ok" as const,
            configured: telegramConfigured(),
            linked: Boolean(link),
            username: link?.username ?? "",
            displayName: link?.display_name ?? "",
          });
        },
      ),

      /** Unlink the Telegram account from the signed-in user (mislink recovery). */
      "telegram/unlink": createAuthEndpoint(
        "/telegram/unlink",
        {
          method: "POST",
        },
        async (ctx) => {
          const session = await getSessionFromCtx(ctx).catch(() => null);
          if (!session?.user) {
            ctx.setStatus(401);
            return ctx.json({ status: "unauthenticated" as const });
          }
          const sql = await getSql();
          const links = await sql.query<LinkRow>(
            `SELECT user_id, telegram_user_id, chat_id, username, display_name
             FROM telegram_links WHERE user_id = $1`,
            [session.user.id],
          );
          const link = links[0];
          if (link) {
            await sql.query(`DELETE FROM telegram_links WHERE user_id = $1`, [
              session.user.id,
            ]);
            notify(link.chat_id, telegramUnlinkedMessage());
          }
          return ctx.json({ status: "ok" as const, wasLinked: Boolean(link) });
        },
      ),
    },
  } satisfies BetterAuthPlugin;
}

import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, getSessionFromCtx } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import * as z from "zod";
import { getSql } from "@/lib/db";
import { validateTelegramInitData } from "@/lib/telegram/init-data";
import { webAppWelcomeMessage } from "@/lib/telegram/core";
import {
  openAppButton,
  sendMessage,
  telegramConfigured,
  telegramToken,
} from "@/lib/telegram/bot.server";

const LOG = "[telegram-webapp]";

type LinkRow = {
  user_id: string;
  telegram_user_id: string;
  chat_id: string;
  username: string;
  display_name: string;
};

type SessionUser = NonNullable<
  NonNullable<Awaited<ReturnType<typeof getSessionFromCtx>>>["user"]
>;

/** Fire-and-forget: a bot hiccup must never fail the auth request. */
function notify(chatId: string, text: string): void {
  if (!telegramConfigured()) return;
  sendMessage(chatId, text, openAppButton()).catch((err) => {
    console.error(`${LOG} sendMessage failed`, err);
  });
}

/**
 * Telegram Mini App entry auth: the client posts the raw `initData` it
 * received from the Telegram client; we validate it against the bot token and
 * sign in — or register — the account keyed by the Telegram user id. There is
 * no email/password flow in the app anymore; this endpoint is the only way in.
 */
export function telegramAuthPlugin() {
  return {
    id: "telegram-auth",
    endpoints: {
      "telegram/webapp": createAuthEndpoint(
        "/telegram/webapp",
        {
          method: "POST",
          body: z.object({ initData: z.string().min(1) }),
        },
        async (ctx) => {
          if (!telegramConfigured()) {
            console.warn(`${LOG} unconfigured: TELEGRAM_BOT_TOKEN missing`);
            ctx.setStatus(503);
            return ctx.json({ status: "unconfigured" as const });
          }

          const validated = validateTelegramInitData(ctx.body.initData, telegramToken()!);
          if (!validated.ok) {
            // TEMPORARY deep-debug aid (remove after the bad_hash mystery is
            // solved): dump the raw payload so the exact chain can be
            // reproduced server-side. Contains the opener's Telegram profile.
            console.warn(
              `${LOG} rejected initData: ${validated.reason}` +
                ` origin=${ctx.request?.headers.get("origin") ?? "none"}` +
                ` len=${ctx.body.initData.length}` +
                ` dump=${ctx.body.initData}`,
            );
            ctx.setStatus(401);
            return ctx.json({ status: "invalid" as const, reason: validated.reason });
          }

          const tgUser = validated.user;
          const tgId = String(tgUser.id);
          const chatId = tgId; // private chat id == user id
          const username = tgUser.username ?? "";
          const displayName =
            [tgUser.firstName, tgUser.lastName].filter(Boolean).join(" ") ||
            username ||
            "Telegram user";
          const email = `tg-${tgId}@shalsu.telegram`;

          const sql = await getSql();
          const links = await sql.query<LinkRow>(
            `SELECT user_id, telegram_user_id, chat_id, username, display_name
             FROM telegram_links WHERE telegram_user_id = $1`,
            [tgId],
          );
          let link: LinkRow | undefined = links[0];
          let user: SessionUser | null = null;
          let created = false;

          if (link) {
            user = await ctx.context.internalAdapter.findUserById(link.user_id);
            if (user) {
              await sql.query(
                `UPDATE telegram_links
                 SET chat_id = $1, username = $2, display_name = $3
                 WHERE user_id = $4`,
                [chatId, username, displayName, user.id],
              );
            } else {
              // Orphan link (shouldn't happen — FK cascades). Drop and rebuild.
              await sql.query(`DELETE FROM telegram_links WHERE user_id = $1`, [link.user_id]);
              link = undefined;
            }
          }

          if (!link || !user) {
            // First open from this Telegram account: auto-register.
            user = await ctx.context.internalAdapter
              .createUser({ email, name: displayName, emailVerified: false })
              .catch(() => null);
            if (!user) {
              // Email already owned (parallel request or a prior run) — adopt it.
              const adopted = await ctx.context.internalAdapter.findUserByEmail(email);
              user = adopted?.user ?? null;
            }
            if (!user) {
              ctx.setStatus(500);
              return ctx.json({ status: "error" as const });
            }
            await sql.query(
              `INSERT INTO telegram_links (user_id, telegram_user_id, chat_id, username, display_name)
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (telegram_user_id) DO NOTHING`,
              [user.id, tgId, chatId, username, displayName],
            );
            const canonical = await sql.query<LinkRow>(
              `SELECT user_id, telegram_user_id, chat_id, username, display_name
               FROM telegram_links WHERE telegram_user_id = $1`,
              [tgId],
            );
            link = canonical[0];
            if (!link) {
              ctx.setStatus(500);
              return ctx.json({ status: "error" as const });
            }
            if (link.user_id === user.id) {
              created = true;
            } else {
              // Lost a registration race — follow the link that won.
              user = await ctx.context.internalAdapter.findUserById(link.user_id);
              if (!user) {
                ctx.setStatus(500);
                return ctx.json({ status: "error" as const });
              }
            }
          }

          const session = await getSessionFromCtx(ctx).catch((err) => {
            console.error(`${LOG} getSessionFromCtx failed`, err);
            return null;
          });
          if (!session?.user || session.user.id !== user.id) {
            const newSession = await ctx.context.internalAdapter.createSession(user.id);
            if (!newSession) {
              ctx.setStatus(500);
              return ctx.json({ status: "error" as const });
            }
            await setSessionCookie(ctx, { session: newSession, user });
          }

          if (created) {
            notify(chatId, webAppWelcomeMessage(displayName));
          }
          console.log(
            `${LOG} ok tg=${tgId} user=${user.id} created=${created} session=${!session?.user || session.user.id !== user.id}`,
          );
          return ctx.json({
            status: "ok" as const,
            signedIn: true,
            created,
            username,
            displayName,
          });
        },
      ),
    },
  } satisfies BetterAuthPlugin;
}

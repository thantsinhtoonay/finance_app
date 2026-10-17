/**
 * Transactional email via Resend (server-only).
 *
 * All three flows the user asked for:
 *   1. Welcome / account info  — sent on email/password signup (account, region, device)
 *   2. Password reset link     — sent on forgot-password (the URL is built by Better Auth)
 *   3. Password changed notice — sent on change-password and on reset-password completion
 *
 * No API key → logs to console in dev (so the reset URL is still usable locally);
 * in production a missing key is an error log, never a crash.
 */
import { Resend } from "resend";
import { env } from "../env.server";
import { describeRequest } from "./device-info";

const DEFAULT_FROM = "Shal Su <no-reply@thantsin.website>";
const APP_URL = () => env("BETTER_AUTH_URL") ?? "https://www.thantsin.website";
const GOLD = "#b8860b";

let resendClient: Resend | null = null;

function getClient(): Resend | null {
  if (resendClient) return resendClient;
  const key = env("RESEND_API_KEY");
  if (!key) return null;
  resendClient = new Resend(key);
  return resendClient;
}

function fromAddress(): string {
  return env("EMAIL_FROM") ?? DEFAULT_FROM;
}

/** Escape user-controlled text before it goes into HTML email markup. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const resend = getClient();
  if (!resend) {
    if (env("NODE_ENV") === "production") {
      console.error(`[email] RESEND_API_KEY not set — cannot send "${opts.subject}" to ${opts.to}`);
    } else {
      console.warn(
        `[email] RESEND_API_KEY not set — skipping "${opts.subject}" to ${opts.to}\n${opts.text}`,
      );
    }
    return false;
  }
  const { error } = await resend.emails.send({
    from: fromAddress(),
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
  if (error) {
    console.error("[email] send failed:", error);
    return false;
  }
  console.log(`[email] sent "${opts.subject}" to ${opts.to}`);
  return true;
}

/** Minimal inline-styled wrapper — renders consistently in Gmail/Outlook/Yahoo. */
function layout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f6f5f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e7e5e0;overflow:hidden;">
    <div style="background:${GOLD};padding:14px 28px;display:flex;align-items:center;gap:12px;">
      <img src="${APP_URL()}/images/logo.jpg" alt="Shal Su" width="44" height="44" style="width:44px;height:44px;border-radius:9999px;object-fit:cover;display:block;border:2px solid rgba(255,255,255,0.85);" />
      <span style="font-size:18px;font-weight:700;color:#ffffff;">Shal Su</span>
    </div>
    <div style="padding:28px;">
      <h1 style="margin:0 0 16px;font-size:20px;color:#1c1917;">${title}</h1>
      ${bodyHtml}
    </div>
    <div style="padding:16px 28px 24px;color:#78716c;font-size:12px;border-top:1px solid #f0efeb;">
      Shal Su · Personal Finance · ${APP_URL()}
    </div>
  </div>
</body>
</html>`;
}

function detailsTable(rows: Array<[string, string]>): string {
  const trs = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 0;color:#78716c;font-size:13px;">${escapeHtml(k)}</td><td style="padding:8px 0;color:#1c1917;font-size:13px;font-weight:600;text-align:right;">${escapeHtml(v)}</td></tr>`,
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;margin:8px 0 16px;">${trs}</table>`;
}

function requestMeta(headers: Headers | undefined | null): string {
  const { device, region } = describeRequest(headers);
  return detailsTable([
    ["Device", device],
    ["Region", region],
    ["Time (UTC)", new Date().toISOString().replace("T", " ").slice(0, 19)],
  ]);
}

export async function sendWelcomeEmail(
  to: string,
  name: string,
  headers: Headers | undefined | null,
): Promise<boolean> {
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi there,";
  const html = layout(
    "Welcome to Shal Su",
    `<p style="margin:0 0 16px;color:#44403c;font-size:14px;line-height:1.6;">${greeting} Your Shal Su account is ready. Here's a summary of this signup:</p>
     ${detailsTable([["Account", to]])}
     ${requestMeta(headers)}
     <p style="margin:16px 0 0;color:#44403c;font-size:14px;line-height:1.6;">If this wasn't you, you can safely ignore this email — or reset your password from the sign-in page.</p>`,
  );
  const text = `${greeting}\n\nYour Shal Su account is ready.\nAccount: ${to}\n${requestMeta(headers)}\n\nIf this wasn't you, reset your password from the sign-in page.`;
  return sendEmail({ to, subject: "Welcome to Shal Su", html, text });
}

export async function sendResetPasswordEmail(
  to: string,
  name: string,
  url: string,
  headers: Headers | undefined | null,
): Promise<boolean> {
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi there,";
  const safeUrl = escapeHtml(url);
  if (env("NODE_ENV") !== "production") {
    console.log(`[email:dev] password-reset URL for ${to}: ${url}`);
  }
  const html = layout(
    "Reset your password",
    `<p style="margin:0 0 16px;color:#44403c;font-size:14px;line-height:1.6;">${greeting} We received a request to reset your Shal Su password. Click the button below — it expires in 1 hour.</p>
     <p style="margin:20px 0;text-align:center;">
       <a href="${safeUrl}" style="background:${GOLD};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 28px;border-radius:8px;display:inline-block;">Reset password</a>
     </p>
     ${requestMeta(headers)}
     <p style="margin:16px 0 0;color:#78716c;font-size:12px;line-height:1.6;">Button not working? Paste this link into your browser:<br/><a href="${safeUrl}" style="color:${GOLD};word-break:break-all;">${safeUrl}</a></p>
     <p style="margin:12px 0 0;color:#44403c;font-size:14px;">If you didn't request this, you can safely ignore this email.</p>`,
  );
  const text = `${greeting}\n\nReset your Shal Su password (expires in 1 hour):\n${url}\n\nRequested from ${describeRequest(headers).device} in ${describeRequest(headers).region}.\n\nIf you didn't request this, ignore this email.`;
  return sendEmail({ to, subject: "Reset your Shal Su password", html, text });
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  url: string,
  headers: Headers | undefined | null,
): Promise<boolean> {
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi there,";
  const safeUrl = escapeHtml(url);
  const html = layout(
    "Verify your new email",
    `<p style="margin:0 0 16px;color:#44403c;font-size:14px;line-height:1.6;">${greeting} Confirm this new email address for your Shal Su account by clicking the button below — it expires in 1 hour.</p>
     <p style="margin:20px 0;text-align:center;">
       <a href="${safeUrl}" style="background:${GOLD};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 28px;border-radius:8px;display:inline-block;">Verify email</a>
     </p>
     ${requestMeta(headers)}
     <p style="margin:16px 0 0;color:#78716c;font-size:12px;line-height:1.6;">Button not working? Paste this link into your browser:<br/><a href="${safeUrl}" style="color:${GOLD};word-break:break-all;">${safeUrl}</a></p>
     <p style="margin:12px 0 0;color:#44403c;font-size:14px;">If you didn't request an email change, ignore this email and consider resetting your password.</p>`,
  );
  const text = `${greeting}\n\nConfirm your new Shal Su email (expires in 1 hour):\n${url}\n\nIf you didn't request an email change, ignore this and reset your password.`;
  return sendEmail({ to, subject: "Verify your new email — Shal Su", html, text });
}

export async function sendPasswordChangedEmail(
  to: string,
  name: string,
  headers: Headers | undefined | null,
  kind: "change" | "reset",
): Promise<boolean> {
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi there,";
  const headline =
    kind === "change" ? "Your password was changed" : "Your password was reset";
  const html = layout(
    headline,
    `<p style="margin:0 0 16px;color:#44403c;font-size:14px;line-height:1.6;">${greeting} ${headline} for your Shal Su account.</p>
     ${detailsTable([["Account", to]])}
     ${requestMeta(headers)}
     <p style="margin:16px 0 0;color:#44403c;font-size:14px;line-height:1.6;"><strong>If this wasn't you</strong>, someone else may have access to your account. Reset your password immediately from the sign-in page.</p>`,
  );
  const text = `${greeting}\n\n${headline} for your Shal Su account.\nAccount: ${to}\n${requestMeta(headers)}\n\nIf this wasn't you, reset your password immediately from the sign-in page.`;
  return sendEmail({ to, subject: `${headline} — Shal Su`, html, text });
}

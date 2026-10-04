import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Read a server env var (trimmed; empty counts as unset).
 *
 * Local dev: Vite only exposes `VITE_*` keys to code, so server-side secrets
 * in `.env` (TELEGRAM_BOT_TOKEN, …) never reach `process.env` on their own.
 * On a first miss we load `.env` once with Node's built-in parser (real
 * process env always wins; the file is gitignored so deployments don't have
 * it — there the platform injects env directly).
 */
let envFileTried = false;
function tryLoadEnvFile(): void {
  if (envFileTried) return;
  envFileTried = true;
  try {
    if (process.env.VERCEL) return;
    const path = join(process.cwd(), ".env");
    if (existsSync(path)) process.loadEnvFile(path);
  } catch {
    // Malformed .env or unsupported runtime — behave as if the file is absent.
  }
}

export function env(key: string): string | undefined {
  tryLoadEnvFile();
  const v = process.env[key]?.trim();
  return v || undefined;
}

/**
 * Workspace preview vs deployed app. The deployer writes GROK_PROJECT_ID on
 * every publish; the sandbox preview never has it. Single source of truth for
 * the split — gate audience, gate endpoints and connector-token semantics all
 * key off this predicate.
 */
export function isWorkspacePreview(): boolean {
  return !env("GROK_PROJECT_ID");
}

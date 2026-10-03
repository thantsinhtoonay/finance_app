import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth/server";
import {
  assertSameSiteRequest,
  CrossSiteRequestError,
} from "@/lib/auth/isolation.server";

/**
 * Auth + same-site guard for the REST API routes (`/api/transactions`,
 * `/api/settings`, `/api/budgets`).
 *
 * - Rejects scripted cross-site/sibling requests first (403) — the same
 *   protection `authMiddleware` applies to server functions.
 * - Then resolves the session user (401 when signed out).
 *
 * Thrown `Response`s are picked up by each route's `catch (e)` handler
 * (`e instanceof Response`), so the status reaches the client unchanged.
 */
export async function requireApiUser(): Promise<string> {
  try {
    assertSameSiteRequest();
  } catch (err) {
    if (err instanceof CrossSiteRequestError) {
      throw new Response("Forbidden: cross-site request blocked", {
        status: 403,
      });
    }
    throw err;
  }
  const request = getRequest();
  if (!request) throw new Response("Unauthorized", { status: 401 });
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw new Response("Unauthorized", { status: 401 });
  return session.user.id;
}

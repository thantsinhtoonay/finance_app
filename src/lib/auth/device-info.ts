/**
 * Pure helpers describing the client device + region of a request, used in
 * security emails (signup welcome, password changed/reset). No server deps —
 * unit-testable with a plain Headers object.
 */

export function parseUserAgent(ua: string | null | undefined): string {
  if (!ua) return "Unknown device";

  const browser = /Edg[A-Z/]/.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /SamsungBrowser/.test(ua)
        ? "Samsung Internet"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Chrome\//.test(ua)
            ? "Chrome"
            : /Safari\//.test(ua) && /Version\//.test(ua)
              ? "Safari"
              : "Browser";

  const os = /Windows/.test(ua)
    ? "Windows"
    : /iPhone|iPad|iPod/.test(ua)
      ? "iOS"
      : /Android/.test(ua)
        ? "Android"
        : /Mac OS X|Macintosh/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "Unknown OS";

  return `${browser} on ${os}`;
}

/** Vercel sets x-vercel-ip-country / x-vercel-ip-city (URL-encoded) per request. */
export function describeRequest(
  headers: Headers | undefined | null,
): { device: string; region: string } {
  const device = parseUserAgent(headers?.get("user-agent"));

  const country = headers?.get("x-vercel-ip-country")?.trim() || null;
  let city = headers?.get("x-vercel-ip-city")?.trim() || null;
  if (city) {
    try {
      city = decodeURIComponent(city);
    } catch {
      // keep raw value
    }
  }
  const region = city && country ? `${city}, ${country}` : country || "Unknown location";

  return { device, region };
}

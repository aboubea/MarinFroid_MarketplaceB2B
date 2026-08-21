/** Base URL to build absolute links (activation, reset password, etc.) in
 * emails. Prefers APP_URL, but falls back to the incoming request's own
 * host so a missing/stale APP_URL doesn't silently produce broken
 * localhost links in production emails.
 *
 * APP_URL is ignored (not just when unset) if it points at localhost/an IP
 * loopback — that's a value that can only ever be correct in local dev, so
 * if it's set to that on a deployed environment (e.g. a leftover/default
 * value in Vercel) it's certainly wrong there, and the request's real host
 * is a better answer than trusting it. */
function isLocalUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}

export function getBaseUrl(request?: Request): string {
  const configured = process.env.APP_URL;
  if (configured && !isLocalUrl(configured)) return configured.replace(/\/+$/, "");
  if (request) {
    const host = request.headers.get("host");
    if (host && !isLocalUrl(`http://${host}`)) {
      const proto = request.headers.get("x-forwarded-proto") ?? "https";
      return `${proto}://${host}`;
    }
  }
  return configured?.replace(/\/+$/, "") ?? "http://localhost:3000";
}

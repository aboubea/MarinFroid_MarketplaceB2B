/** Base URL to build absolute links (activation, reset password, etc.) in
 * emails. Prefers APP_URL, but falls back to the incoming request's own
 * host so a missing/stale APP_URL doesn't silently produce broken
 * localhost links in production emails. */
export function getBaseUrl(request?: Request): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, "");
  if (request) {
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    const host = request.headers.get("host");
    if (host) return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}

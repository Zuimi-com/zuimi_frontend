/** Match the browser Origin to the public Host, as Next.js does for Server Actions.
 * Reverse proxies must set X-Forwarded-Host to the original public host.
 */
export function isSameOriginRequest(headers: Headers, allowMissingOrigin = false) {
  const origin = headers.get("origin");
  if (!origin) return allowMissingOrigin;
  const host = (headers.get("x-forwarded-host")?.split(",")[0] || headers.get("host") || "").trim();
  if (!host || /[\s/@\\?#]/.test(host)) return false;
  try {
    const parsed = new URL(origin);
    if (!["http:", "https:"].includes(parsed.protocol) || parsed.origin !== origin) return false;
    return parsed.host === new URL(`${parsed.protocol}//${host}`).host;
  } catch { return false; }
}

export function publicRequestOrigin(request: {headers: Headers; url: string}) {
  const host = (request.headers.get("x-forwarded-host")?.split(",")[0] || request.headers.get("host") || "").trim();
  const protocol = (request.headers.get("x-forwarded-proto")?.split(",")[0] || new URL(request.url).protocol.replace(":", "")).trim();
  if (!host || /[\s/@\\?#]/.test(host) || !["http", "https"].includes(protocol)) throw new Error("Invalid request host.");
  return new URL(`${protocol}://${host}`).origin;
}

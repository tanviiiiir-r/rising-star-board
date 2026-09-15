export function publicSiteUrl(): string {
  const raw =
    (typeof import.meta !== "undefined" ? import.meta.env.VITE_PUBLIC_SITE_URL : undefined) ||
    (typeof process !== "undefined" ? process.env["VITE_PUBLIC_SITE_URL"] : undefined) ||
    "";
  const configured = canonicalizePublicOrigin(raw.replace(/\/$/, ""));
  if (configured) return configured;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

/** Apex is SSO-gated; share crawlers must hit www or they get a Vercel login page. */
function canonicalizePublicOrigin(url: string): string {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "bid-ladder.lol") parsed.hostname = "www.bid-ladder.lol";
    return parsed.origin;
  } catch {
    return url;
  }
}

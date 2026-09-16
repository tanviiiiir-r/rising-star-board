export type ListingTargetKind = "web" | "x" | "instagram";

export type ParsedListingTarget = {
  kind: ListingTargetKind;
  canonicalUrl: string;
  label: string;
  logoUrl: string;
  handle?: string;
  hostname?: string;
};

const HANDLE_RE = /^[a-zA-Z0-9._]{1,30}$/;

const RESERVED = new Set([
  "explore",
  "p",
  "reel",
  "reels",
  "stories",
  "share",
  "tv",
  "accounts",
  "direct",
  "home",
  "search",
  "i",
  "intent",
  "compose",
  "hashtag",
  "settings",
  "notifications",
  "messages",
  "login",
  "signup",
  "privacy",
  "tos",
]);

function firstPathSegment(pathname: string): string | null {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment) return null;
  return decodeURIComponent(segment).replace(/^@/, "");
}

function xTarget(handle: string): ParsedListingTarget {
  const id = handle.replace(/^@/, "");
  return {
    kind: "x",
    canonicalUrl: `https://x.com/${id}`,
    label: `@${id}`,
    handle: id,
    logoUrl: `https://unavatar.io/twitter/${encodeURIComponent(id)}`,
  };
}

function instagramTarget(handle: string): ParsedListingTarget {
  const id = handle.replace(/^@/, "");
  return {
    kind: "instagram",
    canonicalUrl: `https://www.instagram.com/${id}/`,
    label: `@${id}`,
    handle: id,
    logoUrl: `https://unavatar.io/instagram/${encodeURIComponent(id)}`,
  };
}

export function faviconForHost(hostname: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`;
}

export function listingLogoSrc(url: string, logoUrl?: string | null): string | null {
  const stored = logoUrl?.trim();
  if (stored) return stored;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (!host) return null;
    return faviconForHost(host);
  } catch {
    return null;
  }
}

/** Parse a product URL, @handle (X), or Instagram handle into a canonical listing target. */
export function parseListingTarget(raw: string): ParsedListingTarget | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const igPrefix = trimmed.match(/^(?:ig:|ig\/)@?([a-zA-Z0-9._]{1,30})$/i);
  if (igPrefix?.[1] && HANDLE_RE.test(igPrefix[1])) return instagramTarget(igPrefix[1]);

  if (trimmed.startsWith("@")) {
    const handle = trimmed.slice(1);
    if (HANDLE_RE.test(handle)) return xTarget(handle);
    return null;
  }

  let urlText = trimmed;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(urlText)) {
    urlText = `https://${urlText}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(urlText);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  if (parsed.username || parsed.password) return null;

  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  if (!host) return null;

  if (host === "instagram.com" || host === "instagr.am") {
    const handle = firstPathSegment(parsed.pathname);
    if (handle && HANDLE_RE.test(handle) && !RESERVED.has(handle.toLowerCase())) {
      return instagramTarget(handle);
    }
    return null;
  }

  if (host === "x.com" || host === "twitter.com" || host === "mobile.twitter.com") {
    const handle = firstPathSegment(parsed.pathname);
    if (handle && HANDLE_RE.test(handle) && !RESERVED.has(handle.toLowerCase())) {
      return xTarget(handle);
    }
    return null;
  }

  if (!host.includes(".")) return null;

  const path = parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/$/, "");
  return {
    kind: "web",
    canonicalUrl: `https://${host}${path}${parsed.search}`,
    label: host,
    hostname: host,
    logoUrl: faviconForHost(host),
  };
}

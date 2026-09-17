import { parseListingTarget, type ParsedListingTarget } from "./listing-target";

export interface ListingImagePreview {
	kind: ParsedListingTarget["kind"];
	canonicalUrl: string;
	label: string;
	name: string;
	description: string;
	logoUrl: string;
	handle?: string;
	hostname?: string;
}

const FETCH_TIMEOUT_MS = 4000;
const MAX_HTML_BYTES = 400_000;
const USER_AGENT =
	"Mozilla/5.0 (compatible; BidLadderBot/1.0; +https://www.bid-ladder.lol)";

const BLOCKED_HOSTS = new Set([
	"localhost",
	"127.0.0.1",
	"0.0.0.0",
	"::1",
	"metadata.google.internal",
	"metadata.google.com",
]);

const PRIVATE_IPV4 =
	/^(127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/;

export function isPublicHttpUrl(raw: string): boolean {
	let parsed: URL;
	try {
		parsed = new URL(raw);
	} catch {
		return false;
	}
	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
		return false;
	}
	if (parsed.username || parsed.password) {
		return false;
	}
	const host = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase();
	if (!host || BLOCKED_HOSTS.has(host) || host.endsWith(".localhost") || host.endsWith(".local")) {
		return false;
	}
	if (PRIVATE_IPV4.test(host) || host === "::1" || host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")) {
		return false;
	}
	return true;
}

export function handleLogoUrl(kind: "x" | "instagram", handle: string): string {
	const id = encodeURIComponent(handle.replace(/^@/, ""));
	return kind === "instagram"
		? `https://unavatar.io/instagram/${id}`
		: `https://unavatar.io/twitter/${id}`;
}

function decodeEntities(value: string): string {
	return value
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/\s+/g, " ")
		.trim();
}

function metaContent(html: string, key: string): string | null {
	const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const patterns = [
		new RegExp(
			`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`,
			"i",
		),
		new RegExp(
			`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`,
			"i",
		),
	];
	for (const pattern of patterns) {
		const match = html.match(pattern);
		if (match?.[1]) {
			return decodeEntities(match[1]);
		}
	}
	return null;
}

function titleFromHtml(html: string): string | null {
	const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
	return match?.[1] ? decodeEntities(match[1]) : null;
}

interface IconCandidate {
	href: string;
	rel: string;
	sizes: number;
}

function iconCandidates(html: string): IconCandidate[] {
	const tags = html.match(/<link\b[^>]*>/gi) ?? [];
	const found: IconCandidate[] = [];
	for (const tag of tags) {
		const rel = tag.match(/\brel=["']([^"']+)["']/i)?.[1]?.toLowerCase() ?? "";
		if (!/\b(icon|apple-touch-icon|apple-touch-icon-precomposed|shortcut icon)\b/.test(rel)) {
			continue;
		}
		const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
		if (!href) {
			continue;
		}
		const sizeMatch = tag.match(/\bsizes=["'](\d+)/i);
		const sizes = sizeMatch ? Number(sizeMatch[1]) : rel.includes("apple-touch") ? 180 : 32;
		found.push({ href: decodeEntities(href), rel, sizes });
	}
	return found.sort((left, right) => right.sizes - left.sizes);
}

export function resolveUrlAgainst(href: string, baseUrl: string): string | null {
	try {
		const resolved = new URL(href, baseUrl).toString();
		return isPublicHttpUrl(resolved) ? resolved : null;
	} catch {
		return null;
	}
}

export function extractPageMeta(html: string, pageUrl: string): {
	name: string | null;
	description: string;
	images: string[];
} {
	const name =
		metaContent(html, "og:title") ??
		metaContent(html, "twitter:title") ??
		titleFromHtml(html);
	const description =
		metaContent(html, "og:description") ??
		metaContent(html, "twitter:description") ??
		metaContent(html, "description") ??
		"";

	const images: string[] = [];
	const seen = new Set<string>();
	const push = (href: string | null | undefined) => {
		if (!href) {
			return;
		}
		const resolved = resolveUrlAgainst(href, pageUrl);
		if (!resolved || seen.has(resolved)) {
			return;
		}
		seen.add(resolved);
		images.push(resolved);
	};

	for (const icon of iconCandidates(html)) {
		push(icon.href);
	}
	push(metaContent(html, "og:image"));
	push(metaContent(html, "og:image:url"));
	push(metaContent(html, "twitter:image"));
	push(metaContent(html, "twitter:image:src"));
	push("/apple-touch-icon.png");
	push("/favicon.ico");

	return { name, description, images };
}

async function fetchText(url: string): Promise<string | null> {
	if (!isPublicHttpUrl(url)) {
		return null;
	}
	try {
		const response = await fetch(url, {
			redirect: "follow",
			headers: { Accept: "text/html,application/xhtml+xml", "User-Agent": USER_AGENT },
			signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
		});
		if (!response.ok) {
			return null;
		}
		const contentType = response.headers.get("content-type") ?? "";
		if (contentType && !contentType.includes("html") && !contentType.includes("xml")) {
			return null;
		}
		const finalUrl = response.url || url;
		if (!isPublicHttpUrl(finalUrl)) {
			return null;
		}
		const text = await response.text();
		return text.slice(0, MAX_HTML_BYTES);
	} catch {
		return null;
	}
}

function fallbackFromTarget(target: ParsedListingTarget): ListingImagePreview {
	return {
		kind: target.kind,
		canonicalUrl: target.canonicalUrl,
		label: target.label,
		name: target.label,
		description: "",
		logoUrl: target.logoUrl,
		handle: target.handle,
		hostname: target.hostname,
	};
}

export async function resolveListingPreview(raw: string): Promise<ListingImagePreview | null> {
	const target = parseListingTarget(raw);
	if (!target) {
		return null;
	}

	if (target.kind === "x" || target.kind === "instagram") {
		const handle = target.handle ?? target.label.replace(/^@/, "");
		return {
			...fallbackFromTarget(target),
			logoUrl: handleLogoUrl(target.kind, handle),
		};
	}

	const html = await fetchText(target.canonicalUrl);
	if (!html) {
		return fallbackFromTarget(target);
	}

	const meta = extractPageMeta(html, target.canonicalUrl);
	const name = (meta.name?.replace(/\s+[|\-–—].*$/, "").trim() || target.label).slice(0, 60);
	return {
		...fallbackFromTarget(target),
		name,
		description: meta.description.slice(0, 240),
		logoUrl: meta.images[0] ?? target.logoUrl,
	};
}

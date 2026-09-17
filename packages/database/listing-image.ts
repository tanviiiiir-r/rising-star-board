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

export interface ResolveListingPreviewOptions {
	fetch?: typeof fetch;
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
	return !isBlockedHost(parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase());
}

function isBlockedHost(host: string): boolean {
	if (!host || BLOCKED_HOSTS.has(host) || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
		return true;
	}
	if (PRIVATE_IPV4.test(host)) {
		return true;
	}
	if (host.includes(":")) {
		const ip = host.toLowerCase();
		if (ip === "::1" || ip.startsWith("fe80:") || ip.startsWith("fc") || ip.startsWith("fd")) {
			return true;
		}
	}
	return false;
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
		.replace(/&#39;|&apos;/g, "'")
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

export interface PageMeta {
	name: string | null;
	description: string;
	images: string[];
	icons: string[];
	socialImages: string[];
}

export function extractPageMeta(html: string, pageUrl: string): PageMeta {
	const name =
		metaContent(html, "og:title") ??
		metaContent(html, "twitter:title") ??
		titleFromHtml(html);
	const description =
		metaContent(html, "og:description") ??
		metaContent(html, "twitter:description") ??
		metaContent(html, "description") ??
		"";

	const seen = new Set<string>();
	const collect = (href: string | null | undefined, into: string[]) => {
		if (!href) {
			return;
		}
		const resolved = resolveUrlAgainst(href, pageUrl);
		if (!resolved || seen.has(resolved)) {
			return;
		}
		seen.add(resolved);
		into.push(resolved);
	};

	const icons: string[] = [];
	const socialImages: string[] = [];
	const guessedIcons: string[] = [];

	for (const icon of iconCandidates(html)) {
		collect(icon.href, icons);
	}
	collect(metaContent(html, "og:image"), socialImages);
	collect(metaContent(html, "og:image:url"), socialImages);
	collect(metaContent(html, "twitter:image"), socialImages);
	collect(metaContent(html, "twitter:image:src"), socialImages);
	collect("/apple-touch-icon.png", guessedIcons);
	collect("/favicon.ico", guessedIcons);

	return {
		name,
		description,
		images: [...icons, ...socialImages, ...guessedIcons],
		icons,
		socialImages,
	};
}

export function parseHandleDisplayName(rawTitle: string | null | undefined, handle: string): string {
	if (!rawTitle) {
		return "";
	}
	const id = handle.replace(/^@/, "");
	let title = rawTitle.trim();
	title = title.replace(/\s*(?:[|/]\s*X|on X)\s*$/i, "");
	title = title.replace(/\s*(?:[|/]\s*Instagram)\s*$/i, "");
	title = title.replace(new RegExp(`\\s*\\(@${id}\\)\\s*$`, "i"), "");
	title = title.replace(/\s+[|\-–—].*$/, "").trim();
	if (!title || title.toLowerCase() === `@${id.toLowerCase()}`) {
		return "";
	}
	return title.slice(0, 60);
}

function pickWebLogo(meta: PageMeta, fallback: string): string {
	return meta.icons[0] ?? meta.socialImages[0] ?? fallback;
}

function isPlatformChromeImage(url: string): boolean {
	try {
		const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
		if (host === "static.cdninstagram.com" && url.includes("/rsrc.php/")) {
			return true;
		}
		if (host === "instagram.com" && /apple-touch|favicon|\/static\//.test(url)) {
			return true;
		}
		if ((host === "abs.twimg.com" || host === "x.com" || host === "twitter.com") && !url.includes("profile_images")) {
			return true;
		}
		return false;
	} catch {
		return true;
	}
}

function pickHandleLogo(meta: PageMeta, fallback: string): string {
	return meta.socialImages.find((image) => !isPlatformChromeImage(image)) ?? fallback;
}

interface FetchedPage {
	html: string;
	finalUrl: string;
}

async function fetchText(
	url: string,
	fetchImpl: typeof fetch,
): Promise<FetchedPage | null> {
	if (!isPublicHttpUrl(url)) {
		return null;
	}
	try {
		const response = await fetchImpl(url, {
			redirect: "follow",
			credentials: "omit",
			headers: { Accept: "text/html,application/xhtml+xml", "User-Agent": USER_AGENT },
			signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
		});
		if (!response.ok) {
			return null;
		}
		const contentType = response.headers.get("content-type") ?? "";
		if (contentType && !contentType.includes("html") && !contentType.includes("xml") && !contentType.includes("text/")) {
			return null;
		}
		const finalUrl = response.url || url;
		if (!isPublicHttpUrl(finalUrl)) {
			return null;
		}
		const text = await response.text();
		return { html: text.slice(0, MAX_HTML_BYTES), finalUrl };
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

function handlePageUrls(target: ParsedListingTarget): string[] {
	if (target.kind === "x") {
		const handle = target.handle ?? target.label.replace(/^@/, "");
		return [`https://x.com/${handle}`, `https://twitter.com/${handle}`];
	}
	if (target.kind === "instagram") {
		return [target.canonicalUrl];
	}
	return [target.canonicalUrl];
}

function isLoginWallDescription(description: string): boolean {
	return /log in to instagram|create an account|see what.?s happening|join instagram/i.test(
		description,
	);
}

async function previewFromPages(
	urls: string[],
	target: ParsedListingTarget,
	fetchImpl: typeof fetch,
	pickLogo: (meta: PageMeta, fallback: string) => string,
	nameFromMeta: (meta: PageMeta) => string,
): Promise<ListingImagePreview> {
	const fallback = fallbackFromTarget(target);
	for (const url of urls) {
		const page = await fetchText(url, fetchImpl);
		if (!page) {
			continue;
		}
		const meta = extractPageMeta(page.html, page.finalUrl);
		const name = nameFromMeta(meta);
		const logoUrl = pickLogo(meta, fallback.logoUrl);
		const description = isLoginWallDescription(meta.description)
			? ""
			: meta.description.slice(0, 240);
		if (name !== fallback.name || logoUrl !== fallback.logoUrl || description) {
			return {
				...fallback,
				name,
				description,
				logoUrl,
			};
		}
	}
	return fallback;
}

/** Resolve name, description, and logo from a product URL or @handle. */
export async function resolveListingPreview(
	raw: string,
	options: ResolveListingPreviewOptions = {},
): Promise<ListingImagePreview | null> {
	const target = parseListingTarget(raw);
	if (!target) {
		return null;
	}

	const fetchImpl = options.fetch ?? fetch;

	if (target.kind === "x" || target.kind === "instagram") {
		const handle = target.handle ?? target.label.replace(/^@/, "");
		const withUnavatar = {
			...target,
			logoUrl: handleLogoUrl(target.kind, handle),
		};
		return previewFromPages(
			handlePageUrls(target),
			withUnavatar,
			fetchImpl,
			pickHandleLogo,
			(meta) => {
				const name = parseHandleDisplayName(meta.name, handle);
				if (!name || /^(instagram|x|twitter)$/i.test(name)) {
					return `@${handle}`;
				}
				return name;
			},
		);
	}

	return previewFromPages(
		[target.canonicalUrl],
		target,
		fetchImpl,
		pickWebLogo,
		(meta) => (meta.name?.replace(/\s+[|\-–—].*$/, "").trim() || target.label).slice(0, 60),
	);
}

/** Fetch only the listing logo for a product URL or @handle. */
export async function fetchListingLogo(
	raw: string,
	options: ResolveListingPreviewOptions = {},
): Promise<string | null> {
	const preview = await resolveListingPreview(raw, options);
	return preview?.logoUrl ?? null;
}

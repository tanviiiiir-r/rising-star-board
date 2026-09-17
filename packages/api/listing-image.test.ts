import { describe, expect, it, vi } from "vitest";

import {
	extractPageMeta,
	fetchListingLogo,
	handleLogoUrl,
	isPublicHttpUrl,
	parseHandleDisplayName,
	resolveListingPreview,
} from "../database/listing-image";
import {
	isListingTargetInput,
	listingLogoSrc,
	parseListingTarget,
} from "../database/listing-target";

const LINEAR_HTML = `
	<html>
		<head>
			<title>Linear — Plan and build products</title>
			<meta property="og:title" content="Linear">
			<meta name="description" content="The issue tracker you'll enjoy using.">
			<link rel="icon" href="/favicon.ico" sizes="32x32">
			<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">
			<meta property="og:image" content="https://linear.app/static/og.png">
		</head>
	</html>
`;

function htmlResponse(html: string, url: string) {
	return {
		ok: true,
		url,
		headers: new Headers({ "content-type": "text/html; charset=utf-8" }),
		text: async () => html,
	};
}

describe("isPublicHttpUrl", () => {
	it("allows public https hosts and blocks private targets", () => {
		expect(isPublicHttpUrl("https://linear.app")).toBe(true);
		expect(isPublicHttpUrl("https://facebook.com")).toBe(true);
		expect(isPublicHttpUrl("http://example.com/logo.png")).toBe(true);
		expect(isPublicHttpUrl("https://127.0.0.1/secret")).toBe(false);
		expect(isPublicHttpUrl("https://10.0.0.8/x")).toBe(false);
		expect(isPublicHttpUrl("https://192.168.1.4/x")).toBe(false);
		expect(isPublicHttpUrl("https://localhost/admin")).toBe(false);
		expect(isPublicHttpUrl("https://[::1]/admin")).toBe(false);
		expect(isPublicHttpUrl("https://[fc00::1]/admin")).toBe(false);
		expect(isPublicHttpUrl("file:///etc/passwd")).toBe(false);
		expect(isPublicHttpUrl("https://user:pass@example.com")).toBe(false);
	});
});

describe("handleLogoUrl", () => {
	it("uses unavatar for X and Instagram handles", () => {
		expect(handleLogoUrl("x", "vercel")).toBe("https://unavatar.io/twitter/vercel");
		expect(handleLogoUrl("instagram", "@figma")).toBe("https://unavatar.io/instagram/figma");
	});
});

describe("parseHandleDisplayName", () => {
	it("strips the X suffix and (@handle)", () => {
		expect(parseHandleDisplayName("Vercel (@vercel) / X", "vercel")).toBe("Vercel");
		expect(parseHandleDisplayName("@vercel", "vercel")).toBe("");
	});
});

describe("extractPageMeta", () => {
	it("prefers apple-touch-icon then og:image and reads title", () => {
		const meta = extractPageMeta(LINEAR_HTML, "https://linear.app/");
		expect(meta.name).toBe("Linear");
		expect(meta.description).toContain("issue tracker");
		expect(meta.icons[0]).toBe("https://linear.app/apple-touch-icon.png");
		expect(meta.images[0]).toBe("https://linear.app/apple-touch-icon.png");
		expect(meta.socialImages).toContain("https://linear.app/static/og.png");
		expect(meta.images).toContain("https://linear.app/static/og.png");
		expect(meta.images).toContain("https://linear.app/favicon.ico");
	});

	it("resolves relative icons against the page URL", () => {
		const meta = extractPageMeta(
			`<link rel="icon" href="assets/mark.svg">`,
			"https://www.notion.so/product",
		);
		expect(meta.images[0]).toBe("https://www.notion.so/assets/mark.svg");
	});
});

describe("parseListingTarget logos", () => {
	it("maps @handles to X unavatar and websites to a favicon", () => {
		expect(parseListingTarget("@vercel")?.logoUrl).toBe("https://unavatar.io/twitter/vercel");
		expect(parseListingTarget("https://x.com/linear")?.kind).toBe("x");
		expect(listingLogoSrc("https://stripe.com")).toContain("google.com/s2/favicons");
		expect(isListingTargetInput("@vercel")).toBe(true);
		expect(isListingTargetInput("not a target")).toBe(false);
	});
});

describe("resolveListingPreview", () => {
	it("reads logo and title from fetched HTML", async () => {
		const fetchImpl = vi.fn().mockResolvedValue(htmlResponse(LINEAR_HTML, "https://linear.app/"));
		const preview = await resolveListingPreview("https://linear.app", { fetch: fetchImpl });
		expect(preview?.name).toBe("Linear");
		expect(preview?.logoUrl).toBe("https://linear.app/apple-touch-icon.png");
		expect(preview?.description).toContain("issue tracker");
		expect(fetchImpl).toHaveBeenCalled();
	});

	it("uses the X profile photo for @handles instead of the site icon", async () => {
		const fetchImpl = vi.fn().mockResolvedValue(
			htmlResponse(
				`<meta property="og:title" content="Vercel (@vercel) / X">
				<meta property="og:image" content="https://pbs.twimg.com/profile_images/vercel.png">
				<link rel="apple-touch-icon" href="/apple-touch-icon.png">`,
				"https://x.com/vercel",
			),
		);
		const preview = await resolveListingPreview("@vercel", { fetch: fetchImpl });
		expect(preview?.kind).toBe("x");
		expect(preview?.name).toBe("Vercel");
		expect(preview?.logoUrl).toBe("https://pbs.twimg.com/profile_images/vercel.png");
	});

	it("ignores Instagram chrome images and uses unavatar", async () => {
		const fetchImpl = vi.fn().mockResolvedValue(
			htmlResponse(
				`<meta property="og:title" content="Instagram">
				<meta property="og:image" content="https://static.cdninstagram.com/rsrc.php/v4/yD/r/R0fBIMurK8v.png">`,
				"https://www.instagram.com/figma/",
			),
		);
		const preview = await resolveListingPreview("ig:figma", { fetch: fetchImpl });
		expect(preview?.logoUrl).toBe("https://unavatar.io/instagram/figma");
		expect(preview?.name).toBe("@figma");
	});

	it("falls back to unavatar when a handle page cannot be fetched", async () => {
		const fetchImpl = vi.fn().mockRejectedValue(new Error("blocked"));
		const preview = await resolveListingPreview("@vercel", { fetch: fetchImpl });
		expect(preview?.logoUrl).toBe("https://unavatar.io/twitter/vercel");
		expect(preview?.name).toBe("@vercel");
		expect(await fetchListingLogo("ig:figma", { fetch: fetchImpl })).toBe(
			"https://unavatar.io/instagram/figma",
		);
	});

	it("falls back to the Google favicon when a website cannot be fetched", async () => {
		const fetchImpl = vi.fn().mockRejectedValue(new Error("timeout"));
		const preview = await resolveListingPreview("https://stripe.com", { fetch: fetchImpl });
		expect(preview?.name).toBe("stripe.com");
		expect(preview?.logoUrl).toContain("google.com/s2/favicons");
	});

	it("returns null for empty or invalid input", async () => {
		expect(await resolveListingPreview("")).toBeNull();
		expect(await resolveListingPreview("not a target")).toBeNull();
	});
});

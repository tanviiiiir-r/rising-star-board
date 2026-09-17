import { describe, expect, it } from "vitest";

import {
	extractPageMeta,
	handleLogoUrl,
	isPublicHttpUrl,
} from "../database/listing-image";
import { listingLogoSrc, parseListingTarget } from "../database/listing-target";

describe("isPublicHttpUrl", () => {
	it("allows public https hosts and blocks private targets", () => {
		expect(isPublicHttpUrl("https://linear.app")).toBe(true);
		expect(isPublicHttpUrl("http://example.com/logo.png")).toBe(true);
		expect(isPublicHttpUrl("https://127.0.0.1/secret")).toBe(false);
		expect(isPublicHttpUrl("https://10.0.0.8/x")).toBe(false);
		expect(isPublicHttpUrl("https://192.168.1.4/x")).toBe(false);
		expect(isPublicHttpUrl("https://localhost/admin")).toBe(false);
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

describe("extractPageMeta", () => {
	it("prefers apple-touch-icon then og:image and reads title", () => {
		const html = `
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
		const meta = extractPageMeta(html, "https://linear.app/");
		expect(meta.name).toBe("Linear");
		expect(meta.description).toContain("issue tracker");
		expect(meta.images[0]).toBe("https://linear.app/apple-touch-icon.png");
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
	});
});

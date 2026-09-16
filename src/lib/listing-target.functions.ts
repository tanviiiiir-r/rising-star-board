import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { parseListingTarget, type ParsedListingTarget } from "./listing-target";

export type ResolvedListingTarget = ParsedListingTarget & {
  suggestedName: string;
};

async function ogTitle(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        accept: "text/html",
        "user-agent": "BidLadderBot/1.0",
      },
    });
    if (!response.ok) return null;
    const html = (await response.text()).slice(0, 50_000);
    const og =
      html.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
    const title = html.match(/<title[^>]*>([^<]+)/i);
    const value = (og?.[1] ?? title?.[1] ?? "").replace(/\s+/g, " ").trim();
    return value.slice(0, 60) || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export const resolveListingTarget = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ raw: z.string().trim().min(1).max(300) }).parse(data),
  )
  .handler(async ({ data }): Promise<ResolvedListingTarget | null> => {
    const parsed = parseListingTarget(data.raw);
    if (!parsed) return null;

    let suggestedName = parsed.kind === "web" ? parsed.hostname ?? parsed.label : parsed.label;
    if (parsed.kind === "web") {
      const title = await ogTitle(parsed.canonicalUrl);
      if (title) suggestedName = title;
    }

    return { ...parsed, suggestedName };
  });

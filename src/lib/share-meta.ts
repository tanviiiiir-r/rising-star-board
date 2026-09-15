import { publicSiteUrl } from "@/lib/site-url";

export const OG_IMAGE_PATH = "/og.png";

export function absoluteSiteUrl(path = "/"): string {
  const origin = publicSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!origin) return normalized;
  return normalized === "/" ? `${origin}/` : `${origin}${normalized}`;
}

export function defaultOgImageUrl(): string {
  return absoluteSiteUrl(OG_IMAGE_PATH);
}

export function defaultShareMeta({
  title,
  description,
  path = "/",
  type = "website",
}: {
  title: string;
  description: string;
  path?: string;
  type?: string;
}) {
  const url = absoluteSiteUrl(path);
  const image = defaultOgImageUrl();
  return [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: "Bid Ladder" },
    { property: "og:site_name", content: "Bid Ladder" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
}

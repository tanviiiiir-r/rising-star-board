"use client";

import { useState } from "react";

import { cn } from "@repo/ui";

import { listingLogoSrc } from "../lib/listing-target";

export function ListingLogo({
	name,
	url,
	logoUrl,
	size = "md",
	className,
}: {
	name: string;
	url: string;
	logoUrl?: string | null;
	size?: "sm" | "md";
	className?: string;
}) {
	const src = listingLogoSrc(url, logoUrl);
	const [failed, setFailed] = useState(false);
	const initial = (name.trim()[0] ?? "?").toUpperCase();
	const dim = size === "sm" ? "size-8" : "size-11";

	if (!src || failed) {
		return (
			<div
				aria-hidden
				className={cn(
					"flex shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-medium text-foreground",
					dim,
					className,
				)}
			>
				{initial}
			</div>
		);
	}

	return (
		<img
			src={src}
			alt=""
			className={cn("shrink-0 rounded-xl bg-muted object-cover", dim, className)}
			onError={() => setFailed(true)}
		/>
	);
}

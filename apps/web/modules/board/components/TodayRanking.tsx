import Link from "next/link";
import type { BoardListing } from "@repo/database/board-types";

import { formatCents } from "../lib/format";

const CAP = 10;

/**
 * Today's live UTC board, condensed. Real rows only — never padded with
 * placeholders when the board is short.
 */
export function TodayRanking({ listings }: { listings: BoardListing[] }) {
	const rows = listings.slice(0, CAP);

	return (
		<aside
			aria-label="Today's ranking"
			className="rounded-2xl border border-border bg-card/60 p-4 shadow-[var(--shadow-card)]"
		>
			<div className="flex items-center justify-between gap-2">
				<h2 className="flex items-center gap-2 font-display text-sm font-semibold">
					<span className="size-1.5 rounded-full bg-primary" />
					Today's ranking
				</h2>
				<Link
					href="/?board=today"
					className="text-xs text-primary underline-offset-2 hover:underline"
				>
					See all
				</Link>
			</div>

			<ul className="mt-3 flex flex-col">
				{rows.map((listing) => (
					<li key={listing.id}>
						<Link
							href={`/l/${listing.slug}`}
							className="flex items-center gap-3 rounded-lg px-1.5 py-2 transition-colors hover:bg-surface"
						>
							<span className="rank-number w-7 shrink-0 text-xs text-muted-foreground">
								#{listing.rank ?? "—"}
							</span>
							<span className="min-w-0 flex-1 truncate text-sm">{listing.name}</span>
							<span className="allocation-price shrink-0 text-sm">
								{formatCents(listing.allocationCents)}
							</span>
						</Link>
					</li>
				))}
			</ul>
		</aside>
	);
}

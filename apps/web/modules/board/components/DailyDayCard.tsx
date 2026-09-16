import Link from "next/link";
import type { DailyBoardPreview } from "@repo/database/board-types";
import { buttonVariants, cn } from "@repo/ui";

import { formatUtcDateLong } from "../lib/format";
import { DailyListingRow } from "./DailyListingRow";
import { UtcCountdown } from "./UtcCountdown";

export function DailyDayCard({ board }: { board: DailyBoardPreview }) {
	const label = formatUtcDateLong(board.date);
	const countLabel = `${board.listingCount} ${board.listingCount === 1 ? "listing" : "listings"}`;

	return (
		<article
			className={cn("rounded-2xl p-5", board.live ? "primary-wash" : "border border-border bg-card")}
		>
			<div className="flex flex-wrap items-start justify-between gap-2">
				<div className="flex flex-wrap items-center gap-2">
					<h2 className="text-base font-medium tracking-[-0.022em]">{label}</h2>
					{board.live ? (
						<span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
							<span className="size-1.5 rounded-full bg-primary-foreground" aria-hidden />
							Live
						</span>
					) : null}
				</div>
				<p className="text-xs text-primary sm:text-sm">
					{board.live ? (
						<>
							<UtcCountdown /> · {countLabel}
						</>
					) : (
						countLabel
					)}
				</p>
			</div>

			{board.live ? (
				<p className="mt-1 text-sm text-primary">
					This day is still open for claims. It closes at midnight UTC.
				</p>
			) : null}

			{board.listings.length === 0 ? (
				<p className="mt-4 text-sm text-muted-foreground">No ranks yet this day.</p>
			) : (
				<ul className="mt-4 flex flex-col gap-2">
					{board.listings.map((listing) => (
						<li key={listing.id}>
							<DailyListingRow listing={listing} />
						</li>
					))}
				</ul>
			)}

			<div className={cn("mt-4 flex flex-col gap-2 sm:flex-row", !board.live && "sm:justify-end")}>
				{board.live ? (
					<Link
						href="/?board=today#claim"
						className={cn(buttonVariants({ variant: "primary", size: "lg" }), "h-10 flex-1 rounded-full")}
					>
						Claim a rank
					</Link>
				) : null}
				{board.live ? (
					<Link
						href="/?board=today"
						className={cn(
							buttonVariants({ variant: "outline", size: "lg" }),
							"h-10 flex-1 rounded-full",
						)}
					>
						Show all ranks
					</Link>
				) : (
					<Link
						href={`/daily/${board.date}`}
						className={cn(
							buttonVariants({ variant: "outline", size: "lg" }),
							"h-10 w-full rounded-full sm:w-auto sm:min-w-40",
						)}
					>
						Show all ranks
					</Link>
				)}
			</div>
		</article>
	);
}

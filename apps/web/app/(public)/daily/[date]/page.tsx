import { ListingCard } from "@board/components/ListingCard";
import { formatUtcDateLong } from "@board/lib/format";
import { getBoardListings, utcDateString } from "@repo/database";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const revalidate = 15;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ date: string }>;
}): Promise<Metadata> {
	const { date } = await params;
	const label = DATE.test(date) ? formatUtcDateLong(date) : "Daily";
	return {
		title: { absolute: `${label} — Bid Ladder` },
		description: `Closed UTC day board for ${label}. Rank is what was allocated that day.`,
	};
}

export default async function DailyDatePage({
	params,
}: {
	params: Promise<{ date: string }>;
}) {
	const { date } = await params;
	if (!DATE.test(date)) {
		notFound();
	}
	if (date === utcDateString()) {
		redirect("/?board=today");
	}

	const listings = await getBoardListings({ board: "daily", date }).catch(() => []);
	const label = formatUtcDateLong(date);

	return (
		<main className="board-grid-bg">
			<div className="mx-auto w-full max-w-[80rem] px-4 pb-8 pt-10 sm:px-8">
				<p className="text-sm text-muted-foreground">
					<Link href="/daily" className="hover:text-foreground">
						Daily
					</Link>
					<span aria-hidden> · </span>
					Closed
				</p>
				<h1 className="mt-2 font-display text-4xl tracking-[-0.03em] sm:text-5xl">{label}</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					This day closed at midnight UTC. Rank is what was allocated that day.
				</p>

				<div className="mt-10 flex flex-col gap-3">
					{listings.length === 0 ? (
						<p className="text-sm text-muted-foreground">No ranks were frozen for this day.</p>
					) : (
						listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
					)}
				</div>
			</div>
		</main>
	);
}

import { DailyDayCard } from "@board/components/DailyDayCard";
import { loadDailyOverview } from "@board/lib/cached-board";
import { formatUtcDateLong } from "@board/lib/format";
import type { Metadata } from "next";

export const revalidate = 15;

export const metadata: Metadata = {
	title: { absolute: "Daily — Bid Ladder" },
	description:
		"Each UTC day gets its own board. Rank is what you allocated that day. Today stays live until midnight UTC.",
};

export default async function DailyPage() {
	const data = await loadDailyOverview().catch(() => ({
		launchedOn: "",
		boards: [],
	}));
	const since =
		data.launchedOn && data.boards.length > 1 ? formatUtcDateLong(data.launchedOn) : null;

	return (
		<main className="board-grid-bg">
			<div className="mx-auto w-full max-w-3xl px-4 pb-8 pt-10 sm:px-8">
				<h1 className="font-display text-4xl tracking-[-0.03em] sm:text-5xl">Daily</h1>
				<p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
					{since
						? `Each UTC day since ${since} gets its own board.`
						: "Each UTC day gets its own board."}{" "}
					Rank is what you allocated that day. Today stays live until midnight UTC, then the day
					closes.
				</p>

				<ul className="mt-8 flex flex-col gap-6">
					{data.boards.map((board) => (
						<li key={board.date}>
							<DailyDayCard board={board} />
						</li>
					))}
				</ul>
			</div>
		</main>
	);
}

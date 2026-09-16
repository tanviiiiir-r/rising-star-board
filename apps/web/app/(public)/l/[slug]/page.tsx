import { ListingDetail } from "@board/components/ListingDetail";
import { BOARDS, getBoardListingBySlug, getBoardListings, type BoardKind } from "@repo/database";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function parseBoard(value?: string): BoardKind {
	return value && (BOARDS as readonly string[]).includes(value) ? (value as BoardKind) : "all_time";
}

const BOARD_LABEL: Record<BoardKind, string> = {
	all_time: "All-time",
	today: "Today",
	daily: "Daily",
};

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	return {
		title: slug.replace(/-/g, " "),
	};
}

export default async function ListingPage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ board?: string }>;
}) {
	const { slug } = await params;
	const { board: boardParam } = await searchParams;
	const board = parseBoard(boardParam);

	const [listing, peers] = await Promise.all([
		getBoardListingBySlug(slug, board),
		getBoardListings({ board }),
	]);
	if (!listing) {
		notFound();
	}

	const ranked = peers.find((row) => row.id === listing.id) ?? listing;
	const currentRank = ranked.rank;
	const above =
		currentRank != null
			? (peers.find((row) => row.rank === currentRank - 1) ?? null)
			: null;

	return <ListingDetail listing={ranked} above={above} boardLabel={BOARD_LABEL[board]} />;
}

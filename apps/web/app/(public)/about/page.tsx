import { formatCents, formatCount } from "@board/lib/format";
import { getBoardStats } from "@repo/database";

export const revalidate = 15;

export default async function AboutPage() {
	const stats = await getBoardStats().catch(() => ({
		listingCount: 0,
		allocatedCents: 0,
		clicks: 0,
		launchedAt: null,
	}));

	return (
		<div className="mx-auto max-w-2xl space-y-8 px-4 py-10 sm:px-8">
			<div>
				<h1 className="text-3xl font-medium tracking-tight">About</h1>
				<p className="mt-3 text-muted-foreground">
					Bid Ladder is a public allocation board. Rank is what you allocated — nothing else. No
					ads, no API keys, no revenue sharing. These totals are live listings only.
				</p>
			</div>
			<div className="grid gap-3 sm:grid-cols-3">
				<div className="rounded-2xl bg-card p-5">
					<p className="text-2xl tabular-nums">{formatCount(stats.listingCount)}</p>
					<p className="mt-1 text-sm text-muted-foreground">Live listings</p>
				</div>
				<div className="rounded-2xl bg-card p-5">
					<p className="text-2xl tabular-nums">{formatCents(stats.allocatedCents)}</p>
					<p className="mt-1 text-sm text-muted-foreground">Allocated</p>
				</div>
				<div className="rounded-2xl bg-card p-5">
					<p className="text-2xl tabular-nums">{formatCount(stats.clicks)}</p>
					<p className="mt-1 text-sm text-muted-foreground">Unique views</p>
				</div>
			</div>
		</div>
	);
}

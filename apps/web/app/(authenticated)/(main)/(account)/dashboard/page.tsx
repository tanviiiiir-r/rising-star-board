import { DashboardListings } from "@board/components/DashboardListings";
import { DashboardToasts } from "@board/components/DashboardToasts";
import { formatCents, formatPoints } from "@board/lib/format";
import { getSession } from "@auth/lib/server";
import { getBoardListings, getOrCreateWallet, listListingsForOwner } from "@repo/database";
import { Button } from "@repo/ui";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
	const session = await getSession();
	if (!session) {
		redirect("/login");
	}

	const [listings, wallet, board] = await Promise.all([
		listListingsForOwner(session.user.id),
		getOrCreateWallet(session.user.id),
		getBoardListings({ board: "all_time" }).catch(() => []),
	]);

	const availableCents = wallet.availableCents;
	const committedCents = listings.reduce((sum, listing) => sum + listing.allocationCents, 0);
	const isAdmin = session.user.role === "admin";

	return (
		<main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8">
			<Suspense>
				<DashboardToasts />
			</Suspense>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="font-display text-[2rem] leading-tight">My listings</h1>
				<div className="flex gap-2">
					{isAdmin ? (
						<Button asChild variant="secondary" size="sm">
							<Link href="/admin/review">Review queue</Link>
						</Button>
					) : null}
					<Button asChild size="sm" variant="primary">
						<Link href="/credits?method=credits">Buy credits</Link>
					</Button>
					<Button asChild size="sm" variant="secondary">
						<Link href="/submit">New listing</Link>
					</Button>
				</div>
			</div>

			<section className="mt-4 grid grid-cols-3 gap-3 surface-card p-5">
				<div>
					<p className="text-[11px] uppercase tracking-wide text-muted-foreground">Available</p>
					<p className="rank-number text-xl">{formatCents(availableCents)}</p>
				</div>
				<div>
					<p className="text-[11px] uppercase tracking-wide text-muted-foreground">Committed</p>
					<p className="rank-number text-xl">{formatCents(committedCents)}</p>
				</div>
				<div>
					<p className="text-[11px] uppercase tracking-wide text-muted-foreground">Points</p>
					<p className="text-xl font-medium tabular-nums">
						{formatPoints(wallet.availablePoints)}
					</p>
				</div>
			</section>

			<DashboardListings listings={listings} board={board} availableCents={availableCents} />
		</main>
	);
}

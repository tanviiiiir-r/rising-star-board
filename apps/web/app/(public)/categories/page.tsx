import { loadCategoriesOverview } from "@board/lib/cached-board";
import { formatCount } from "@board/lib/format";
import Link from "next/link";

export const revalidate = 15;

export default async function CategoriesPage() {
	const { hottest, categories } = await loadCategoriesOverview().catch(() => ({
		hottest: [],
		categories: [],
	}));

	return (
		<div className="mx-auto w-full max-w-[80rem] space-y-10 px-4 py-10 sm:px-8">
			<div>
				<h1 className="text-3xl font-medium tracking-tight">Categories</h1>
				<p className="mt-2 text-muted-foreground">Hottest by live listing count. Nothing invented.</p>
			</div>
			{hottest.length > 0 ? (
				<section className="space-y-3">
					<h2 className="text-sm text-muted-foreground">Hottest</h2>
					<div className="grid gap-3 md:grid-cols-3">
						{hottest.map((category) => (
							<Link
								key={category.id}
								href={`/?category=${category.slug}`}
								className="rounded-2xl border bg-card p-5"
							>
								<p className="font-medium">{category.name}</p>
								<p className="text-sm text-muted-foreground">
									{formatCount(category.listingCount)} live
								</p>
							</Link>
						))}
					</div>
				</section>
			) : null}
			<section className="grid gap-4 md:grid-cols-2">
				{categories.map((category) => (
					<div key={category.id} className="rounded-2xl border bg-card p-5">
						<div className="flex items-baseline justify-between">
							<Link href={`/?category=${category.slug}`} className="font-medium">
								{category.name}
							</Link>
							<span className="text-sm text-muted-foreground">
								{formatCount(category.listingCount)}
							</span>
						</div>
						<ol className="mt-3 space-y-1 text-sm">
							{category.listings.length === 0 ? (
								<li className="text-muted-foreground">No live listings</li>
							) : (
								category.listings.map((listing) => (
									<li key={listing.id}>
										<Link href={`/l/${listing.slug}`}>
											#{listing.rank} {listing.name}
										</Link>
									</li>
								))
							)}
						</ol>
					</div>
				))}
			</section>
		</div>
	);
}

import { SubmitListingForm } from "@board/components/SubmitListingForm";
import { listActiveCategories } from "@repo/database";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
	const categories = await listActiveCategories();

	return (
		<main className="mx-auto w-full max-w-lg px-4 pb-16 pt-8">
			<div>
				<h1 className="font-display text-[2rem] leading-tight">Submit listing</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Claim a rank with credits, then submit the product that holds it.
				</p>
			</div>
			<div className="mt-6 surface-card p-6">
				<SubmitListingForm categories={categories} />
			</div>
		</main>
	);
}

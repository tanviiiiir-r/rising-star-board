import { CreditCheckoutForm } from "@board/components/CreditCheckoutForm";

export default async function CreditsPage({
	searchParams,
}: {
	searchParams: Promise<{ cents?: string; method?: string; canceled?: string }>;
}) {
	const params = await searchParams;
	const cents = Number(params.cents);
	const initialCents = Number.isInteger(cents) && cents > 0 ? cents : 1000;
	const method = params.method === "points" ? "points" : "credits";

	return (
		<main className="mx-auto w-full max-w-md px-4 pb-16 pt-8">
			<h1 className="font-display text-[2rem] leading-tight">Buy credits</h1>
			<p className="mt-2 text-sm text-muted-foreground">
				Add credits to your wallet, then allocate them on a listing you own. Homepage claims open
				Stripe directly and do not use this page.
			</p>
			{params.canceled === "1" ? (
				<p className="mt-3 text-sm text-fall">Checkout canceled. Nothing was charged.</p>
			) : null}
			<div className="mt-6 surface-card p-6">
				<CreditCheckoutForm initialCents={initialCents} method={method} />
			</div>
		</main>
	);
}

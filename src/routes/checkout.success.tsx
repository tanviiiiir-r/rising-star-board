import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { getClaimCheckoutStatus } from "@/lib/stripe.functions";

type SuccessSearch = { session_id?: string };

export const Route = createFileRoute("/checkout/success")({
  validateSearch: (search: Record<string, unknown>): SuccessSearch =>
    typeof search["session_id"] === "string" ? { session_id: search["session_id"] } : {},
  head: () => ({
    meta: [{ title: "Rank claimed — Bid Ladder" }],
  }),
  component: CheckoutSuccessPage,
});

function CheckoutSuccessPage() {
  const { session_id: sessionId } = Route.useSearch();
  const status = useQuery({
    queryKey: ["claim-checkout", sessionId],
    queryFn: () => getClaimCheckoutStatus({ data: { sessionId: sessionId! } }),
    enabled: Boolean(sessionId),
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="board-grid-bg">
        <div className="mx-auto w-full max-w-[32rem] px-4 py-16">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h1 className="font-display text-2xl tracking-[-0.02em]">Payment confirmed</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The listing goes live when payment confirms. That usually takes a few seconds.
              {status.data?.email
                ? ` We attached it to ${status.data.email}. Sign in with that email later to manage the listing and apply points.`
                : " Sign in later with the email you used at checkout to manage the listing and apply points."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild className="rounded-full">
                <Link to="/">View the board</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/auth" search={{ redirect: "/dashboard" }}>
                  Sign in for points
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/SiteHeader";
import { TermsAgreeBox } from "@/components/checkout/TermsAgreeBox";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { getMyWallet } from "@/lib/allocation.functions";
import { formatCents, formatPoints } from "@/lib/format";
import { parseListingTarget } from "@/lib/listing-target";
import { boardQuery, categoriesQuery } from "@/lib/queries";
import { planRankFunding, previewRankForAmount } from "@/lib/ranking";
import { createClaimCheckout, getStripeStatus } from "@/lib/stripe.functions";

type CheckoutSearch = {
  url?: string;
  categoryId?: string;
  cents?: number;
  name?: string;
  logoUrl?: string;
  method?: "credits" | "points";
  canceled?: boolean;
};

function parseCents(value: unknown): number | undefined {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isInteger(n) || n <= 0) return undefined;
  return n;
}

export const Route = createFileRoute("/checkout/")({
  validateSearch: (search: Record<string, unknown>): CheckoutSearch => {
    const out: CheckoutSearch = {};
    if (typeof search["url"] === "string") out.url = search["url"];
    if (typeof search["categoryId"] === "string") out.categoryId = search["categoryId"];
    if (typeof search["name"] === "string") out.name = search["name"];
    if (typeof search["logoUrl"] === "string") out.logoUrl = search["logoUrl"];
    const cents = parseCents(search["cents"]);
    if (cents != null) out.cents = cents;
    if (search["method"] === "points" || search["method"] === "credits") {
      out.method = search["method"];
    }
    if (
      search["canceled"] === true ||
      search["canceled"] === "1" ||
      search["canceled"] === "true"
    ) {
      out.canceled = true;
    }
    return out;
  },
  head: () => ({
    meta: [
      { title: "Confirm this rank — Bid Ladder" },
      {
        name: "description",
        content: "Check the rank and price, then continue to checkout.",
      },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useSession();
  const [agreed, setAgreed] = useState(false);
  const [applyPoints, setApplyPoints] = useState(search.method === "points");

  const cents = search.cents ?? 0;
  const parsed = search.url ? parseListingTarget(search.url) : null;
  const method = applyPoints && session ? "points" : "credits";

  const categories = useQuery(categoriesQuery());
  const board = useQuery(boardQuery("all", "all_time"));
  const stripe = useQuery({ queryKey: ["stripe-status"], queryFn: () => getStripeStatus() });
  const wallet = useQuery({
    queryKey: ["my-wallet"],
    queryFn: () => getMyWallet(),
    enabled: Boolean(session),
  });

  const categoryName =
    categories.data?.find((category) => category.id === search.categoryId)?.name ?? "Category";
  const rank = previewRankForAmount(board.data ?? [], cents) ?? 1;
  const availablePoints = wallet.data?.availablePoints ?? 0;
  const availableCents = wallet.data?.availableCents ?? 0;
  const funding = planRankFunding({
    neededCents: cents,
    availableCents: session ? availableCents : 0,
    availablePoints: session ? availablePoints : 0,
    method,
  });
  const dueNow = funding.leftoverCents;
  const canUsePoints = Boolean(session) && availablePoints > 0;
  const stripeReady = stripe.data?.configured ?? false;
  const missing =
    !parsed || !search.categoryId || !search.cents ? "Claim a rank from the board first." : null;

  const authRedirect = useMemo(() => {
    const params = new URLSearchParams();
    if (search.url) params.set("url", search.url);
    if (search.categoryId) params.set("categoryId", search.categoryId);
    if (search.cents) params.set("cents", String(search.cents));
    if (search.name) params.set("name", search.name);
    if (search.logoUrl) params.set("logoUrl", search.logoUrl);
    params.set("method", method);
    return `/checkout?${params.toString()}`;
  }, [search, method]);

  const checkout = useMutation({
    mutationFn: async () => {
      const timeout = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("Stripe is taking too long. Refresh and try again.")),
          25_000,
        );
      });
      return Promise.race([
        createClaimCheckout({
          data: {
            url: parsed?.canonicalUrl ?? search.url ?? "",
            categoryId: search.categoryId ?? "",
            cents,
            name: search.name,
            logoUrl: search.logoUrl,
            method,
            agreedToTerms: true as const,
          },
        }),
        timeout,
      ]);
    },
    onSuccess: (result) => {
      if (result.status === "stripe") {
        window.location.assign(result.url);
        return;
      }
      toast.success("Rank claimed. Your listing is live.");
      void navigate({ to: "/l/$slug", params: { slug: result.slug } });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const busy = checkout.isPending;
  const canPay =
    Boolean(agreed && !missing && !busy && (dueNow === 0 || stripeReady || stripe.isLoading));

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="board-grid-bg">
        <div className="mx-auto w-full max-w-[32rem] px-4 py-10 sm:py-16">
          {search.canceled ? (
            <p className="mb-4 rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
              Checkout was canceled. Nothing was charged.
            </p>
          ) : null}

          <section className="rounded-2xl border border-border bg-card p-6 shadow-lg">
            <h1 className="font-display text-xl tracking-[-0.02em]">Confirm this rank</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Check the rank and price, then agree to the Terms of Service to continue.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-6 rounded-xl border border-border bg-muted/40 px-4 py-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Rank
                </p>
                <p className="mt-1 font-display text-3xl leading-none tracking-[-0.03em]">#{rank}</p>
                <p className="mt-2 text-sm text-muted-foreground">{categoryName}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Price
                </p>
                <p className="allocation-price mt-1 text-3xl leading-none">{formatCents(cents)}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {dueNow === cents ? "Due now" : `Due now ${formatCents(dueNow)}`}
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              A listing at that rank on the public board. It goes live when payment confirms. Someone
              else can claim a higher rank.
            </p>

            {sessionLoading ? (
              <p className="mt-5 text-sm text-muted-foreground">Checking account…</p>
            ) : session ? (
              <div className="mt-5 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
                <p className="text-foreground">Signed in · points are available on this claim.</p>
                {canUsePoints ? (
                  <label className="mt-3 flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 size-4 accent-primary"
                      checked={applyPoints}
                      onChange={(event) => setApplyPoints(event.target.checked)}
                    />
                    <span className="text-muted-foreground">
                      Apply points toward this rank ({formatPoints(availablePoints)} available). 1
                      point = 1 cent.
                    </span>
                  </label>
                ) : (
                  <p className="mt-2 text-muted-foreground">
                    No points in this wallet yet. You can still claim the rank with credits or a
                    card.
                  </p>
                )}
                {availableCents > 0 ? (
                  <p className="mt-2 text-muted-foreground">
                    Wallet covers {formatCents(funding.alreadyCoveredCents)} of this price.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                Checking out as a guest. You can buy this rank now, but you will not receive point
                benefits.{" "}
                <Link
                  to="/auth"
                  search={{ redirect: authRedirect }}
                  className="text-primary underline underline-offset-2"
                >
                  Sign in to apply points
                </Link>
                .
              </div>
            )}

            {missing ? (
              <p className="mt-5 text-sm text-fall">
                {missing}{" "}
                <Link to="/" className="text-primary underline underline-offset-2">
                  Go to the board
                </Link>
                .
              </p>
            ) : null}

            {!stripe.isLoading && !stripeReady && dueNow > 0 ? (
              <p className="mt-5 rounded-xl border border-fall/40 bg-fall/10 px-3 py-2 text-sm text-fall">
                Checkout is not configured. Set <code>STRIPE_SECRET_KEY</code> to take card payments.
              </p>
            ) : null}

            <div className="mt-5">
              <TermsAgreeBox checked={agreed} onCheckedChange={setAgreed} id="checkout-agree-terms" />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button asChild type="button" variant="outline" className="rounded-full px-5">
                <Link to="/">Cancel</Link>
              </Button>
              <Button
                type="button"
                className="rounded-full px-5"
                disabled={!canPay || Boolean(missing)}
                onClick={() => void checkout.mutate()}
              >
                {busy
                  ? dueNow > 0
                    ? "Opening Stripe…"
                    : "Claiming…"
                  : dueNow === 0
                    ? "Claim rank"
                    : "Continue to checkout"}
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { LEGAL } from "@/lib/legal";
import { defaultShareMeta } from "@/lib/share-meta";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: `Privacy — ${LEGAL.brand}` },
      {
        name: "description",
        content: "We store the email and listing you use to claim a rank, plus payment records from Stripe.",
      },
      ...defaultShareMeta({
        title: `Privacy — ${LEGAL.brand}`,
        description: "What Bid Ladder stores for rank claims and payments.",
        path: "/privacy",
        type: "article",
      }),
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8">
        <h1 className="font-display text-[2.5rem] leading-tight tracking-[-0.02em]">Privacy</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {LEGAL.brand} stores the email and listing you use to claim a rank, plus Stripe payment
          identifiers needed to apply credits. Guest claims create an account for that checkout
          email so you can sign in later and manage the listing.
        </p>
        <SiteFooter />
      </main>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { LEGAL } from "@/lib/legal";
import { defaultShareMeta } from "@/lib/share-meta";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: `Terms of Service — ${LEGAL.brand}` },
      {
        name: "description",
        content: "Credits buy a public rank. Payment confirms the listing. Cash refunds are not offered.",
      },
      ...defaultShareMeta({
        title: `Terms of Service — ${LEGAL.brand}`,
        description: "Credits buy a public rank. Payment confirms the listing.",
        path: "/terms",
        type: "article",
      }),
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8">
        <h1 className="font-display text-[2.5rem] leading-tight tracking-[-0.02em]">Terms of Service</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {LEGAL.brand} sells credits that you allocate to a listing. Allocation is the rank. A
          claimed listing goes live when payment confirms. Someone else can take a higher rank by
          allocating more. Payments are not refundable as cash.
        </p>
        <SiteFooter />
      </main>
    </div>
  );
}

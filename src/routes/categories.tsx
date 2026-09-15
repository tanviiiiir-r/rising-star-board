import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import {
  CategoryOverviewCard,
  HottestCategoryCard,
} from "@/components/board/CategoryOverviewCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { categoriesOverviewQuery } from "@/lib/queries";
import { publicSiteUrl } from "@/lib/site-url";

function categoriesPageUrl() {
  const origin = publicSiteUrl();
  return origin ? `${origin}/categories` : "/categories";
}

export const Route = createFileRoute("/categories")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(categoriesOverviewQuery());
  },
  head: () => ({
    meta: [
      { title: "Categories — Bid Ladder" },
      {
        name: "description",
        content: "Every category has its own ranking. Pick one to see who leads it.",
      },
      { property: "og:title", content: "Categories — Bid Ladder" },
      {
        property: "og:description",
        content: "Every category has its own ranking. Pick one to see who leads it.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: categoriesPageUrl() },
    ],
    links: [{ rel: "canonical", href: categoriesPageUrl() }],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data } = useSuspenseQuery(categoriesOverviewQuery());

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="board-grid-bg">
        <div className="mx-auto w-full max-w-[80rem] px-4 pb-8 pt-10 sm:px-8">
          <h1 className="font-display text-4xl tracking-[-0.03em] sm:text-5xl">Categories</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Every category has its own ranking. Pick one to see who leads it.
          </p>

          {data.hottest.length > 0 ? (
            <section className="mt-8 rounded-3xl border border-border bg-card p-5 sm:p-6">
              <h2 className="text-sm font-medium">Most active categories</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Where ranks are getting claimed right now — and who is holding the top spot.
              </p>
              <ul className="mt-4 grid gap-3 md:grid-cols-3">
                {data.hottest.map((category, index) => (
                  <li key={category.id}>
                    <HottestCategoryCard
                      category={category}
                      hottest={index === 0}
                      place={index + 1}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {data.categories.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">No categories yet.</p>
          ) : (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.categories.map((category) => (
                <li key={category.id}>
                  <CategoryOverviewCard category={category} />
                </li>
              ))}
            </ul>
          )}

          <SiteFooter />
        </div>
      </main>
    </div>
  );
}

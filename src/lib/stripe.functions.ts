import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { parseListingTarget } from "@/lib/listing-target";
import { optionalAuth } from "@/lib/optional-auth.server";
import { RANKING, planRankFunding } from "@/lib/ranking";

const claimCheckoutSchema = z.object({
  url: z.string().trim().min(1).max(300),
  categoryId: z.string().uuid(),
  cents: z.number().int().positive(),
  name: z.string().trim().max(60).optional(),
  logoUrl: z
    .string()
    .trim()
    .max(500)
    .optional()
    .refine((value) => {
      if (!value) return true;
      try {
        return new URL(value).protocol === "https:";
      } catch {
        return false;
      }
    }, "Logo must be an https URL"),
  method: z.enum(["credits", "points"]).default("credits"),
  agreedToTerms: z.literal(true),
});

export type ClaimCheckoutResult =
  | { status: "stripe"; url: string; sessionId: string }
  | { status: "allocated"; slug: string };

export const getStripeStatus = createServerFn({ method: "GET" }).handler(async () => {
  return { configured: Boolean(process.env["STRIPE_SECRET_KEY"]?.trim()) };
});

export const createStripeCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        cents: z.number().int().positive(),
        method: z.enum(["credits", "points"]).default("credits"),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    if (data.cents % RANKING.incrementCents !== 0) {
      throw new Error(`Amount must be in ${RANKING.incrementCents}-cent increments.`);
    }
    const { createCreditCheckoutSession, isStripeConfigured, publicOriginFromRequest } =
      await import("@/lib/stripe.server");
    if (!isStripeConfigured()) {
      throw new Error("Checkout is not configured. Set STRIPE_SECRET_KEY.");
    }
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    const origin = publicOriginFromRequest(request);
    return createCreditCheckoutSession({
      userId: context.userId,
      cents: data.cents,
      origin,
      method: data.method,
    });
  });

export const createClaimCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => claimCheckoutSchema.parse(data))
  .handler(async ({ data }): Promise<ClaimCheckoutResult> => {
    const target = parseListingTarget(data.url);
    if (!target) throw new Error("Enter a website or X @handle");
    if (data.cents % RANKING.incrementCents !== 0) {
      throw new Error(`Amount must be in ${RANKING.incrementCents}-cent increments.`);
    }
    if (data.cents < RANKING.minVisibleCents) {
      throw new Error(`Minimum claim is $${RANKING.minVisibleCents / 100}.`);
    }

    const auth = await optionalAuth();
    if (data.method === "points" && !auth) {
      throw new Error("Sign in to apply points. Guests pay the full price.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let availableCents = 0;
    let availablePoints = 0;
    let currentAllocation = 0;
    if (auth) {
      const [{ data: wallet }, { data: listing }] = await Promise.all([
        supabaseAdmin
          .from("wallets")
          .select("available_cents, available_points")
          .eq("user_id", auth.userId)
          .maybeSingle(),
        supabaseAdmin
          .from("listings")
          .select("allocation_cents, slug")
          .eq("owner_id", auth.userId)
          .eq("url", target.canonicalUrl)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      availableCents = wallet?.available_cents ?? 0;
      availablePoints = wallet?.available_points ?? 0;
      currentAllocation = listing?.allocation_cents ?? 0;
      if (listing?.slug && data.cents <= currentAllocation) {
        return { status: "allocated", slug: listing.slug };
      }
    }

    const neededCents = Math.max(RANKING.incrementCents, data.cents - currentAllocation);
    const funding = planRankFunding({
      neededCents,
      availableCents,
      availablePoints,
      method: data.method,
    });
    const leftoverCents = funding.leftoverCents;
    const applyPoints = funding.applyPoints;

    const draft = {
      url: target.canonicalUrl,
      categoryId: data.categoryId,
      cents: data.cents,
      name: data.name || target.label,
      logoUrl: data.logoUrl || target.logoUrl,
    };

    if (leftoverCents === 0) {
      if (!auth) throw new Error("Sign in or pay with a card to claim this rank.");
      const { applyRankClaimPayment } = await import("@/lib/claim.server");
      const result = await applyRankClaimPayment({
        ownerId: auth.userId,
        paidCents: 0,
        applyPoints,
        draft,
        idempotencyKey: `claim-wallet-${auth.userId}-${target.canonicalUrl}-${data.cents}`,
      });
      return { status: "allocated", slug: result.slug };
    }

    const {
      createRankClaimCheckoutSession,
      isStripeConfigured,
      publicOriginFromRequest,
    } = await import("@/lib/stripe.server");
    if (!isStripeConfigured()) {
      throw new Error("Checkout is not configured. Set STRIPE_SECRET_KEY.");
    }
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    const origin = publicOriginFromRequest(request);
    const cancel = new URLSearchParams({
      url: draft.url,
      categoryId: draft.categoryId,
      cents: String(draft.cents),
      canceled: "1",
    });
    if (draft.name) cancel.set("name", draft.name);
    if (draft.logoUrl) cancel.set("logoUrl", draft.logoUrl);
    if (data.method === "points") cancel.set("method", "points");

    const session = await createRankClaimCheckoutSession({
      origin,
      leftoverCents,
      targetCents: data.cents,
      applyPoints: auth ? applyPoints : 0,
      userId: auth?.userId ?? null,
      customerEmail: auth?.email ?? null,
      url: draft.url,
      categoryId: draft.categoryId,
      name: draft.name,
      logoUrl: draft.logoUrl ?? "",
      cancelSearch: `${cancel.toString()}`,
    });
    return { status: "stripe", ...session };
  });

export const getClaimCheckoutStatus = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ sessionId: z.string().min(8).max(200) }).parse(data))
  .handler(async ({ data }) => {
    const { getStripe } = await import("@/lib/stripe.server");
    const session = await getStripe().checkout.sessions.retrieve(data.sessionId);
    const email = session.customer_details?.email ?? session.customer_email ?? null;
    const paid = session.payment_status === "paid";
    return {
      paid,
      email,
      url: session.metadata?.["url"] ?? null,
      name: session.metadata?.["name"] ?? null,
    };
  });

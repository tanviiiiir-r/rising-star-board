import { parseListingTarget } from "@/lib/listing-target";
import { RANKING } from "@/lib/ranking";
import { slugify } from "@/lib/slug";

export type RankClaimDraft = {
  url: string;
  categoryId: string;
  cents: number;
  name?: string;
  logoUrl?: string;
};

function listingCopy(name: string) {
  const trimmed = name.trim().slice(0, 60);
  const safeName = trimmed.length >= 2 ? trimmed : "Listing";
  const tagline = `${safeName} on Bid Ladder`.slice(0, 120);
  const description =
    `A listing at this rank on Bid Ladder. It goes live when payment confirms.`.slice(0, 1200);
  return {
    name: safeName,
    tagline: tagline.length >= 10 ? tagline : "Listed on Bid Ladder",
    description:
      description.length >= 20 ? description : "A listing claimed on the Bid Ladder board.",
  };
}

async function findOrCreateUserByEmail(email: string): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const normalized = email.trim().toLowerCase();
  const created = await supabaseAdmin.auth.admin.createUser({
    email: normalized,
    email_confirm: true,
    user_metadata: { source: "guest_claim" },
  });
  if (created.data.user?.id) return created.data.user.id;

  const message = created.error?.message ?? "";
  if (!/already|registered|exists/i.test(message)) {
    throw new Error(message || "Could not create a buyer account.");
  }

  for (let page = 1; page <= 20; page += 1) {
    const listed = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    const found = listed.data.users.find((user) => user.email?.toLowerCase() === normalized);
    if (found) return found.id;
    if (listed.data.users.length < 200) break;
  }
  throw new Error("Could not match this checkout email to an account.");
}

export async function resolveClaimOwner(input: {
  userId: string | null;
  email: string | null;
}): Promise<string> {
  if (input.userId) return input.userId;
  if (!input.email) {
    throw new Error("Checkout needs an email so we can attach the listing.");
  }
  return findOrCreateUserByEmail(input.email);
}

export async function fulfillRankClaim(input: {
  ownerId: string;
  draft: RankClaimDraft;
}): Promise<{ listingId: string; slug: string }> {
  const target = parseListingTarget(input.draft.url);
  if (!target) throw new Error("Enter a website or X @handle");
  if (input.draft.cents < RANKING.minVisibleCents) {
    throw new Error(`Minimum claim is ${RANKING.minVisibleCents / 100} dollars.`);
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const copy = listingCopy(input.draft.name?.trim() || target.label);
  const logoUrl = input.draft.logoUrl || target.logoUrl;

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("listings")
    .select("id, slug, allocation_cents, status")
    .eq("owner_id", input.ownerId)
    .eq("url", target.canonicalUrl)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);

  let listingId = existing?.id;
  let slug = existing?.slug;
  if (!listingId || !slug) {
    const inserted = await supabaseAdmin
      .from("listings")
      .insert({
        owner_id: input.ownerId,
        category_id: input.draft.categoryId,
        name: copy.name,
        tagline: copy.tagline,
        url: target.canonicalUrl,
        logo_url: logoUrl,
        description: copy.description,
        slug: slugify(copy.name),
        status: "approved",
        approved_at: new Date().toISOString(),
      })
      .select("id, slug")
      .single();
    if (inserted.error) throw new Error(inserted.error.message);
    listingId = inserted.data.id;
    slug = inserted.data.slug;
  } else if (existing && existing.status !== "approved") {
    const approved = await supabaseAdmin
      .from("listings")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        rejection_reason: null,
      })
      .eq("id", listingId);
    if (approved.error) throw new Error(approved.error.message);
  }

  const current = existing?.allocation_cents ?? 0;
  const targetCents = Math.max(current, input.draft.cents);
  if (targetCents > current) {
    const { error } = await supabaseAdmin.rpc("set_allocation", {
      _listing_id: listingId,
      _new_cents: targetCents,
    });
    if (error) throw new Error(error.message);
  }

  return { listingId, slug };
}

export async function applyRankClaimPayment(input: {
  ownerId: string;
  paidCents: number;
  applyPoints: number;
  draft: RankClaimDraft;
  idempotencyKey: string;
}): Promise<{ listingId: string; slug: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  if (input.applyPoints > 0) {
    const { error } = await supabaseAdmin.rpc("service_convert_points", {
      _user_id: input.ownerId,
      _points: input.applyPoints,
      _idempotency_key: `${input.idempotencyKey}:points`,
    });
    if (error) throw new Error(error.message);
  }

  if (input.paidCents > 0) {
    const { error } = await supabaseAdmin.rpc("apply_credit_topup", {
      _user_id: input.ownerId,
      _cents: input.paidCents,
      _idempotency_key: input.idempotencyKey,
    });
    if (error) throw new Error(error.message);
  }

  return fulfillRankClaim({ ownerId: input.ownerId, draft: input.draft });
}

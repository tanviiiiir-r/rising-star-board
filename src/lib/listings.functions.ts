import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { parseListingTarget } from "./listing-target";
import { slugify } from "./slug";

export const submitListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        name: z.string().trim().min(2).max(60),
        tagline: z.string().trim().min(10).max(120),
        url: z.string().trim().min(1).max(300),
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
        description: z.string().trim().min(20).max(1200),
        categoryId: z.string().uuid(),
      })
      .superRefine((value, ctx) => {
        if (!parseListingTarget(value.url)) {
          ctx.addIssue({
            code: "custom",
            path: ["url"],
            message: "Enter a website or X @handle",
          });
        }
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const target = parseListingTarget(data.url);
    if (!target) throw new Error("Enter a website or X @handle");

    const { data: row, error } = await context.supabase
      .from("listings")
      .insert({
        owner_id: context.userId,
        category_id: data.categoryId,
        name: data.name,
        tagline: data.tagline,
        url: target.canonicalUrl,
        logo_url: data.logoUrl || target.logoUrl,
        description: data.description,
        slug: slugify(data.name),
        status: "pending",
      })
      .select("id, slug")
      .single();

    if (error) throw new Error(error.message);
    return row;
  });

export const getMyListings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("listings")
      .select(
        "id, slug, name, tagline, url, logo_url, status, rejection_reason, created_at, approved_at, allocation_cents, allocation_set_at, categories(name), rankings(rank, previous_rank, unique_views, shares, score)",
      )
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

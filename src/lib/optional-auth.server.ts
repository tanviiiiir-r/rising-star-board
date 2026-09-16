import { createClient } from "@supabase/supabase-js";
import { getRequest } from "@tanstack/react-start/server";

import type { Database } from "@/integrations/supabase/types";
import { publicSupabasePublishableKey, publicSupabaseUrl } from "@/lib/supabase-env";

export type OptionalAuth = {
  userId: string;
  email: string | null;
};

function claimEmail(claims: Record<string, unknown>): string | null {
  const email = claims["email"];
  return typeof email === "string" && email.includes("@") ? email : null;
}

/** Read a Bearer user if the browser attached one. Guests resolve to null. */
export async function optionalAuth(): Promise<OptionalAuth | null> {
  const request = getRequest();
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token || token.split(".").length !== 3) return null;

  const url = publicSupabaseUrl();
  const key = publicSupabasePublishableKey();
  if (!url || !key) return null;

  const supabase = createClient<Database>(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getClaims(token);
  const userId = data?.claims?.sub;
  if (error || !userId) return null;
  return { userId, email: claimEmail(data.claims as Record<string, unknown>) };
}

-- Listing logos captured from the claim-target resolver (favicon / social avatar).
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS logo_url text;

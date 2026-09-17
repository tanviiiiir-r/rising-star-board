-- Authorization is the actor argument, not service_role or auth.uid().
-- Better Auth never sets auth.uid(), and the Next app always SET LOCAL ROLE service_role.

DROP FUNCTION IF EXISTS public.set_allocation(uuid, integer);

CREATE OR REPLACE FUNCTION public.set_allocation(
  _listing_id uuid,
  _new_cents integer,
  _actor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  listing public.listings%ROWTYPE;
  wallet_available integer;
  delta integer;
  today date := (timezone('utc', now()))::date;
  today_amount integer := 0;
  today_new integer;
  alltime_first integer;
  alltime_first_id uuid;
  today_first integer;
  today_first_id uuid;
  i_am_alltime_first boolean := false;
  i_am_today_first boolean := false;
  actor_is_admin boolean := false;
BEGIN
  IF _actor_id IS NULL THEN
    RAISE EXCEPTION 'not allowed';
  END IF;
  IF _new_cents IS NULL OR _new_cents < 0 THEN
    RAISE EXCEPTION 'Allocation must be a non-negative integer number of cents.';
  END IF;
  IF _new_cents <> 0 AND _new_cents < 1000 THEN
    RAISE EXCEPTION 'Minimum allocation is 1000 cents.';
  END IF;
  IF _new_cents % 100 <> 0 THEN
    RAISE EXCEPTION 'Allocation must be in 100-cent increments.';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('bid-ladder-allocation'));

  SELECT * INTO listing
  FROM public.listings
  WHERE id = _listing_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'listing not found';
  END IF;

  SELECT
    private.has_role(_actor_id, 'admin')
    OR EXISTS (
      SELECT 1
      FROM public."user" u
      WHERE u.id = _actor_id AND u.role = 'admin'
    )
  INTO actor_is_admin;

  IF NOT (_actor_id = listing.owner_id OR actor_is_admin) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  delta := _new_cents - listing.allocation_cents;
  IF delta = 0 THEN
    RETURN jsonb_build_object(
      'ok', true,
      'noop', true,
      'allocation_cents', listing.allocation_cents
    );
  END IF;

  INSERT INTO public.wallets (user_id, available_cents)
  VALUES (listing.owner_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT available_cents INTO wallet_available
  FROM public.wallets
  WHERE user_id = listing.owner_id
  FOR UPDATE;

  IF delta > 0 AND wallet_available < delta THEN
    RAISE EXCEPTION 'insufficient credits';
  END IF;

  SELECT l.allocation_cents, l.id
  INTO alltime_first, alltime_first_id
  FROM public.listings l
  WHERE l.status = 'approved'
    AND l.allocation_cents >= 1000
  ORDER BY l.allocation_cents DESC, l.allocation_set_at ASC NULLS LAST, l.id
  LIMIT 1;
  i_am_alltime_first := alltime_first_id IS NOT NULL AND alltime_first_id = _listing_id;

  SELECT d.amount_cents INTO today_amount
  FROM public.daily_allocations d
  WHERE d.listing_id = _listing_id AND d.utc_date = today;
  today_amount := COALESCE(today_amount, 0);
  today_new := GREATEST(0, today_amount + delta);

  SELECT d.amount_cents, d.listing_id
  INTO today_first, today_first_id
  FROM public.daily_allocations d
  JOIN public.listings l ON l.id = d.listing_id
  WHERE d.utc_date = today
    AND l.status = 'approved'
    AND d.amount_cents >= 1000
  ORDER BY d.amount_cents DESC, d.first_allocated_at ASC, d.listing_id
  LIMIT 1;
  i_am_today_first := today_first_id IS NOT NULL AND today_first_id = _listing_id;

  IF delta > 0 THEN
    IF NOT i_am_alltime_first
       AND alltime_first IS NOT NULL
       AND _new_cents > alltime_first
       AND _new_cents < alltime_first + 500 THEN
      RAISE EXCEPTION 'taking all-time #1 requires current #1 plus 500 cents';
    END IF;
    IF NOT i_am_today_first
       AND today_first IS NOT NULL
       AND today_new > today_first
       AND today_new < today_first + 500 THEN
      RAISE EXCEPTION 'taking today #1 requires current #1 plus 500 cents';
    END IF;
  END IF;

  UPDATE public.wallets
  SET available_cents = available_cents - delta
  WHERE user_id = listing.owner_id;

  UPDATE public.listings
  SET allocation_cents = _new_cents,
      allocation_set_at = now()
  WHERE id = _listing_id;

  INSERT INTO public.daily_allocations (listing_id, utc_date, amount_cents, first_allocated_at)
  VALUES (_listing_id, today, today_new, now())
  ON CONFLICT (listing_id, utc_date) DO UPDATE SET
    amount_cents = EXCLUDED.amount_cents,
    first_allocated_at = EXCLUDED.first_allocated_at;

  IF today_new = 0 THEN
    DELETE FROM public.daily_allocations
    WHERE listing_id = _listing_id AND utc_date = today AND amount_cents = 0;
  END IF;

  INSERT INTO public.credit_ledger (
    user_id, amount_cents, type, reference_type, reference_id
  ) VALUES (
    listing.owner_id,
    -delta,
    CASE WHEN delta > 0 THEN 'allocation'::public.credit_ledger_type
         ELSE 'allocation_release'::public.credit_ledger_type END,
    'listing',
    _listing_id
  );

  PERFORM public.recompute_rankings();

  RETURN jsonb_build_object(
    'ok', true,
    'allocation_cents', _new_cents,
    'delta_cents', delta,
    'today_cents', today_new
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.set_allocation(uuid, integer, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_allocation(uuid, integer, uuid) TO service_role;

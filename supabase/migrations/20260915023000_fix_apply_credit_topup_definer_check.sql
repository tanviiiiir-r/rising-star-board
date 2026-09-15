-- SECURITY DEFINER runs as the function owner, so current_user is never
-- service_role. That check made every Stripe webhook return 500.

CREATE OR REPLACE FUNCTION public.apply_credit_topup(_user_id uuid, _cents integer, _idempotency_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  existing uuid;
BEGIN
  IF auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'service role only';
  END IF;
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'user required';
  END IF;
  IF _cents IS NULL OR _cents <= 0 THEN
    RAISE EXCEPTION 'top-up must be a positive number of cents';
  END IF;
  IF _cents % 100 <> 0 THEN
    RAISE EXCEPTION 'top-up must be in 100-cent increments';
  END IF;
  IF _idempotency_key IS NULL OR length(_idempotency_key) < 8 THEN
    RAISE EXCEPTION 'idempotency key required';
  END IF;

  SELECT id INTO existing FROM public.credit_ledger WHERE idempotency_key = _idempotency_key;
  IF existing IS NOT NULL THEN
    RETURN jsonb_build_object('ok', true, 'idempotent', true, 'ledger_id', existing);
  END IF;

  INSERT INTO public.wallets (user_id, available_cents)
  VALUES (_user_id, _cents)
  ON CONFLICT (user_id) DO UPDATE
    SET available_cents = public.wallets.available_cents + EXCLUDED.available_cents;

  INSERT INTO public.credit_ledger (
    user_id, amount_cents, type, reference_type, reason, idempotency_key
  ) VALUES (
    _user_id, _cents, 'topup', 'stripe', 'Stripe credit top-up', _idempotency_key
  )
  RETURNING id INTO existing;

  RETURN jsonb_build_object('ok', true, 'idempotent', false, 'ledger_id', existing);
END;
$function$;

REVOKE ALL ON FUNCTION public.apply_credit_topup(uuid, integer, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.apply_credit_topup(uuid, integer, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_credit_topup(uuid, integer, text) TO service_role;

-- Service-only points conversion so guest/rank checkout can apply points
-- after Stripe confirms, without an auth.uid() session.

CREATE OR REPLACE FUNCTION public.service_convert_points(
  _user_id uuid,
  _points integer,
  _idempotency_key text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
  wallet public.wallets%ROWTYPE;
  converted_cents integer;
  existing uuid;
BEGIN
  IF current_user <> 'service_role' OR auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'service role only';
  END IF;
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'user required';
  END IF;
  IF _points IS NULL OR _points < 0 THEN
    RAISE EXCEPTION 'points must be a non-negative integer';
  END IF;
  IF _idempotency_key IS NULL OR length(_idempotency_key) < 8 THEN
    RAISE EXCEPTION 'idempotency key required';
  END IF;
  IF _points = 0 THEN
    RETURN jsonb_build_object('ok', true, 'noop', true, 'converted_cents', 0);
  END IF;

  SELECT id INTO existing FROM public.point_ledger WHERE idempotency_key = _idempotency_key;
  IF existing IS NOT NULL THEN
    RETURN jsonb_build_object('ok', true, 'idempotent', true, 'ledger_id', existing);
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('bid-ladder-points-' || _user_id::text));

  INSERT INTO public.wallets (user_id, available_cents, available_points)
  VALUES (_user_id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO wallet
  FROM public.wallets
  WHERE user_id = _user_id
  FOR UPDATE;

  IF wallet.available_points < _points THEN
    RAISE EXCEPTION 'insufficient points';
  END IF;

  converted_cents := _points;

  UPDATE public.wallets
  SET available_points = available_points - _points,
      available_cents = available_cents + converted_cents
  WHERE user_id = _user_id;

  INSERT INTO public.point_ledger (
    user_id, amount_points, type, reference_type, reason, idempotency_key
  ) VALUES (
    _user_id, -_points, 'conversion', 'points_conversion',
    'Converted ' || _points || ' points', _idempotency_key
  )
  RETURNING id INTO existing;

  INSERT INTO public.credit_ledger (
    user_id, amount_cents, type, reference_type, reason, idempotency_key
  ) VALUES (
    _user_id, converted_cents, 'points_conversion', 'points_conversion',
    'Converted ' || _points || ' points', _idempotency_key || ':credits'
  );

  RETURN jsonb_build_object(
    'ok', true,
    'converted_cents', converted_cents,
    'points_spent', _points,
    'ledger_id', existing
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.service_convert_points(uuid, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.service_convert_points(uuid, integer, text) TO service_role;

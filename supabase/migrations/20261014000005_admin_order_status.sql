CREATE OR REPLACE FUNCTION public.admin_update_order_status(
  p_order_id UUID,
  p_expected_status TEXT,
  p_new_status TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_status TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Administrator access required'
      USING ERRCODE = '42501';
  END IF;

  SELECT status
    INTO current_status
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF current_status <> p_expected_status THEN
    RAISE EXCEPTION 'Order status changed since it was loaded'
      USING ERRCODE = '22023';
  END IF;

  IF NOT (
    (current_status = 'pending' AND p_new_status IN ('confirmed', 'cancelled'))
    OR (current_status = 'confirmed' AND p_new_status IN ('processing', 'cancelled'))
    OR (current_status = 'processing' AND p_new_status IN ('shipped', 'cancelled'))
    OR (current_status = 'shipped' AND p_new_status = 'delivered')
  ) THEN
    RAISE EXCEPTION 'Invalid order status transition'
      USING ERRCODE = '22023';
  END IF;

  UPDATE public.orders
    SET status = p_new_status
    WHERE id = p_order_id;

  INSERT INTO public.audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    details
  )
  VALUES (
    auth.uid(),
    'update_order_status',
    'order',
    p_order_id::TEXT,
    jsonb_build_object(
      'from', current_status,
      'to', p_new_status
    )
  );

  RETURN p_new_status;
END;
$$;

-- Prevent direct REST updates from bypassing transition validation and auditing.
DROP POLICY IF EXISTS "Admins have full access to orders" ON public.orders;
CREATE POLICY "Admins can view all orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to order items" ON public.order_items;
CREATE POLICY "Admins can view all order items"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

REVOKE ALL ON FUNCTION public.admin_update_order_status(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_update_order_status(UUID, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_update_order_status(UUID, TEXT, TEXT) TO authenticated;

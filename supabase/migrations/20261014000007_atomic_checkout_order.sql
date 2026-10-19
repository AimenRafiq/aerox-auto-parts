CREATE OR REPLACE FUNCTION public.create_checkout_order(
  p_order JSONB,
  p_items JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
DECLARE
  order_id UUID;
BEGIN
  IF p_order IS NULL OR jsonb_typeof(p_order) <> 'object' THEN
    RAISE EXCEPTION 'Order payload must be a JSON object'
      USING ERRCODE = '22023';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN
    RAISE EXCEPTION 'Order items must be a JSON array'
      USING ERRCODE = '22023';
  END IF;

  IF jsonb_array_length(p_items) NOT BETWEEN 1 AND 50 THEN
    RAISE EXCEPTION 'Order must contain between 1 and 50 item snapshots'
      USING ERRCODE = '22023';
  END IF;

  order_id := (p_order ->> 'id')::UUID;

  INSERT INTO public.orders (
    id, order_number, user_id, status, currency, subtotal,
    shipping_amount, tax_amount, discount_amount, total,
    customer_email, customer_name, customer_phone, shipping_address,
    payment_provider, payment_status, payment_reference, notes,
    created_at, updated_at
  )
  VALUES (
    order_id,
    p_order ->> 'order_number',
    NULLIF(p_order ->> 'user_id', '')::UUID,
    p_order ->> 'status',
    p_order ->> 'currency',
    (p_order ->> 'subtotal')::NUMERIC(10, 2),
    (p_order ->> 'shipping_amount')::NUMERIC(10, 2),
    (p_order ->> 'tax_amount')::NUMERIC(10, 2),
    (p_order ->> 'discount_amount')::NUMERIC(10, 2),
    (p_order ->> 'total')::NUMERIC(10, 2),
    p_order ->> 'customer_email',
    p_order ->> 'customer_name',
    p_order ->> 'customer_phone',
    p_order -> 'shipping_address',
    p_order ->> 'payment_provider',
    p_order ->> 'payment_status',
    p_order ->> 'payment_reference',
    p_order ->> 'notes',
    (p_order ->> 'created_at')::TIMESTAMPTZ,
    (p_order ->> 'updated_at')::TIMESTAMPTZ
  );

  INSERT INTO public.order_items (
    id, order_id, product_id, sku_snapshot, product_name_snapshot,
    unit_price, quantity, line_total, created_at
  )
  SELECT
    (item ->> 'id')::UUID,
    order_id,
    NULLIF(item ->> 'product_id', '')::UUID,
    item ->> 'sku_snapshot',
    item ->> 'product_name_snapshot',
    (item ->> 'unit_price')::NUMERIC(10, 2),
    (item ->> 'quantity')::INTEGER,
    (item ->> 'line_total')::NUMERIC(10, 2),
    (item ->> 'created_at')::TIMESTAMPTZ
  FROM jsonb_array_elements(p_items) AS lines(item);
END;
$function$;

REVOKE ALL ON FUNCTION public.create_checkout_order(JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_checkout_order(JSONB, JSONB)
  TO anon, authenticated;

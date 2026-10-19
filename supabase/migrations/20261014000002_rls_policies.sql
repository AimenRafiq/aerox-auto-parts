-- ==============================================================================
-- Aerox Auto Parts — Schema Migration 002: Row Level Security (RLS)
-- Target: PostgreSQL / Supabase
-- Description: Strict least-privilege RLS policies for public catalog, orders, and administrative access.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Helper Function: Check if current authenticated user is an administrator
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = auth.uid()
  );
$$;

-- ------------------------------------------------------------------------------
-- Enable Row Level Security (Deny by default)
-- ------------------------------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_fitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 1. Categories Policies
-- ------------------------------------------------------------------------------
-- Public visitors can read active categories
CREATE POLICY "Public can view active categories"
  ON public.categories
  FOR SELECT
  TO public
  USING (is_active = true);

-- Admins have full access to categories
CREATE POLICY "Admins have full access to categories"
  ON public.categories
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 2. Brands Policies
-- ------------------------------------------------------------------------------
-- Public visitors can read active brands
CREATE POLICY "Public can view active brands"
  ON public.brands
  FOR SELECT
  TO public
  USING (is_active = true);

-- Admins have full access to brands
CREATE POLICY "Admins have full access to brands"
  ON public.brands
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 3. Products Policies
-- ------------------------------------------------------------------------------
-- Public visitors can read published, non-archived products
CREATE POLICY "Public can view published products"
  ON public.products
  FOR SELECT
  TO public
  USING (is_published = true AND archived_at IS NULL);

-- Admins have full access to products (including drafts and archived)
CREATE POLICY "Admins have full access to products"
  ON public.products
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. Product Images Policies
-- ------------------------------------------------------------------------------
-- Public visitors can read images of published products
CREATE POLICY "Public can view published product images"
  ON public.product_images
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_images.product_id
        AND p.is_published = true
        AND p.archived_at IS NULL
    )
  );

-- Admins have full access to product images
CREATE POLICY "Admins have full access to product images"
  ON public.product_images
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. Vehicles Policies
-- ------------------------------------------------------------------------------
-- Public visitors can read vehicles for fitment selection
CREATE POLICY "Public can view vehicles"
  ON public.vehicles
  FOR SELECT
  TO public
  USING (true);

-- Admins have full access to vehicles
CREATE POLICY "Admins have full access to vehicles"
  ON public.vehicles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. Product Fitments Policies
-- ------------------------------------------------------------------------------
-- Public visitors can read fitments for published products
CREATE POLICY "Public can view published product fitments"
  ON public.product_fitments
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_fitments.product_id
        AND p.is_published = true
        AND p.archived_at IS NULL
    )
  );

-- Admins have full access to fitments
CREATE POLICY "Admins have full access to product fitments"
  ON public.product_fitments
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 7. Orders Policies
-- ------------------------------------------------------------------------------
-- Public/Guest checkout can insert an order
CREATE POLICY "Public can insert orders"
  ON public.orders
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Authenticated customers can read their own orders
CREATE POLICY "Users can view their own orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins have full access to manage and review orders
CREATE POLICY "Admins have full access to orders"
  ON public.orders
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 8. Order Items Policies
-- ------------------------------------------------------------------------------
-- Public can insert order items alongside an order
CREATE POLICY "Public can insert order items"
  ON public.order_items
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Authenticated customers can read items from their own orders
CREATE POLICY "Users can view their own order items"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND o.user_id = auth.uid()
    )
  );

-- Admins have full access to order items
CREATE POLICY "Admins have full access to order items"
  ON public.order_items
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 9. Admin Users Policies
-- ------------------------------------------------------------------------------
-- Authenticated users can check if their own UID is registered as an admin
CREATE POLICY "Users can check own admin status"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Super admins can manage other admin roles
CREATE POLICY "Super admins can manage admin users"
  ON public.admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ------------------------------------------------------------------------------
-- 10. Audit Logs Policies
-- ------------------------------------------------------------------------------
-- Admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can insert audit log entries
CREATE POLICY "Admins can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());


-- Preserve vehicle and fitment tables for a future approved data source, but
-- prevent unverified or legacy demo records from being exposed to storefront users.
DROP POLICY IF EXISTS "Public can view vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Public can view published product fitments" ON public.product_fitments;

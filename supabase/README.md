# Supabase Database & Migration Guide — Aerox Auto Parts

This directory contains versioned SQL migrations, security policies, and seed data for the Aerox Auto Parts e-commerce platform.

---

## 🗄️ Database Architecture Summary

- **PostgreSQL Version:** 15+ (Supabase Standard)
- **Primary Keys:** UUID (`gen_random_uuid()`)
- **Monetary Precision:** Fixed-precision `NUMERIC(10, 2)` (never floating point)
- **Security Baseline:** Row Level Security (RLS) enabled on all tables, deny-by-default

### Tables
1. `categories` — Automotive system taxonomy (hierarchical, sortable)
2. `brands` — Verified OEM & aftermarket manufacturers
3. `products` — Auto parts catalog (SKU, pricing, stock, publish states)
4. `product_images` — Storage path references for Supabase Storage buckets
5. `vehicles` — Standard vehicle lookup (Make, Model, Year range, Engine specs)
6. `product_fitments` — Cross-reference join between parts and vehicles
7. `orders` — Customer orders with immutable purchase snapshot fields
8. `order_items` — Itemized order lines with locked unit prices
9. `admin_users` — Controlled admin access mapping (RBAC)
10. `audit_logs` — Administrative operation tracking

---

## 🚀 Setup & Migration Application

Product images use the public `product-images` Storage bucket. The migration
limits each object to 5 MB and allows JPEG, PNG, and WebP files. Only users
authorized by `public.is_admin()` can upload, update, or delete objects.
Public read access is required for storefront product imagery.

Order fulfillment transitions are validated by a database function and
atomically written to `audit_logs`. The order and order-item admin RLS policies
are read-only; status updates must use the authenticated admin function, which
leaves payment state and immutable purchase snapshots unchanged.

Guest checkout creates the order and item snapshots through
`create_checkout_order` in one database function call. The function runs under
the caller's RLS policies, and an item insert failure rolls back the order
insert as well.

Allowed fulfillment transitions are `pending → confirmed` or `cancelled`,
`confirmed → processing` or `cancelled`, `processing → shipped` or `cancelled`,
and `shipped → delivered`. `delivered` and `cancelled` are final states.

Vehicle and fitment tables are retained for a future integration, but no
compatibility data source or usage license has been approved. Seed data no
longer includes vehicle matches. Public RLS reads are disabled by migration
`20261014000006_disable_unverified_fitment_reads.sql`; do not re-enable them or
publish fitment claims until the source and its licensing are confirmed.
Previously seeded records are preserved, not deleted, but are no longer
available to storefront users through the database API or product pages.

### Option A: Using the Supabase Dashboard SQL Editor (Quickest)

1. Open your Supabase Project Dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Navigate to the **SQL Editor** on the left navigation bar.
3. Apply the migrations in sequential order:
   - **Step 1:** Run `supabase/migrations/20261014000001_initial_schema.sql`
   - **Step 2:** Run `supabase/migrations/20261014000002_rls_policies.sql`
   - **Step 3 (Development Only):** Run `supabase/migrations/20261014000003_seed_data.sql`
   - **Step 4:** Run `supabase/migrations/20261014000004_product_image_storage.sql`
   - **Step 5:** Run `supabase/migrations/20261014000005_admin_order_status.sql`
   - **Step 6:** Run `supabase/migrations/20261014000006_disable_unverified_fitment_reads.sql`
   - **Step 7:** Run `supabase/migrations/20261014000007_atomic_checkout_order.sql`
4. Confirm tables are visible under the **Table Editor**.

### Option B: Using Supabase CLI

```bash
# Link your local project to your remote Supabase project
npx supabase link --project-ref your-project-ref

# Push all migrations
npx supabase db push
```

---

## 🔐 Bootstrapping the First Administrator

To prevent public self-registration security exploits, the first admin cannot register as an admin through public forms:

1. Create a user account via Supabase Dashboard (**Authentication -> Users -> Add User**) or by signing up through your application.
2. Copy the user's `UID` (UUID format, e.g. `a3e5c9b1-7642-4f81-81f1-827d098e9182`).
3. In the **SQL Editor**, run the following statement to grant administrator privileges:

```sql
INSERT INTO public.admin_users (id, role)
VALUES ('YOUR_USER_UUID_HERE', 'super_admin');
```

---

## 🛡️ Verifying Row Level Security (RLS)

You can verify that least-privilege security policies are operating correctly by running test queries under different roles in the SQL Editor:

### Test 1: Anonymous / Public Role
```sql
SET ROLE anon;

-- Expected: Returns only active categories
SELECT name, is_active FROM public.categories;

-- Expected: Returns only published products
SELECT sku, name, is_published FROM public.products;

-- Expected: Returns 0 rows (orders are protected)
SELECT * FROM public.orders;

RESET ROLE;
```

### Test 2: Admin Access
```sql
-- When authenticated as the admin user ID:
SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "YOUR_ADMIN_UUID_HERE"}';

-- Expected: Can view all products, drafts, and orders
SELECT COUNT(*) FROM public.orders;

RESET ROLE;
```

---

## 🔄 Rollback Procedures

If you need to roll back migrations during development:

```sql
-- Rollback RLS & Policies
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.admin_update_order_status(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_checkout_order(JSONB, JSONB) CASCADE;

-- Rollback product image storage policies and bucket
DROP POLICY IF EXISTS "Public can view product image objects" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product image objects" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product image objects" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product image objects" ON storage.objects;
DELETE FROM storage.buckets WHERE id = 'product-images';

-- Rollback Tables (in reverse dependency order)
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.product_fitments CASCADE;
DROP TABLE IF EXISTS public.vehicles CASCADE;
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
```

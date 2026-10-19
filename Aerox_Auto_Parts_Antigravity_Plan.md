# Aerox Auto Parts — Antigravity Development Blueprint

> **Purpose:** Build a clean, professional, responsive auto-parts e-commerce store with a secure admin panel.
>
> **Working rule:** Implement one phase at a time. Inspect the repository first, propose a concise plan, implement only the approved/current phase, run checks, report results, and stop for review before advancing.
>
> **Brand:** Aerox Auto Parts  
> **Core stack:** Next.js (App Router) + React + TypeScript + Supabase (PostgreSQL, Auth, Storage)  
> **Design principle:** Intentional, restrained, human-designed UI. No AI slop.

---

## 1. Project goals

Build a reliable online shop where customers can:

- Browse auto parts by category, vehicle compatibility, brand, and search.
- Filter and sort products.
- View clear product details, price, stock status, compatibility notes, images, and shipping/returns information.
- Add items to a cart and update quantities.
- Complete checkout using a clearly defined payment approach.
- Create an account or check out as a guest if the chosen order flow supports it.
- View order confirmation and, where accounts are enabled, order history.

Build a protected admin area where authorized staff can:

- View a compact dashboard of orders, products, and low-stock items.
- Create, edit, publish/unpublish, and archive products.
- Manage categories, brands, product images, SKU, price, stock, and fitment/compatibility data.
- View and update order status.
- Search and filter orders.
- Manage customer-visible store content where explicitly implemented.
- See useful validation messages and confirmations before destructive actions.

### Not in the initial MVP unless explicitly approved

- AI chatbots, AI product recommendations, AI-generated copy, AI search, or AI agents.
- Microservices, Kubernetes, complex event systems, or unnecessary infrastructure.
- Multi-vendor marketplace functionality.
- Loyalty points, subscriptions, complex promotions, or multi-warehouse inventory.
- Real-time features unless there is a demonstrated need.
- Fake reviews, fake trust badges, fabricated stock counts, or placeholder claims presented as facts.

---

## 2. Non-negotiable development rules

1. **No AI slop.** Do not use generic AI landing-page patterns, excessive gradients, glowing cards, random decorative blobs, emoji as interface icons, giant empty hero sections, or repetitive card grids everywhere.
2. Use consistent spacing, typography, component variants, and a restrained palette. Every section must serve a customer task.
3. Do not invent business facts, warranty promises, shipping speeds, customer reviews, certifications, or inventory.
4. Do not build the whole application in one pass. Follow the phases in this file in order.
5. Before each phase:
   - Inspect the existing repository and current state.
   - State the phase goal, files likely to change, and acceptance criteria.
   - Identify unresolved requirements and security/data risks.
   - Do not overwrite existing work without inspecting it.
6. After each phase:
   - Run lint, type-check, relevant tests, and production build when applicable.
   - Fix failures introduced by the phase.
   - Summarize changed files, tests run, known limitations, and next steps.
   - Stop and wait for approval before starting the next phase.
7. Keep changes small, coherent, and reviewable. Avoid unrelated refactors.
8. Never claim a command or test passed unless it was actually run.
9. Do not leave dead buttons, fake forms, nonfunctional filters, or links to `#` in completed flows.
10. Use realistic sample data only in clearly identified development seed files. Never mix demo data with production data.
11. Do not add dependencies without a clear need. Check whether the framework or existing libraries already solve the problem.
12. Never commit secrets, `.env` files, service-role keys, payment secrets, or customer data.

---

## 3. Brand and UI direction

### Brand personality

- Dependable
- Technical
- Practical
- Modern
- Clear and approachable

### Suggested color tokens

Use these as initial tokens, then inspect them in real screens and adjust for contrast:

- **Ink / primary text:** `#17212B`
- **Deep navy:** `#142D4E`
- **Automotive blue accent:** `#2463A6`
- **Warm light background:** `#F5F7F9`
- **Surface:** `#FFFFFF`
- **Muted text:** `#667382`
- **Border:** `#DCE3EA`
- **Success:** `#247A52`
- **Warning:** `#A96812`
- **Error:** `#B42318`

Use the accent for primary actions and meaningful interactive states, not as decoration on every component. Maintain WCAG AA contrast for normal text where practical.

### Typography and layout

- Use a legible modern sans-serif. Prefer one font family with a clear weight scale.
- Establish a consistent type scale and spacing system.
- Use a content max-width and predictable page gutters.
- Product images should use a consistent aspect ratio and neutral background where possible.
- Make mobile navigation, search, product cards, filters, cart, and checkout usable on small screens.
- Include visible keyboard focus, semantic landmarks, labels, validation messages, and accessible dialogs.
- Prefer simple borders, subtle shadows only where useful, and clear hierarchy.
- Use real product imagery supplied by the client or properly licensed assets. Avoid arbitrary stock photos as product images.

### Main storefront structure

1. Announcement strip only if there is a real message.
2. Header: logo/wordmark, search, account, cart.
3. Primary navigation: categories and relevant shopping paths.
4. Homepage: compact value proposition, prominent parts search, category shortcuts, selected products only when data exists, and helpful store information.
5. Product listing: breadcrumbs, title, filters, sort, result count, product grid/list, pagination.
6. Product detail: gallery, name, SKU, price, availability, compatibility/fitment, quantity, add-to-cart, shipping/returns details.
7. Cart: editable quantities, remove item, subtotal, and clear next step.
8. Checkout and order confirmation based on the approved payment/shipping scope.
9. Footer: real contact information, policies, navigation, and business details.

Do not populate the page with sections just to make it look full. Keep the layout focused on buying auto parts.

---

## 4. Technical architecture

### Recommended baseline

- Next.js App Router
- React
- TypeScript with strict mode
- Supabase PostgreSQL
- Supabase Auth if customer/admin accounts are needed
- Supabase Storage for product images, subject to free-tier limits
- Tailwind CSS and a small, consistent component system if already suitable for the repository
- Zod or equivalent schema validation at trust boundaries
- A maintained form library only if form complexity justifies it
- A testing stack appropriate to the repository (unit/component tests and browser-level smoke tests)

Use current stable, mutually compatible versions at project start. Do not blindly upgrade packages mid-phase.

### Architecture principles

- Prefer Server Components for read-heavy pages and use Client Components only where interaction requires them.
- Use server-side code for privileged operations.
- Keep database access in a small, well-defined data-access layer.
- Validate all external input on the server, even if client-side validation exists.
- Use database constraints and transactions for important invariants.
- Use pagination and indexed filters rather than fetching the entire catalog.
- Avoid unnecessary polling, realtime subscriptions, and repeated database queries.
- Use loading, empty, error, and success states for all important flows.
- Add structured logs that do not expose secrets or sensitive customer data.

### Environment variables

Create `.env.example` with placeholder names only. Likely variables:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

Only include `SUPABASE_SERVICE_ROLE_KEY` if there is a verified server-side need. It must never use a `NEXT_PUBLIC_` prefix, appear in client bundles, or be exposed in browser code. Prefer the publishable/anonymous key with correctly configured RLS for ordinary user-scoped access. Use secrets only in server-only modules.

If a payment provider is selected, add its secret variables only after the provider and checkout design are approved.

---

## 5. Free-tier-first policy

The free tier is for development, demos, and validating an MVP. It is not a promise of uninterrupted production service.

### Supabase

Plan around the currently published Free quotas and verify them in the dashboard before launch. The current published figures include:

- 500 MB database size per project
- 1 GB file storage
- 5 GB egress
- 50,000 monthly active users
- Free projects may be paused after a period of low activity
- Automated backups and production support differ from paid plans

Limits and policies can change. Treat the live Supabase dashboard and official pricing/docs as the source of truth.

Cost-saving implementation rules:

1. Store product metadata in PostgreSQL; store image files in Storage and only their paths/URLs in the database.
2. Resize and compress images before upload. Prefer WebP/AVIF where compatible and keep thumbnails small.
3. Do not upload original high-resolution images unless needed.
4. Avoid image transformations that are not included in the chosen plan.
5. Paginate catalog and admin lists; select only needed columns.
6. Add indexes for frequent search/filter/order queries after reviewing the query plan.
7. Do not store duplicate derived data unless it materially improves performance.
8. Avoid unnecessary Realtime channels and high-frequency refresh.
9. Track database size, storage, egress, and Auth usage during development.
10. Create a documented export/backup procedure before any real customer/order data is stored.
11. Never rely on a Free project as the only copy of critical business data.
12. Test behavior after a project is paused and resumed.

### Hosting

- Confirm whether the intended host's free plan permits the actual business/commercial use and required features.
- Check function execution, bandwidth, build, analytics, and image optimization limits.
- Use preview deployments for review and avoid unnecessary rebuilds.
- Do not promise a custom domain, uptime SLA, production backups, or uninterrupted service until confirmed.
- If the project is a real customer business, explicitly explain the risks of relying on free tiers and get approval before launch.

### Cost-control checkpoint

At the end of each phase, note any new service, usage pattern, dependency, or feature that could increase costs. Do not add a paid service or enable paid usage without explicit approval.

---

## 6. Data model — proposed starting point

Review this design against the client's actual catalog and checkout requirements before applying migrations. Use UUID primary keys, timestamps, appropriate foreign keys, constraints, and indexes.

### `categories`

- `id`
- `name`
- `slug` (unique)
- `description` (optional)
- `parent_id` (nullable self-reference if nested categories are needed)
- `is_active`
- `sort_order`
- `created_at`, `updated_at`

### `brands`

- `id`
- `name`
- `slug` (unique)
- `is_active`
- timestamps

### `products`

- `id`
- `sku` (unique)
- `name`
- `slug` (unique)
- `short_description`
- `description`
- `brand_id` (nullable if appropriate)
- `category_id`
- `price` using `numeric`, never floating-point arithmetic
- `compare_at_price` (nullable; only when legitimate)
- `currency` (one configured store currency for MVP)
- `stock_quantity` (integer with nonnegative constraint)
- `is_published`
- `weight` and dimensions only if required for shipping
- `created_at`, `updated_at`, `archived_at` (if soft archival is chosen)

### `product_images`

- `id`
- `product_id`
- `storage_path`
- `alt_text`
- `sort_order`
- `created_at`

### Vehicle fitment / compatibility

Avoid a single unstructured text field if fitment search is a core requirement. Confirm which vehicle attributes matter first. A normalized option may include:

- `vehicles`: `id`, `make`, `model`, `year`, optional engine/trim fields
- `product_fitments`: `product_id`, `vehicle_id`, optional fitment notes

Do not build a massive fitment catalog until the client supplies trustworthy data and the query experience is agreed.

### `profiles`

- `id` references the authenticated user
- `display_name`
- `phone` only if needed
- `created_at`, `updated_at`

Do not store role claims in user-editable profile fields. Prefer a tightly controlled role table or server-managed authorization model.

### `orders`

- `id`
- human-readable `order_number` generated safely and uniquely
- `user_id` nullable if guest checkout is approved
- `status` constrained to documented values
- `currency`
- `subtotal`, `shipping_amount`, `tax_amount`, `discount_amount`, `total` as fixed-precision numeric values
- customer/shipping contact snapshot fields only as required to fulfill the order
- `payment_provider`, `payment_status`, provider reference as needed
- timestamps

### `order_items`

- `id`
- `order_id`
- `product_id` nullable if products may later be deleted
- `sku_snapshot`
- `product_name_snapshot`
- `unit_price`
- `quantity` with positive constraint
- `line_total`

Order item snapshots preserve what was purchased if a product name or price changes later.

### Additional tables only when required

- `cart_items` if persistent server-side carts are needed
- `inventory_movements` for auditable stock changes
- `store_settings` for approved editable settings
- `audit_logs` for sensitive admin actions, with careful retention and no secrets
- `payment_events` for verified provider webhook/event processing

### Database rules

- Use migrations committed to version control.
- Add constraints for SKU uniqueness, slugs, positive quantity, nonnegative stock, and valid order/payment statuses.
- Use transactions for order creation and stock changes.
- Do not trust prices, discounts, totals, or stock values submitted by the browser. Recalculate from authoritative database records on the server.
- Avoid deleting products referenced by orders; archive or preserve snapshots.
- Seed only minimal development categories/products and mark seed data clearly.
- Never run destructive migrations against production without an explicit backup and approval.

---

## 7. Security requirements

Security is a release blocker, not a polish phase.

### Supabase Row Level Security (RLS)

- Enable RLS on every table exposed through the Supabase API.
- Start with deny-by-default policies.
- Public visitors can read only published products, active categories, active brands, and fields intended for public use.
- Customers can read only their own profile and orders.
- Customers must never be able to change their role, order status, payment status, prices, stock, or another user's records.
- Admin access must be enforced server-side and at the database/policy layer as appropriate.
- Do not treat a hidden admin link or client-side route guard as security.
- Do not put service-role keys in the browser.
- Test policies with anonymous, normal-user, and admin contexts.
- Avoid exposing private customer details through broad views or unfiltered queries.

### Authentication and authorization

- Define how the first admin is created securely before implementing the admin panel.
- Do not allow public self-registration to create an admin.
- Validate the current session on the server for every privileged mutation.
- Check permissions again in server actions/route handlers; UI hiding is not enough.
- Protect sensitive admin accounts with strong credentials and MFA where available.
- Rate-limit login and other abuse-prone endpoints where practical.
- Use secure session handling and appropriate cookie defaults.
- Avoid leaking whether a particular email address has an account.

### Payments and checkout

- Do not store raw card numbers, CVVs, or payment credentials.
- Use a reputable hosted/redirected checkout or tokenized provider after the client approves one.
- Never mark an order paid based solely on a browser redirect.
- Verify provider webhook signatures on the server.
- Make webhook/order processing idempotent.
- Recalculate totals on the server and validate currency.
- If no payment provider is selected, implement a clearly labeled test checkout or an approved manual-payment flow; do not simulate a successful real payment.
- Confirm tax, shipping, refund, cancellation, and legal requirements with the client.

### General safeguards

- Validate and normalize all form input.
- Escape/render user content safely; do not use unsafe HTML injection.
- Limit upload types and sizes, and verify file content as appropriate.
- Avoid logging credentials, tokens, full payment details, or unnecessary personal information.
- Add CSRF protections where the chosen mutation/auth architecture requires them.
- Set secure headers and a sensible Content Security Policy after verifying required assets.
- Review dependency advisories before release.

---

## 8. Phase-by-phase implementation plan

Do not skip ahead. Each phase ends with a report and a stop for review.

### Phase 0 — Repository inspection and project brief

**Tasks**
- Inspect the repository, package manager, scripts, current app structure, and git status.
- Identify existing implementation, design system, environment files, and dependencies.
- Do not overwrite or reset the repository.
- Ask only questions that block architecture: target market/currency, catalog/fitment needs, payment method, shipping/tax rules, guest checkout, and whether the initial launch is demo or production.
- If answers are unavailable, document safe assumptions and avoid implementing irreversible decisions.

**Deliverables**
- Short architecture plan
- Assumptions and unresolved questions
- Proposed route map and data model
- Risk list, especially free-tier and payment risks

**Acceptance criteria**
- Existing state is understood.
- No code has been changed unnecessarily.
- The next phase is clearly scoped.

### Phase 1 — App foundation and design system

**Tasks**
- Configure or verify Next.js App Router, TypeScript strict mode, styling, linting, and formatting.
- Create shared layout, typography, colors, spacing, buttons, inputs, badges, tables, dialogs, alerts, and loading/empty/error states.
- Add responsive header and footer with non-fabricated content.
- Add `.env.example`, safe environment validation, and a useful README.
- Keep dependency count small.

**Acceptance criteria**
- App starts locally.
- Lint, type-check, and build pass.
- Layout works on mobile, tablet, and desktop.
- Keyboard focus and basic accessibility are present.
- No fake functional controls remain.

### Phase 2 — Supabase setup and database migrations

**Tasks**
- Document manual Supabase project setup and environment configuration.
- Create versioned SQL migrations for the agreed schema.
- Add constraints, indexes, RLS, and least-privilege policies.
- Add minimal development seed data.
- Create typed database access patterns and server/client Supabase clients as appropriate to current official guidance.
- Document how to apply and roll back migrations safely.

**Acceptance criteria**
- Migrations apply cleanly to a fresh development database.
- RLS is enabled on exposed tables.
- Anonymous/user/admin access tests match the intended policy.
- No secrets are committed.
- No production data is needed to test the phase.

### Phase 3 — Public catalog and navigation

**Tasks**
- Implement homepage, category listing, search, filtering, sorting, pagination, and product detail pages.
- Use server-side data fetching where appropriate.
- Add SKU, stock state, pricing, product images, compatibility information, and useful empty/error states.
- Ensure URLs are shareable and product slugs are stable.
- Optimize image sizes and avoid fetching full catalog records unnecessarily.
- Add page metadata and basic SEO.

**Acceptance criteria**
- Product data comes from Supabase, not hardcoded production arrays.
- Search/filter/sort/pagination work together.
- Unpublished products are not publicly visible.
- Mobile browsing is practical.
- Missing images and empty results are handled gracefully.
- Query volume and payload size are reasonable.

### Phase 4 — Cart

**Tasks**
- Implement add-to-cart, quantity updates, removal, subtotal, empty cart, and persistence strategy.
- Decide whether the MVP uses a local guest cart, authenticated cart, or both.
- Merge carts only if the behavior is explicitly defined.
- Treat client cart data as untrusted.
- Revalidate price and stock during checkout.

**Acceptance criteria**
- Cart survives expected navigation/refresh behavior.
- Quantity validation works.
- Cart handles deleted, unpublished, or out-of-stock products.
- Totals are recalculated authoritatively on the server before order creation.

### Phase 5 — Checkout and order creation

**Tasks**
- Confirm payment, shipping, tax, cancellation, refund, and guest-checkout requirements with the client.
- Implement the approved address/contact form with server validation.
- Recalculate all totals from database records.
- Create orders and order-item snapshots transactionally.
- Prevent overselling using an appropriate atomic stock reservation/decrement strategy.
- Add a clear confirmation page and non-sensitive order reference.
- Integrate a real provider only after its credentials, region availability, fees, and webhook flow are approved.
- If provider integration is deferred, use a clearly marked test/manual-payment path.

**Acceptance criteria**
- Browser-submitted prices and totals are ignored.
- Duplicate submissions do not create duplicate paid orders.
- Stock cannot become negative under concurrent checkout attempts.
- Payment state changes only through trusted server-side verification.
- Error and retry behavior is tested.
- No fake payment success is shown.

### Phase 6 — Admin authentication and authorization

**Tasks**
- Define a secure bootstrap process for the first administrator.
- Implement protected admin routes and server-side permission checks.
- Add admin navigation and a clear unauthorized/forbidden experience.
- Ensure normal users cannot grant themselves roles or call admin mutations.
- Add audit logging for sensitive changes if in scope.

**Acceptance criteria**
- Anonymous and normal users cannot access protected admin data or actions.
- Direct server action/route requests are denied without permission.
- Admin access is tested separately from storefront access.
- No secrets or role checks depend only on client state.

### Phase 7 — Admin product and catalog management

**Tasks**
- Build product list with pagination, search, category/status filters, and clear empty states.
- Implement create/edit forms for SKU, name, slug, description, brand, category, price, stock, publish status, images, and approved fitment fields.
- Add image upload constraints, compression guidance, alt text, and ordering.
- Implement category/brand management if approved.
- Confirm before destructive actions; prefer archive over hard delete.
- Validate all changes server-side.

**Acceptance criteria**
- Admin changes persist to Supabase.
- Invalid SKUs, prices, stock, slugs, and image uploads are rejected.
- Public catalog reflects publish/unpublish changes.
- Admin list queries are paginated.
- Errors are actionable and do not expose internals.

### Phase 8 — Admin order management

**Tasks**
- Implement order list, search, filters, detail view, item snapshots, customer/shipping information needed for fulfillment, payment status, and order status.
- Define allowed status transitions and prevent invalid changes.
- Keep payment status separate from fulfillment/order status.
- Record who changed sensitive order states if audit logging is in scope.
- Avoid exposing customer information to unauthorized staff.

**Acceptance criteria**
- Admin can find and review orders efficiently.
- Invalid status transitions are blocked.
- Order item snapshots remain accurate after product edits.
- Customer data is not publicly accessible.
- Status updates are auditable where required.

### Phase 9 — Fitment and catalog quality (if required)

**Tasks**
- Confirm the client's source of vehicle compatibility data and licensing.
- Design a searchable make/model/year/engine flow only for supported data.
- Normalize fitment records and index the common lookup paths.
- Display “confirm compatibility” messaging where data is incomplete.
- Do not invent fitment compatibility.

**Acceptance criteria**
- Search results use actual supplied/approved data.
- Incompatible or unknown matches are not presented as guaranteed fits.
- The feature can be omitted from MVP if trustworthy data is unavailable.

### Phase 10 — QA, accessibility, performance, and SEO

**Tasks**
- Test main storefront and admin journeys at mobile, tablet, and desktop sizes.
- Add unit/integration tests for price calculations, validation, permissions, stock handling, and order state transitions.
- Add browser smoke tests for browsing, cart, checkout, login, product management, and order management.
- Check accessibility: semantic structure, labels, focus, keyboard navigation, contrast, error announcements, and dialogs.
- Check loading states, empty states, network errors, and Supabase unavailability.
- Add metadata, canonical URLs where appropriate, sitemap, robots rules, and product structured data only when accurate.
- Optimize image delivery, caching, database queries, and bundle size.
- Review dependency/security warnings.

**Acceptance criteria**
- Lint, type-check, tests, and production build pass.
- No critical security issue remains open.
- No broken links or dead primary actions.
- No major mobile layout defects.
- Core journeys have repeatable test steps.

### Phase 11 — Staging, launch readiness, and handover

**Tasks**
- Create a staging environment and separate credentials from production.
- Confirm hosting plan eligibility for the intended commercial use.
- Configure production environment variables without committing secrets.
- Verify domain, HTTPS, redirects, error monitoring, email delivery, payment webhooks, and allowed origins as applicable.
- Create and test a database export/backup and restore procedure.
- Verify policies: privacy, terms, shipping, returns, warranty, and contact details supplied by the business.
- Review free-tier usage and document what will trigger an upgrade.
- Train the client/admin on products, stock, orders, and recovery procedures.
- Deliver setup instructions and known limitations.

**Acceptance criteria**
- A client-approved checklist is complete.
- Payment and order flows have been tested safely.
- Backups/exports and restore steps are documented.
- No test credentials, seed data, or test-payment mode is accidentally active in production.
- Client explicitly approves launch.

---

## 9. Required route map

Adapt to the repository's conventions, but keep routes predictable. Example:

```text
/
 /products
 /categories/[slug]
 /products/[slug]
 /search
 /cart
 /checkout
 /order-confirmation/[orderNumber]
 /account
 /account/orders
 /account/orders/[orderNumber]

 /admin
 /admin/products
 /admin/products/new
 /admin/products/[id]
 /admin/categories
 /admin/brands
 /admin/orders
 /admin/orders/[id]
 /admin/settings
```

Only create account and settings pages that are in the approved scope. Never expose a sequential database ID as the only authorization mechanism.

---

## 10. Testing checklist

### Storefront
- [ ] Homepage renders without console errors.
- [ ] Category and product pages load real data.
- [ ] Search handles no results and special characters.
- [ ] Filters, sort, and pagination work together.
- [ ] Unpublished products are inaccessible to anonymous users.
- [ ] Product details display accurate price and availability.
- [ ] Broken/missing images have a fallback.
- [ ] Cart add/update/remove works.
- [ ] Checkout recalculates price and stock on the server.
- [ ] Order confirmation does not expose another customer's order.

### Admin
- [ ] Anonymous access is denied.
- [ ] Normal user access is denied.
- [ ] Admin can create/update/archive products.
- [ ] SKU and slug uniqueness are enforced.
- [ ] Image type and size are validated.
- [ ] Stock and price validation work.
- [ ] Admin can view/update permitted order fields.
- [ ] Invalid status transitions are blocked.
- [ ] Sensitive changes are logged where required.

### Engineering and operations
- [ ] Lint passes.
- [ ] Type-check passes.
- [ ] Tests pass.
- [ ] Production build passes.
- [ ] RLS policies are tested in realistic user contexts.
- [ ] No service-role key appears in client bundles or git history.
- [ ] Environment variables are documented.
- [ ] Migrations and seed steps are reproducible.
- [ ] Free-tier usage has been reviewed.
- [ ] Backup/export and restore procedure is documented.

---

## 11. Required end-of-phase report

At the end of every phase, respond using this format:

1. **Phase completed:** phase number and title.
2. **Implemented:** concise list of user-visible and technical changes.
3. **Files changed:** important files and why.
4. **Validation:** exact commands run and actual results.
5. **Security/data notes:** RLS, permissions, migrations, data handling, or risks relevant to this phase.
6. **Free-tier/cost impact:** new services, expected usage, quota concerns, or “none identified.”
7. **Known issues:** unresolved problems; do not hide failures.
8. **Next phase proposal:** brief scope and acceptance criteria.
9. **Stop:** wait for my approval before proceeding.

---

## 12. Start instruction for Antigravity

**Begin with Phase 0 only.**

Inspect the existing workspace and repository without deleting or overwriting anything. Report the current state, propose the architecture and route map, list assumptions/questions, and identify any decisions that could affect database schema, payment processing, or ongoing costs.

Do not start Phase 1 until I approve the Phase 0 report.

When Phase 1 is approved, implement only Phase 1, validate it, report the outcome, and stop again. Continue this approval-gated process through every phase.

**The goal is maintainable production-minded software, not maximum code generation per turn.**

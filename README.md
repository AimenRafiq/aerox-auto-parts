# Aerox Auto Parts

> Clean, professional, responsive auto-parts e-commerce platform built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase.

---

## 🚀 Overview

Aerox Auto Parts is an automotive storefront for browsing replacement parts by category, brand, and part number, with product details, a shopping cart, and checkout.

### Key Architectural Characteristics
- **Framework:** Next.js (App Router) + React 19 + TypeScript (Strict Mode)
- **Styling & Design System:** Tailwind CSS with custom Aerox automotive brand tokens
- **Data & Auth:** Supabase PostgreSQL with strict Row Level Security (RLS) and Supabase Storage
- **Validation:** Zod schemas at runtime boundaries
- **Free-Tier Conscious:** Optimized queries, WebP image constraints, no idle real-time channels

---

## 🎨 Brand Design Tokens

| Token | Hex Value | Usage |
|---|---|---|
| **Ink / Text** | `#202522` | Primary headings, body copy, technical labels |
| **Graphite** | `#202522` | Headers, brand containers, secondary actions |
| **Copper** | `#A85D32` | Primary action buttons, active tabs, focused elements |
| **Background** | `#F5F3EF` | Warm light page backdrop |
| **Surface** | `#FFFFFF` | Cards, modals, inputs, and content panels |
| **Muted Text** | `#71766F` | Secondary labels, descriptions, metadata |
| **Border** | `#E5E1D9` | Structural dividing borders |
| **Success** | `#247A52` | In-stock badges, fitment confirmations |
| **Warning** | `#A96812` | Low stock warnings, caution alerts |
| **Error** | `#B42318` | Destructive actions, validation errors |

---

## 🛠️ Project Structure

```text
├── src/
│   ├── app/                    # Next.js App Router pages and layouts
│   │   ├── admin/              # Admin management routes (Phase 6–8)
│   │   │   └── products/       # Search, create, and edit admin catalog items (Phase 7)
│   │   ├── cart/               # Cart review & actions (Phase 4)
│   │   ├── categories/[slug]/  # Category product listings (Phase 3)
│   │   ├── products/           # Main product catalog & search (Phase 3)
│   │   ├── error.tsx           # Global error boundary
│   │   ├── layout.tsx          # Storefront root layout
│   │   ├── loading.tsx         # Global loading skeleton
│   │   ├── not-found.tsx       # 404 page
│   │   └── page.tsx            # Storefront landing page and catalog collections
│   ├── components/
│   │   ├── home/               # Homepage hero search & preview modules
│   │   ├── layout/             # Header, Footer, and responsive navigation
│   │   └── ui/                 # Reusable UI primitives (Button, Input, Badge, etc.)
│   ├── lib/
│   │   ├── constants.ts        # Brand settings, categories, and store policies
│   │   ├── env.ts              # Zod safe environment parsing
│   │   └── utils.ts            # Class merging (cn), currency and slug helpers
│   └── styles/
│       └── globals.css         # Tailwind directives and accessible focus rings
├── supabase/
│   └── migrations/             # Versioned schema, RLS, seed, and image storage setup
├── .env.example                # Safe environment variable template
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 💻 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy the template and configure your keys:
```bash
cp .env.example .env.local
```

### 3. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Quality & Build Checks
```bash
npm run type-check    # Strict TypeScript check
npm run lint          # Next.js ESLint verification
npm test              # Unit tests (Node.js 22.6+)
npm run build         # Production Next.js build
```

Set `NEXT_PUBLIC_SITE_URL` to the canonical public origin in each deployed
environment. It is used for absolute sitemap/structured-data URLs; catalog and
product pages use canonical paths and omit the sitemap host until configured.

---

## 📋 Implementation Roadmap

- [x] **Phase 0:** Repository inspection and project brief
- [x] **Phase 1:** App foundation, design system, responsive layout, and UI primitives
- [ ] **Phase 2:** Supabase setup, migrations, RLS, and seed data
- [ ] **Phase 3:** Public catalog, search, filtering, and product detail views
- [ ] **Phase 4:** Cart management and stock revalidation
- [ ] **Phase 5:** Checkout and transactional order creation
- [ ] **Phase 6:** Admin authentication and role authorization
- [x] **Phase 7:** Admin product and catalog management
- [x] **Phase 8:** Admin order management and status transitions
- [x] **Phase 9:** Fitment and catalog quality (fitment matching deferred pending approved data source)
- [x] **Phase 10:** QA, accessibility, performance, and SEO
- [ ] **Phase 11:** Staging, launch readiness, and handover

**Fitment status:** Compatibility matching is intentionally not offered until
an approved, licensed source is supplied. Product pages ask customers to verify
application using manufacturer information; development data does not assert
vehicle matches.

## QA and Test Notes

Run `npm test`, `npm run type-check`, `npm run lint`, and `npm run build` before
release. Unit tests cover checkout validation, authoritative cart totals and
stock handling, product form validation, payment-mode restrictions, order
transitions, and SEO URL construction.

For a repeatable browser smoke check:

1. Start `npm run dev`, browse `/products`, use a filter or search, add a part,
   and review it in `/cart`.
2. Continue to `/checkout`; when Supabase is not configured, confirm the
   development-preview warning is visible. Orders in this mode are held only in
   process memory and must not be treated as real orders.
3. Visit `/admin` without a session and confirm it redirects to the login page.
   In local development, use the page's quick-fill, then check the product and
   order-management pages. Persistent writes require Supabase.
4. Check `/robots.txt` and `/sitemap.xml`; set `NEXT_PUBLIC_SITE_URL` to the
   deployed canonical origin so sitemap and structured-data URLs are absolute.

Supabase persistence, RLS, actual payment/fulfillment, and production admin
permissions were not integration-tested in this workspace because Supabase
credentials are not configured. Production checkout fails closed without a
configured database, and the development test-payment option is hidden and
rejected server-side in production.

The dependency advisory check reports 11 transitive advisories (8 high,
3 moderate; including 1 high and 1 moderate in the production dependency tree).
The available automated remediation requires major Next.js/Tailwind upgrades,
so those framework changes were not applied as part of QA; resolve the advisories
in a separately tested dependency-upgrade task before launch.

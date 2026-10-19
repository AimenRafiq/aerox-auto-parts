import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getProducts, getCategories, getBrands } from "@/lib/data/catalog";
import { ProductCard } from "@/components/catalog/product-card";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { Pagination } from "@/components/catalog/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { PackageSearch, RotateCcw } from "lucide-react";
import { STORE_NAME } from "@/lib/constants";
import { Alert } from "@/components/ui/alert";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; brand?: string }>;
}): Promise<Metadata> {
  const { q, category, brand } = await searchParams;

  let title = "Replacement Auto Parts Catalog";
  if (q) {
    title = `Search Results for "${q}"`;
  } else if (category) {
    title = `${category.replace(/-/g, " ")} Parts`;
  } else if (brand) {
    title = `${brand.replace(/-/g, " ")} Automotive Parts`;
  }

  return {
    title,
    description: `Browse replacement auto parts, brake components, suspension, and filtration systems at ${STORE_NAME}.`,
    alternates: { canonical: "/products" },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    brand?: string;
    sort?: "price-asc" | "price-desc" | "name-asc" | "newest";
    page?: string;
  }>;
}) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1", 10) || 1;

  const [categories, brands, catalogData] = await Promise.all([
    getCategories(),
    getBrands(),
    getProducts({
      page,
      limit: 12,
      categorySlug: resolvedParams.category,
      brandSlug: resolvedParams.brand,
      query: resolvedParams.q,
      sort: resolvedParams.sort,
    }),
  ]);

  const { products, totalCount, totalPages } = catalogData;
  const isCatalogConfigured = isSupabaseConfigured();

  return (
    <div className="mx-auto max-w-store px-4 pb-16 pt-8">
      {!isCatalogConfigured && (
        <Alert variant="warning" title="Preview catalog">
          These sample products are for development preview only. Connect the
          store database before accepting real orders.
        </Alert>
      )}
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-brand-muted">
        <Link href="/" className="hover:text-brand-ink transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="font-semibold text-brand-ink">Parts Catalog</span>
        {resolvedParams.q && (
          <>
            <span>/</span>
            <span className="text-brand-accent">Search: &ldquo;{resolvedParams.q}&rdquo;</span>
          </>
        )}
      </nav>

      {/* Page Heading & Count */}
      <div className="flex flex-col gap-3 border-b border-brand-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-accent">Aerox Auto Parts</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
            {resolvedParams.q
              ? `Results for "${resolvedParams.q}"`
              : resolvedParams.category
              ? `Category: ${resolvedParams.category.replace(/-/g, " ")}`
              : "All Automotive Replacement Parts"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">
            Browse part numbers and specifications. Confirm vehicle application with the manufacturer before ordering.
          </p>
        </div>
        <div className="text-sm font-medium text-brand-muted">
          Showing <span className="font-semibold text-brand-ink">{products.length}</span> of{" "}
          <span className="font-semibold text-brand-ink">{totalCount}</span> parts
        </div>
      </div>

      {/* Interactive Filters Bar */}
      <div className="mt-6">
        <CatalogFilters categories={categories} brands={brands} />
      </div>

      {/* Product Results Grid */}
      <div className="mt-8">
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination currentPage={page} totalPages={totalPages} />
          </>
        ) : (
          <EmptyState
            icon={<PackageSearch className="h-6 w-6 text-brand-navy" />}
            title="No matching automotive parts found"
            description="No parts in our current inventory match your active search terms or category filters. Try widening your criteria or clearing filters."
            action={
              <Link href="/products">
                <Button variant="outline" leftIcon={<RotateCcw className="h-4 w-4" />}>
                  Reset All Filters
                </Button>
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}

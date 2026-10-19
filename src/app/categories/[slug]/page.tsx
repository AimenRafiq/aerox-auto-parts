import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getBrands, getProducts } from "@/lib/data/catalog";
import { ProductCard } from "@/components/catalog/product-card";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { Pagination } from "@/components/catalog/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft } from "lucide-react";
import { STORE_NAME } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === slug);
  const title = cat ? cat.name : slug.replace(/-/g, " ");

  return {
    title,
    description: cat?.description || `Explore ${title} auto parts and accessories at ${STORE_NAME}.`,
    alternates: { canonical: `/categories/${slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    q?: string;
    brand?: string;
    sort?: "price-asc" | "price-desc" | "name-asc" | "newest";
    page?: string;
  }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1", 10) || 1;

  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands(),
  ]);

  const currentCategory = categories.find((c) => c.slug === slug);
  if (!currentCategory) {
    notFound();
  }

  const { products, totalCount, totalPages } = await getProducts({
    categorySlug: slug,
    page,
    limit: 12,
    brandSlug: resolvedSearchParams.brand,
    query: resolvedSearchParams.q,
    sort: resolvedSearchParams.sort,
  });

  return (
    <div className="mx-auto max-w-store px-4 pb-16 pt-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-brand-muted">
        <Link href="/" className="hover:text-brand-ink transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-brand-ink transition-colors">
          Parts Catalog
        </Link>
        <span>/</span>
        <span className="font-semibold text-brand-ink capitalize">
          {currentCategory.name}
        </span>
      </nav>

      {/* Category Banner */}
      <div className="rounded-2xl border border-brand-border bg-white p-7 shadow-sm sm:p-9">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-accent">Parts category</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
              {currentCategory.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-muted">
              {currentCategory.description ||
                "Browse part numbers and product specifications. Confirm vehicle application with the manufacturer before ordering."}
            </p>
          </div>
          <div className="text-sm font-medium text-brand-muted">
            <span className="font-semibold text-brand-ink">{totalCount}</span> parts in category
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mt-8">
        <CatalogFilters categories={categories} brands={brands} />
      </div>

      {/* Products Grid */}
      <div className="mt-6">
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <Pagination currentPage={page} totalPages={totalPages} />
          </>
        ) : (
          <EmptyState
            icon={<Package className="h-6 w-6 text-brand-navy" />}
            title={`No parts found matching active filters in ${currentCategory.name}`}
            description="Adjust your search query or brand selection to view other parts in this category."
            action={
              <Link href={`/categories/${slug}`}>
                <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Reset Category Filters
                </Button>
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}

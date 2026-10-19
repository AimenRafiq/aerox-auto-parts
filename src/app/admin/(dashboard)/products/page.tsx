import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Wrench } from "lucide-react";
import { AdminProductFilters } from "@/components/admin/admin-product-filters";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getAdminProducts,
  getCategories,
} from "@/lib/data/catalog";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { STORE_NAME } from "@/lib/constants";
import { formatCurrency, getProductImageUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Product Management",
  description: "Search and manage the product catalog and inventory.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function pageNumber(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}

function getStatus(product: {
  archived_at: string | null;
  is_published: boolean;
  stock_quantity: number;
}) {
  if (product.archived_at) return { label: "Archived", variant: "default" as const };
  if (!product.is_published) return { label: "Draft", variant: "warning" as const };
  if (product.stock_quantity === 0) return { label: "Out of stock", variant: "error" as const };
  if (product.stock_quantity <= 15) return { label: "Low stock", variant: "warning" as const };
  return { label: "Published", variant: "success" as const };
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = first(params.q)?.trim().slice(0, 100) ?? "";
  const category = first(params.category) ?? "";
  const requestedStatus = first(params.status) ?? "all";
  const status = ["all", "published", "draft", "archived", "low_stock"].includes(
    requestedStatus
  )
    ? (requestedStatus as "all" | "published" | "draft" | "archived" | "low_stock")
    : "all";
  const page = pageNumber(first(params.page));
  const supabaseConfigured = isSupabaseConfigured();

  const [catalog, categories] = await Promise.all([
    getAdminProducts({
      page,
      limit: 15,
      query,
      categorySlug: category || undefined,
      status,
    }),
    getCategories(),
  ]);
  const { products, totalCount, totalPages } = catalog;

  const pageHref = (nextPage: number) => {
    const queryParams = new URLSearchParams();
    if (query) queryParams.set("q", query);
    if (category) queryParams.set("category", category);
    if (status !== "all") queryParams.set("status", status);
    if (nextPage > 1) queryParams.set("page", String(nextPage));
    const serialized = queryParams.toString();
    return `/admin/products${serialized ? `?${serialized}` : ""}`;
  };
  if (page > totalPages) redirect(pageHref(totalPages));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-brand-border/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-ink sm:text-2xl">
            Product &amp; Catalog Management
          </h1>
          <p className="text-xs text-brand-muted">
            Search inventory, update product details, and manage storefront visibility.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
            Add product
          </Button>
        </Link>
      </div>

      {!supabaseConfigured && (
        <Alert variant="warning" title="Sample data only">
          Configure Supabase to persist product changes. Sample catalog records
          shown here cannot be edited or archived.
        </Alert>
      )}

      <AdminProductFilters categories={categories} />

      <div className="flex items-center justify-between text-xs text-brand-muted">
        <p>
          {totalCount === 0
            ? "No products found"
            : `Showing ${(page - 1) * catalog.limit + 1}–${Math.min(
                page * catalog.limit,
                totalCount
              )} of ${totalCount} products`}
        </p>
        <p>Low-stock threshold: 15 units</p>
      </div>

      {products.length === 0 ? (
        <div className="rounded border border-brand-border bg-white px-6 py-12 text-center shadow-sm">
          <Wrench className="mx-auto h-8 w-8 text-brand-muted/60" />
          <h2 className="mt-3 text-sm font-semibold text-brand-ink">
            {query || category || status !== "all"
              ? "No products match these filters"
              : "Your catalog is empty"}
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-brand-muted">
            {query || category || status !== "all"
              ? "Try changing or clearing the search, category, or status filters."
              : "Create the first product to start building the catalog."}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {(query || category || status !== "all") && (
              <Link href="/admin/products">
                <Button variant="outline" size="sm">Clear filters</Button>
              </Link>
            )}
            {totalCount === 0 && (
              <Link href="/admin/products/new">
                <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                  Add product
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const image = [...(product.images ?? [])].sort(
                (a, b) => a.sort_order - b.sort_order
              )[0];
              const productStatus = getStatus(product);
              return (
                <TableRow key={product.id}>
                  <TableCell className="min-w-64">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded border border-brand-border bg-brand-bg">
                        {image ? (
                          <Image
                            src={getProductImageUrl(image.storage_path)}
                            alt={image.alt_text || product.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <Wrench className="m-auto h-5 w-5 text-brand-muted/60" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-brand-ink">
                          {product.name}
                        </p>
                        <p className="mt-1 font-mono text-[11px] text-brand-muted">
                          {product.sku}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-brand-muted">
                    {product.category?.name ?? "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs font-semibold text-brand-ink">
                    {formatCurrency(product.price, product.currency)}
                  </TableCell>
                  <TableCell className="text-xs text-brand-ink">
                    {product.stock_quantity}
                  </TableCell>
                  <TableCell>
                    <Badge variant={productStatus.variant}>{productStatus.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {supabaseConfigured ? (
                      <ProductRowActions
                        productId={product.id}
                        productName={product.name}
                        archived={product.archived_at !== null}
                      />
                    ) : (
                      <span className="text-xs text-brand-muted">Read-only</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Product list pagination"
          className="flex items-center justify-between border-t border-brand-border pt-4"
        >
          <Link
            href={pageHref(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            tabIndex={page <= 1 ? -1 : undefined}
            className={`rounded border border-brand-border px-3 py-2 text-xs font-medium ${
              page <= 1
                ? "pointer-events-none text-brand-muted/50"
                : "bg-white text-brand-ink hover:bg-brand-bg"
            }`}
          >
            Previous
          </Link>
          <span className="text-xs text-brand-muted">
            Page {Math.min(page, totalPages)} of {totalPages}
          </span>
          <Link
            href={pageHref(Math.min(totalPages, page + 1))}
            aria-disabled={page >= totalPages}
            tabIndex={page >= totalPages ? -1 : undefined}
            className={`rounded border border-brand-border px-3 py-2 text-xs font-medium ${
              page >= totalPages
                ? "pointer-events-none text-brand-muted/50"
                : "bg-white text-brand-ink hover:bg-brand-bg"
            }`}
          >
            Next
          </Link>
        </nav>
      )}
    </div>
  );
}

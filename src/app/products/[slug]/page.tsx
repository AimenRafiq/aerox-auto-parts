import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/data/catalog";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { AddToCartForm } from "@/components/catalog/add-to-cart-form";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { STORE_NAME, STORE_POLICIES } from "@/lib/constants";
import { getAbsoluteSiteUrl } from "@/lib/seo";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Alert } from "@/components/ui/alert";
import { ShieldCheck, Truck, RotateCcw, AlertTriangle } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} (SKU: ${product.sku})`,
    description:
      product.short_description ||
      `View details and availability for ${product.name} at ${STORE_NAME}. Confirm vehicle application using the manufacturer's catalog before ordering.`,
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const isOutOfStock = product.stock_quantity === 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;
  const isCatalogConfigured = isSupabaseConfigured();
  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.short_description || product.description || undefined,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: Number(product.price).toFixed(2),
      availability: isOutOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      url: getAbsoluteSiteUrl(`/products/${product.slug}`),
    },
  };

  return (
    <div className="mx-auto max-w-store px-4 pb-16 pt-8">
      {!isCatalogConfigured && (
        <Alert variant="warning" title="Development preview">
          This is sample product data and is not available for real purchase.
        </Alert>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productStructuredData).replace(/</g, "\\u003c"),
        }}
      />
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-xs text-brand-muted">
        <Link href="/" className="hover:text-brand-ink transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-brand-ink transition-colors">
          Parts Catalog
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/categories/${product.category.slug}`}
              className="hover:text-brand-ink transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="font-semibold text-brand-ink line-clamp-1">
          {product.name}
        </span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Col: Media Gallery & Product Information (7 Cols) */}
        <div className="space-y-8 lg:col-span-7">
          <ProductGallery
            images={product.images}
            productName={product.name}
          />

          {/* Detailed Description */}
          <div className="rounded-xl border border-brand-border bg-white p-6 shadow-sm sm:p-8">
            <h2 className="border-b border-brand-border/70 pb-4 text-lg font-bold text-brand-ink">
              Product description
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-brand-ink">
              <p>{product.description || product.short_description}</p>
            </div>
          </div>

          {/* Compatibility is not claimed without a verified source. */}
          <div className="rounded-xl border border-brand-border bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-2 border-b border-brand-border/70 pb-3">
              <AlertTriangle className="h-4 w-4 text-brand-warning" />
              <h2 className="text-lg font-bold text-brand-ink">
                Vehicle Compatibility
              </h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-brand-muted">
              Vehicle application has not been verified for this product. Before
              ordering or installation, confirm part number {product.sku} against
              the vehicle identification number and the manufacturer&apos;s
              application catalog. Do not rely on a make, model, or year match alone.
            </p>
          </div>
        </div>

        {/* Right Col: Price, Stock, Buy Box, Policies (5 Cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Header Info */}
          <div className="space-y-5 rounded-2xl border border-brand-border bg-white p-6 shadow-sm sm:p-8">
            <div>
              {product.brand && (
                <Link
                  href={`/products?brand=${product.brand.slug}`}
                  className="text-xs font-bold uppercase tracking-wider text-brand-accent hover:underline"
                >
                  {product.brand.name}
                </Link>
              )}
              <h1 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-brand-ink sm:text-3xl">
                {product.name}
              </h1>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="font-mono text-brand-muted">
                  Part Number: <strong className="text-brand-ink">{product.sku}</strong>
                </span>
                <div>
                  {isOutOfStock ? (
                    <Badge variant="error">Out of Stock</Badge>
                  ) : isLowStock ? (
                    <Badge variant="warning">Low Stock ({product.stock_quantity})</Badge>
                  ) : (
                    <Badge variant="success">In Stock</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="border-t border-brand-border/70 pt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-brand-ink">
                  {formatCurrency(product.price, product.currency)}
                </span>
                {product.compare_at_price && (
                  <span className="text-sm text-brand-muted line-through">
                    {formatCurrency(product.compare_at_price, product.currency)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-brand-muted">
                Applicable taxes and shipping calculated at checkout.
              </p>
            </div>

            {/* Interactive Add to Cart Form */}
            <div className="border-t border-brand-border/70 pt-4">
              <AddToCartForm product={product} />
            </div>
          </div>

          {/* Specifications Table */}
          <div className="rounded-xl border border-brand-border bg-white p-6 shadow-sm sm:p-8">
            <h3 className="border-b border-brand-border/70 pb-4 text-lg font-bold text-brand-ink">
              Specifications
            </h3>
            <div className="mt-3 divide-y divide-brand-border/60 text-sm">
              <div className="flex justify-between py-2">
                <span className="text-brand-muted">Manufacturer / Brand</span>
                <span className="font-medium text-brand-ink">{product.brand?.name || "Not provided"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-brand-muted">Category</span>
                <span className="font-medium text-brand-ink">{product.category?.name || "Parts"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-brand-muted">Weight</span>
                <span className="font-medium text-brand-ink">
                  {product.weight ? `${product.weight} kg` : "Not provided"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-brand-muted">Dimensions / Size</span>
                <span className="font-medium text-brand-ink">
                  {product.dimensions || "Not provided"}
                </span>
              </div>
            </div>
          </div>

          {/* Store Guarantee & Confidence */}
          <div className="space-y-4 rounded-xl border border-brand-border bg-white p-6 shadow-sm sm:p-8">
            <h3 className="text-lg font-bold text-brand-ink">
              Shipping, returns &amp; warranty
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-brand-accent flex-shrink-0 mt-0.5" />
                <p className="text-brand-muted">
                  <strong className="text-brand-ink">Warranty information:</strong>{" "}
                  {STORE_POLICIES.warranty}
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <RotateCcw className="h-4 w-4 text-brand-accent flex-shrink-0 mt-0.5" />
                <p className="text-brand-muted">
                  <strong className="text-brand-ink">Returns:</strong>{" "}
                  {STORE_POLICIES.returns}
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Truck className="h-4 w-4 text-brand-accent flex-shrink-0 mt-0.5" />
                <p className="text-brand-muted">
                  <strong className="text-brand-ink">Shipping:</strong>{" "}
                  {STORE_POLICIES.shipping}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

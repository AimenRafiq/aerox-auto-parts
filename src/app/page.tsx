import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Wrench,
  Disc,
  Cog,
  Zap,
  Filter,
  Thermometer,
  ShieldCheck,
  Package,
  ArrowRight,
  Truck,
  Tag,
} from "lucide-react";
import { STORE_POLICIES } from "@/lib/constants";
import { getBrands, getCategories, getProducts } from "@/lib/data/catalog";
import { ProductCard } from "@/components/catalog/product-card";
import { HeroSearch } from "@/components/home/hero-search";
import { formatCurrency, getProductImageUrl } from "@/lib/utils";

export default async function HomePage() {
  const categoryIcons: Record<string, React.ReactNode> = {
    "braking-systems": <Disc className="h-5 w-5" />,
    "suspension-steering": <Wrench className="h-5 w-5" />,
    "filters-maintenance": <Filter className="h-5 w-5" />,
    "engine-drivetrain": <Cog className="h-5 w-5" />,
    "electrical-lighting": <Zap className="h-5 w-5" />,
    "cooling-heating": <Thermometer className="h-5 w-5" />,
  };

  const [{ products: catalogProducts }, brands, categories] = await Promise.all([
    getProducts({ limit: 50, sort: "newest" }),
    getBrands(),
    getCategories(),
  ]);
  const dealProducts = catalogProducts
    .filter(
      (product) =>
        product.compare_at_price !== null &&
        product.compare_at_price > product.price
    )
    .slice(0, 4);
  const recentProducts = catalogProducts.slice(0, 4);
  const productsByCategory = new Map(
    categories.map((category) => [
      category.id,
      catalogProducts.filter((product) => product.category_id === category.id),
    ])
  );
  const featuredProduct = catalogProducts[0];
  const featuredImage = featuredProduct?.images?.length
    ? getProductImageUrl(
        [...featuredProduct.images].sort(
          (first, second) => first.sort_order - second.sort_order
        )[0].storage_path
      )
    : "";

  return (
    <div className="mx-auto max-w-store px-4 pb-16 pt-6 sm:pt-8">
      <section className="premium-hero overflow-hidden rounded-2xl px-6 py-9 text-white shadow-xl shadow-brand-ink/10 sm:px-10 sm:py-12 lg:px-14">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#e1ae8a]">
              <span className="h-px w-7 bg-[#d18a5c]" /> Replacement parts
            </div>
            <h1 className="mt-5 max-w-xl text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.055em] text-white sm:text-5xl lg:text-[3.5rem]">
              Find replacement parts by number or category.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
              Search by part number, product name, or category.
            </p>
            <HeroSearch />
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
              <Link href="/products" className="inline-flex items-center gap-2 text-white/85 transition-colors hover:text-white">
                Shop all parts <ArrowRight className="h-4 w-4" />
              </Link>
              {dealProducts.length > 0 && (
                <Link href="#offers" className="inline-flex items-center gap-2 text-[#e1ae8a] transition-colors hover:text-white">
                  Current offers <Tag className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          {featuredProduct && (
            <Link
              href={`/products/${featuredProduct.slug}`}
              className="group relative flex min-h-[18rem] items-end overflow-hidden rounded-xl border border-white/15 bg-[#171b18] p-5 sm:min-h-[22rem] sm:p-7"
            >
              {featuredImage && (
                <Image
                  src={featuredImage}
                  alt={featuredProduct.images?.[0]?.alt_text || featuredProduct.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover opacity-55 transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#171b18] via-[#171b18]/25 to-transparent" />
              <div className="relative z-10 max-w-md">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e1ae8a]">
                  From the catalog
                </p>
                <h2 className="mt-2 text-xl font-bold leading-snug text-white sm:text-2xl">
                  {featuredProduct.name}
                </h2>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="text-lg font-bold text-white">
                    {formatCurrency(featuredProduct.price, featuredProduct.currency)}
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 group-hover:text-white">
                    View details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          )}
        </div>
      </section>

      <section aria-label="Store information" className="mt-5 grid grid-cols-1 overflow-hidden rounded-xl border border-brand-border bg-white sm:grid-cols-3">
        <div className="flex items-center gap-3 border-b border-brand-border px-5 py-4 sm:border-b-0 sm:border-r">
          <Truck className="h-5 w-5 shrink-0 text-brand-accent" />
          <p className="text-sm font-medium text-brand-ink">{STORE_POLICIES.shipping}</p>
        </div>
        <div className="flex items-center gap-3 border-b border-brand-border px-5 py-4 sm:border-b-0 sm:border-r">
          <ShieldCheck className="h-5 w-5 shrink-0 text-brand-accent" />
          <p className="text-sm font-medium text-brand-ink">{STORE_POLICIES.warranty}</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-4">
          <Package className="h-5 w-5 shrink-0 text-brand-accent" />
          <p className="text-sm font-medium text-brand-ink">Stock is checked again when an order is submitted.</p>
        </div>
      </section>

      <section className="mt-14" id="categories">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent">Shop by system</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-brand-ink sm:text-3xl">Parts categories</h2>
          </div>
          <Link
            href="/products"
            className="hidden items-center gap-2 text-sm font-bold text-brand-ink transition-colors hover:text-brand-accent sm:inline-flex"
          >
            <span>All parts</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => {
            const categoryProduct = productsByCategory.get(cat.id)?.[0];
            const categoryImage = categoryProduct?.images?.length
              ? getProductImageUrl(
                  [...categoryProduct.images].sort(
                    (first, second) => first.sort_order - second.sort_order
                  )[0].storage_path
                )
              : "";

            return (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group relative flex min-h-40 flex-col justify-end overflow-hidden rounded-xl border border-brand-border bg-brand-ink p-4 text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:min-h-48"
            >
              {categoryImage && (
                <Image
                  src={categoryImage}
                  alt={categoryProduct?.images?.[0]?.alt_text || ""}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover opacity-55 transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
              <div className="relative z-10">
                <span className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/15 text-white backdrop-blur">
                  {categoryIcons[cat.slug] || <Package className="h-5 w-5" />}
                </span>
                <span className="flex items-center justify-between gap-2 text-sm font-bold leading-snug">
                  {cat.name}
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-16 scroll-mt-36" id="offers">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent">Catalog pricing</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-brand-ink sm:text-3xl">Special offers</h2>
              <p className="mt-1 text-sm text-brand-muted">Products with a listed price reduction.</p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-ink transition-colors hover:text-brand-accent"
            >
              <span>Shop all parts</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {dealProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {dealProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-brand-border bg-white p-6 sm:flex-row sm:items-center">
              <p className="text-sm text-brand-muted">
                No products currently have a reduced listed price.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-ink hover:text-brand-accent"
              >
                Browse all parts <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
      </section>

      <section className="mt-16 scroll-mt-36 border-y border-brand-border/80 py-10" id="brands">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent">Browse makers</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-brand-ink sm:text-3xl">
                Shop by brand
              </h2>
              <p className="mt-1 text-sm text-brand-muted">
                Explore products from the brands in our catalog.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-ink transition-colors hover:text-brand-accent"
            >
              Browse all parts <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {brands.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2.5">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/products?brand=${encodeURIComponent(brand.slug)}`}
                  className="rounded-full border border-brand-border bg-white px-4 py-2.5 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-accent hover:bg-brand-accent-light hover:text-brand-accent"
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-brand-muted">
              Brand listings will appear here when available in the catalog.
            </p>
          )}
      </section>

      {recentProducts.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent">Latest catalog listings</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-brand-ink sm:text-3xl">
                Recently added
              </h2>
              <p className="mt-1 text-sm text-brand-muted">
                The latest products added to the catalog.
              </p>
            </div>
            <Link
              href="/products?sort=newest"
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-ink transition-colors hover:text-brand-accent"
            >
              Browse recent listings <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {categories.map((category) => {
        const categoryProducts = productsByCategory.get(category.id)?.slice(0, 4) ?? [];
        if (categoryProducts.length === 0) return null;

        return (
          <section key={category.id} className="mt-16">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent">
                  Browse category
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-brand-ink sm:text-3xl">
                  {category.name}
                </h2>
              </div>
              <Link
                href={`/categories/${category.slug}`}
                className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-brand-ink transition-colors hover:text-brand-accent"
              >
                <span className="hidden sm:inline">View category</span>
                <span className="sm:hidden">View all</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

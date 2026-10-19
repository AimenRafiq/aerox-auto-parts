"use client";

import React, { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Category, Brand } from "@/types/database";

export interface CatalogFiltersProps {
  categories: Category[];
  brands: Brand[];
}

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  categories,
  brands,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQuery = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentBrand = searchParams.get("brand") || "";
  const currentSort = searchParams.get("sort") || "newest";

  const [searchTerm, setSearchTerm] = useState(currentQuery);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Reset pagination to page 1 whenever filters change
    params.delete("page");

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === "" || (key === "sort" && val === "newest")) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: searchTerm.trim() || null });
  };

  const handleReset = () => {
    setSearchTerm("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters = Boolean(
    currentQuery || currentCategory || currentBrand || currentSort !== "newest"
  );

  return (
    <div className="space-y-4 rounded-xl border border-brand-border bg-white p-5 shadow-sm">
      {/* Top filter row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by SKU or name..."
            className="w-full rounded-lg border border-brand-border bg-brand-bg/50 py-3 pl-4 pr-10 text-sm text-brand-ink placeholder:text-brand-muted focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
          />
          <button
            type="submit"
            aria-label="Submit search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-ink"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Category Select */}
        <div>
          <select
            value={currentCategory}
            onChange={(e) => updateFilters({ category: e.target.value || null })}
            className="w-full rounded-lg border border-brand-border bg-brand-bg/50 px-3 py-3 text-sm text-brand-ink focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Brand Select */}
        <div>
          <select
            value={currentBrand}
            onChange={(e) => updateFilters({ brand: e.target.value || null })}
            className="w-full rounded-lg border border-brand-border bg-brand-bg/50 px-3 py-3 text-sm text-brand-ink focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.slug}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Select */}
        <div>
          <select
            value={currentSort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="w-full rounded-lg border border-brand-border bg-brand-bg/50 px-3 py-3 text-sm text-brand-ink focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
          >
            <option value="newest">Sort: Newly Listed</option>
            <option value="price-asc">Sort: Price (Low to High)</option>
            <option value="price-desc">Sort: Price (High to Low)</option>
            <option value="name-asc">Sort: Name (A to Z)</option>
          </select>
        </div>
      </div>

      {/* Active filters row */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-border/60 pt-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 text-brand-muted">
            <SlidersHorizontal className="h-3.5 w-3.5 text-brand-accent" />
            <span>Active Filters:</span>
            {currentQuery && (
              <span className="rounded bg-brand-bg px-2 py-0.5 font-medium text-brand-ink">
                Query: &ldquo;{currentQuery}&rdquo;
              </span>
            )}
            {currentCategory && (
              <span className="rounded bg-brand-bg px-2 py-0.5 font-medium text-brand-ink">
                Category: {currentCategory}
              </span>
            )}
            {currentBrand && (
              <span className="rounded bg-brand-bg px-2 py-0.5 font-medium text-brand-ink">
                Brand: {currentBrand}
              </span>
            )}
            {currentSort !== "newest" && (
              <span className="rounded bg-brand-bg px-2 py-0.5 font-medium text-brand-ink">
                Sort: {currentSort}
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isPending}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

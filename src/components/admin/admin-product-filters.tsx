"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types/database";

export interface AdminProductFiltersProps {
  categories: Category[];
}

export const AdminProductFilters: React.FC<AdminProductFiltersProps> = ({
  categories,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQuery = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentStatus = searchParams.get("status") || "all";

  const [searchTerm, setSearchTerm] = useState(currentQuery);

  useEffect(() => {
    setSearchTerm(currentQuery);
  }, [currentQuery]);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === "" || (key === "status" && val === "all")) {
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

  return (
    <div className="flex flex-col gap-3 rounded border border-brand-border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <label className="sr-only" htmlFor="admin-product-search">
            Search products by name or SKU
          </label>
          <input
            id="admin-product-search"
            type="search"
            value={searchTerm}
            maxLength={100}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by part name or SKU..."
            disabled={isPending}
            className="w-full rounded border border-brand-border bg-brand-bg/50 py-2 pl-3 pr-8 text-xs text-brand-ink placeholder:text-brand-muted focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
          />
          <button
            type="submit"
            aria-label="Submit search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-ink"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Category Filter */}
        <select
          aria-label="Filter products by category"
          value={currentCategory}
          disabled={isPending}
          onChange={(e) => updateFilters({ category: e.target.value || null })}
          className="rounded border border-brand-border bg-brand-bg/50 px-3 py-2 text-xs text-brand-ink focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          aria-label="Filter products by status"
          value={currentStatus}
          disabled={isPending}
          onChange={(e) => updateFilters({ status: e.target.value })}
          className="rounded border border-brand-border bg-brand-bg/50 px-3 py-2 text-xs text-brand-ink focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Drafts (Unpublished)</option>
          <option value="low_stock">Low Stock (&le; 15)</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {(currentQuery || currentCategory || currentStatus !== "all") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={isPending}
          leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
};

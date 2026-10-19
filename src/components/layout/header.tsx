"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, Menu, X, ShieldAlert, Truck } from "lucide-react";
import { NAVIGATION_CATEGORIES, STORE_POLICIES } from "@/lib/constants";

import { useCart } from "@/context/cart-context";

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { itemCount, isLoaded } = useCart();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    } else {
      router.push(`/products`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-border/80 bg-white/95 shadow-[0_8px_24px_-20px_rgba(32,37,34,0.45)] backdrop-blur">
      <div className="bg-brand-navy px-4 py-2 text-[11px] text-white">
        <div className="mx-auto flex max-w-store items-center justify-center gap-2 text-center">
          <Truck className="h-3.5 w-3.5 shrink-0 text-[#d79b73]" />
          <span className="font-medium text-white/90">{STORE_POLICIES.shipping}</span>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="mx-auto flex max-w-store items-center justify-between gap-4 px-4 py-4 sm:gap-8">
        {/* Brand Logo / Wordmark */}
        <Link
          href="/"
          className="group flex items-center gap-3 text-decoration-none"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-accent font-bold text-white shadow-sm transition-transform group-hover:scale-105">
            <span className="text-xl tracking-tighter">A</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-brand-ink uppercase leading-none sm:text-lg">
              AEROX
            </span>
            <span className="mt-1 text-[9px] font-bold tracking-[0.18em] text-brand-muted uppercase sm:text-[10px]">
              Auto Parts
            </span>
          </div>
        </Link>

        {/* Global Catalog Search Form */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative hidden flex-1 max-w-md sm:block"
        >
          <div className="relative flex items-center">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search parts, part numbers, or categories"
              className="w-full rounded-lg border border-brand-border bg-brand-bg/70 py-3 pl-4 pr-11 text-xs text-brand-ink placeholder:text-brand-muted/70 transition-colors focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            />
            <button
              type="submit"
              aria-label="Submit search"
              className="absolute right-1.5 flex h-9 w-9 items-center justify-center rounded-md text-brand-muted hover:bg-brand-bg hover:text-brand-ink transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Right Navigation & Cart */}
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            aria-label={`View Cart, ${isLoaded ? itemCount : 0} items`}
            className="flex items-center gap-2 rounded-lg border border-brand-border px-3 py-2.5 text-xs font-semibold text-brand-ink transition-colors hover:border-brand-accent hover:text-brand-accent"
          >
            <ShoppingBag className="h-4 w-4 text-brand-navy" />
            <span className="hidden sm:inline">Cart</span>
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-accent px-1 text-[10px] font-bold text-white">
              {isLoaded ? itemCount : 0}
            </span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle mobile menu"
            className="flex h-9 w-9 items-center justify-center rounded border border-brand-border text-brand-ink hover:bg-brand-bg md:hidden transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Desktop Category Navigation Strip */}
      <nav
        aria-label="Categories Navigation"
        className="hidden border-t border-brand-border/70 bg-white md:block"
      >
        <div className="mx-auto flex max-w-store items-center gap-2 px-4 py-2 text-xs font-medium text-brand-muted overflow-x-auto">
          <Link
            href="/products"
            className="rounded-md px-3 py-2 text-brand-ink font-semibold hover:bg-brand-bg hover:text-brand-accent transition-colors"
          >
            All Products
          </Link>
          <Link
            href="/#offers"
            className="rounded-md px-3 py-2 font-semibold text-brand-accent transition-colors hover:bg-brand-accent-light"
          >
            Offers
          </Link>
          <Link
            href="/#brands"
            className="rounded-md px-3 py-2 text-brand-ink transition-colors hover:bg-brand-bg hover:text-brand-accent"
          >
            Brands
          </Link>
          {NAVIGATION_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="rounded-md px-3 py-2 hover:bg-brand-bg hover:text-brand-accent transition-colors whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-brand-border bg-white px-4 py-4 md:hidden">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative flex items-center">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search parts, SKU, specs..."
                className="w-full rounded border border-brand-border bg-brand-bg py-2 pl-3 pr-10 text-xs"
              />
              <button
                type="submit"
                className="absolute right-2 text-brand-muted"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-2">
              Browse Categories
            </div>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded px-2 py-1.5 text-xs font-medium text-brand-ink hover:bg-brand-bg"
            >
              All Products
            </Link>
            <Link
              href="/#offers"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded px-2 py-1.5 text-xs font-semibold text-brand-accent hover:bg-brand-bg"
            >
              Current Offers
            </Link>
            <Link
              href="/#brands"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded px-2 py-1.5 text-xs font-medium text-brand-ink hover:bg-brand-bg"
            >
              Shop by Brand
            </Link>
            {NAVIGATION_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded px-2 py-1.5 text-xs text-brand-ink hover:bg-brand-bg"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="mt-4 border-t border-brand-border pt-3">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded px-2 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-bg"
            >
              <ShieldAlert className="h-4 w-4 text-brand-accent" />
              <span>Admin Management Portal</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

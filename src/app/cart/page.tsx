import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CartView } from "@/components/cart/cart-view";
export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review selected automotive replacement parts, adjust quantities, and proceed to checkout.",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-store px-4 pb-16 pt-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-brand-muted">
        <Link href="/" className="hover:text-brand-ink transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="font-semibold text-brand-ink">Shopping Cart</span>
      </nav>

      <div className="mb-8 border-b border-brand-border/70 pb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-accent">Your order</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
          Your Shopping Cart
        </h1>
        <p className="mt-2 text-sm text-brand-muted">
          Review selected automotive replacement parts, quantities, and order subtotal.
        </p>
      </div>

      <CartView />
    </div>
  );
}

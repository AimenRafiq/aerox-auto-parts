import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Order Checkout",
  description: "Review your replacement parts, shipping, and order details before submitting.",
};

export default function CheckoutPage() {
  const isDatabaseConfigured = isSupabaseConfigured();
  return (
    <div className="mx-auto max-w-store px-4 pb-16 pt-8">
      {!isDatabaseConfigured && (
        <Alert variant="warning" title="Development preview only">
          Checkout uses sample catalog data and orders are not saved to a
          database. Do not submit a real order in this environment.
        </Alert>
      )}
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-brand-muted">
        <Link href="/" className="hover:text-brand-ink transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/cart" className="hover:text-brand-ink transition-colors">
          Shopping Cart
        </Link>
        <span>/</span>
        <span className="font-semibold text-brand-ink">Order Checkout</span>
      </nav>

      <div className="mb-8 border-b border-brand-border/70 pb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-accent">Secure checkout</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
          Complete your order
        </h1>
        <p className="mt-2 text-sm text-brand-muted">
          Provide delivery destination details and choose your preferred settlement option.
        </p>
      </div>

      <CheckoutForm />
    </div>
  );
}

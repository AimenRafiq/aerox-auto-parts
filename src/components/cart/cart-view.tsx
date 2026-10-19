"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  RotateCcw,
  Truck,
  Wrench,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, getProductImageUrl } from "@/lib/utils";
import { STORE_POLICIES } from "@/lib/constants";

export const CartView: React.FC = () => {
  const {
    items,
    itemCount,
    subtotal,
    isLoaded,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-6 w-6 text-brand-navy" />}
        title="Your shopping cart is empty"
        description="You have no automotive replacement parts in your cart. Explore our catalog by category or part number to add components."
        action={
          <Link href="/products">
            <Button variant="primary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Browse Auto Parts
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Items Column (8 Cols) */}
      <div className="space-y-4 lg:col-span-8">
        <div className="overflow-hidden rounded-xl border border-brand-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-brand-border/70 bg-brand-bg/50 px-5 py-3">
            <h2 className="text-sm font-bold text-brand-ink">
              Cart Items ({itemCount})
            </h2>
            <button
              type="button"
              onClick={() => setConfirmClearOpen(true)}
              className="text-xs font-medium text-brand-error hover:underline transition-all"
            >
              Clear Cart
            </button>
          </div>

          <div className="divide-y divide-brand-border/60">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Product Info with Image */}
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded border border-brand-border bg-brand-bg">
                    {item.image ? (
                      <Image
                        src={getProductImageUrl(item.image)}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-brand-muted">
                        <Wrench className="h-6 w-6 opacity-30" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    {item.brandName && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-navy">
                        {item.brandName}
                      </span>
                    )}
                    <h3 className="text-xs sm:text-sm font-semibold text-brand-ink hover:text-brand-accent transition-colors">
                      <Link href={`/products/${item.slug}`}>{item.name}</Link>
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-brand-muted">
                      <span>SKU: {item.sku}</span>
                      <span>&bull;</span>
                      <span>Unit: {formatCurrency(item.price, item.currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Controls: Stepper, Line Total, Trash */}
                <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t border-brand-border/40 sm:border-0">
                  {/* Quantity Stepper */}
                  <div className="flex items-center rounded border border-brand-border bg-brand-bg">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      aria-label="Decrease quantity"
                      className="flex h-8 w-8 items-center justify-center text-brand-ink hover:bg-brand-border/40 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-semibold text-brand-ink">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.stockQuantity}
                      aria-label="Increase quantity"
                      className="flex h-8 w-8 items-center justify-center text-brand-ink hover:bg-brand-border/40 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[70px]">
                    <span className="text-sm font-bold text-brand-ink">
                      {formatCurrency(item.price * item.quantity, item.currency)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.name} from cart`}
                    className="rounded p-1 text-brand-muted hover:text-brand-error transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Shopping Link */}
        <div className="pt-2">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Continue Shopping Parts</span>
          </Link>
        </div>
      </div>

      {/* Summary Column (4 Cols) */}
      <div className="space-y-4 lg:col-span-4">
        <div className="space-y-5 rounded-xl border border-brand-border bg-white p-5 shadow-sm sm:p-6">
          <h2 className="border-b border-brand-border/70 pb-4 text-base font-bold text-brand-ink">
            Order Summary
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-brand-muted">
              <span>Items Subtotal ({itemCount})</span>
              <span className="font-semibold text-brand-ink">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-brand-muted">
              <span>Estimated Shipping</span>
              <span className="text-[11px] font-medium text-brand-ink">
                Calculated at checkout
              </span>
            </div>
            <div className="flex justify-between text-brand-muted">
              <span>Estimated Tax</span>
              <span className="text-[11px] font-medium text-brand-ink">
                Calculated at checkout
              </span>
            </div>
          </div>

          <div className="border-t border-brand-border/70 pt-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-bold text-brand-ink">Estimated Total</span>
              <span className="text-xl font-extrabold text-brand-ink">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-brand-muted">
              Prices will be authoritatively revalidated during order submission.
            </p>
          </div>

          <div className="pt-2">
            <Link href="/checkout" className="w-full">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>

        {/* Fulfillment Standards / Policies Callout */}
        <div className="space-y-2.5 rounded-xl border border-brand-border bg-white p-5 text-sm text-brand-muted shadow-sm">
          <div className="flex items-center gap-2 text-brand-ink font-semibold">
            <ShieldCheck className="h-4 w-4 text-brand-accent" />
            <span>Returns &amp; Warranty</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            {STORE_POLICIES.returns} {STORE_POLICIES.warranty}
          </p>
        </div>
      </div>

      {/* Confirmation Dialog for Clear Cart */}
      <Dialog
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        title="Clear Shopping Cart"
        description="Are you sure you want to remove all parts from your cart?"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmClearOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                clearCart();
                setConfirmClearOpen(false);
              }}
            >
              Clear All Items
            </Button>
          </>
        }
      >
        <p className="text-xs text-brand-muted">
          This will reset your selected auto parts and quantities. You will need to re-add items from the catalog.
        </p>
      </Dialog>
    </div>
  );
};

"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Lock,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Building,
  CreditCard,
  Banknote,
  Wrench,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, getProductImageUrl } from "@/lib/utils";
import { processCheckoutAction } from "@/actions/checkout-action";
import { isTestPaymentAllowed } from "@/lib/payment-methods";

export const CheckoutForm: React.FC = () => {
  const router = useRouter();
  const { items, itemCount, subtotal, isLoaded, clearCart } = useCart();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingStreet: "",
    shippingCity: "",
    shippingState: "",
    shippingPostalCode: "",
    shippingCountry: "United States",
    paymentMethod: "manual" as "manual" | "cod" | "test",
    notes: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

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
        icon={<Lock className="h-6 w-6 text-brand-navy" />}
        title="Your cart is empty"
        description="You have no parts in your shopping cart to complete checkout. Browse our catalog to select components."
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

  const shippingEstimate = subtotal >= 150 ? 0 : 15;
  const taxEstimate = Number((subtotal * 0.07).toFixed(2));
  const estimatedTotal = Number(
    (subtotal + shippingEstimate + taxEstimate).toFixed(2)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFormErrors({});

    const payload = {
      ...formData,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    };

    startTransition(async () => {
      try {
        const result = await processCheckoutAction(payload);
        if (result.success && result.orderNumber) {
          clearCart();
          router.push(`/order-confirmation/${result.orderNumber}`);
        } else {
          setGeneralError(result.error || "An error occurred during checkout.");
          if (result.fieldErrors) {
            setFormErrors(result.fieldErrors);
          }
        }
      } catch (err: unknown) {
        setGeneralError(
          "An unexpected connection error occurred. Please try submitting again."
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Checkout Input Sections (7 Cols) */}
      <div className="space-y-6 lg:col-span-7">
        {generalError && (
          <Alert variant="error" title="Checkout Submission Error">
            {generalError}
          </Alert>
        )}

        {/* 1. Customer Contact Details */}
        <div className="space-y-5 rounded-xl border border-brand-border bg-white p-5 shadow-sm sm:p-7">
          <div className="border-b border-brand-border/70 pb-4">
            <h2 className="text-base font-bold text-brand-ink">
              Contact information
            </h2>
            <p className="text-xs text-brand-muted">
              Used for fulfillment tracking and order status confirmations.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Full Name"
                required
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                error={formErrors.customerName?.[0]}
                placeholder="e.g. Marcus Vance"
              />
            </div>
            <div>
              <Input
                label="Email Address"
                type="email"
                required
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, customerEmail: e.target.value })
                }
                error={formErrors.customerEmail?.[0]}
                placeholder="marcus@example.com"
              />
            </div>
            <div>
              <Input
                label="Phone Number"
                type="tel"
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, customerPhone: e.target.value })
                }
                error={formErrors.customerPhone?.[0]}
                placeholder="(555) 234-5678"
                helperText="Required for commercial freight delivery coordination."
              />
            </div>
          </div>
        </div>

        {/* 2. Shipping Destination */}
        <div className="space-y-5 rounded-xl border border-brand-border bg-white p-5 shadow-sm sm:p-7">
          <div className="border-b border-brand-border/70 pb-4">
            <h2 className="text-base font-bold text-brand-ink">
              Shipping address
            </h2>
            <p className="text-xs text-brand-muted">
              Physical address for freight or parcel carrier delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Street Address"
                required
                value={formData.shippingStreet}
                onChange={(e) =>
                  setFormData({ ...formData, shippingStreet: e.target.value })
                }
                error={formErrors.shippingStreet?.[0]}
                placeholder="742 Automotive Blvd, Suite 100"
              />
            </div>
            <div>
              <Input
                label="City"
                required
                value={formData.shippingCity}
                onChange={(e) =>
                  setFormData({ ...formData, shippingCity: e.target.value })
                }
                error={formErrors.shippingCity?.[0]}
                placeholder="Detroit"
              />
            </div>
            <div>
              <Input
                label="State / Province"
                required
                value={formData.shippingState}
                onChange={(e) =>
                  setFormData({ ...formData, shippingState: e.target.value })
                }
                error={formErrors.shippingState?.[0]}
                placeholder="MI"
              />
            </div>
            <div>
              <Input
                label="ZIP / Postal Code"
                required
                value={formData.shippingPostalCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shippingPostalCode: e.target.value,
                  })
                }
                error={formErrors.shippingPostalCode?.[0]}
                placeholder="48201"
              />
            </div>
            <div>
              <Input
                label="Country"
                required
                value={formData.shippingCountry}
                onChange={(e) =>
                  setFormData({ ...formData, shippingCountry: e.target.value })
                }
                error={formErrors.shippingCountry?.[0]}
                placeholder="United States"
              />
            </div>
          </div>
        </div>

        {/* 3. Payment Method */}
        <div className="space-y-5 rounded-xl border border-brand-border bg-white p-5 shadow-sm sm:p-7">
          <div className="border-b border-brand-border/70 pb-4">
            <h2 className="text-base font-bold text-brand-ink">
              Payment method
            </h2>
            <p className="text-xs text-brand-muted">
              Select an approved payment or settlement approach for this order.
            </p>
          </div>

          <div className="space-y-3">
            {/* Option A: Bank Wire */}
            <label
              className={`flex items-start gap-3 rounded border p-3.5 cursor-pointer transition-all ${
                formData.paymentMethod === "manual"
                  ? "border-brand-accent bg-brand-accent-light/40 ring-1 ring-brand-accent"
                  : "border-brand-border hover:bg-brand-bg/50"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="manual"
                checked={formData.paymentMethod === "manual"}
                onChange={() =>
                  setFormData({ ...formData, paymentMethod: "manual" })
                }
                className="mt-1 text-brand-accent focus:ring-brand-accent"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-brand-ink">
                  <Building className="h-4 w-4 text-brand-navy" />
                  <span>Manual Payment Arrangement</span>
                </div>
                <p className="text-[11px] text-brand-muted leading-relaxed">
                  No online payment is processed. Confirm the accepted payment method with the store before fulfillment.
                </p>
              </div>
            </label>

            {/* Option B: Cash / Cheque on Delivery */}
            <label
              className={`flex items-start gap-3 rounded border p-3.5 cursor-pointer transition-all ${
                formData.paymentMethod === "cod"
                  ? "border-brand-accent bg-brand-accent-light/40 ring-1 ring-brand-accent"
                  : "border-brand-border hover:bg-brand-bg/50"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={formData.paymentMethod === "cod"}
                onChange={() =>
                  setFormData({ ...formData, paymentMethod: "cod" })
                }
                className="mt-1 text-brand-accent focus:ring-brand-accent"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-brand-ink">
                  <Banknote className="h-4 w-4 text-brand-navy" />
                  <span>Cash on Delivery (If Confirmed)</span>
                </div>
                <p className="text-[11px] text-brand-muted leading-relaxed">
                  This records a request only. Confirm cash-on-delivery availability with the store before ordering.
                </p>
              </div>
            </label>

            {/* Option C: Test Checkout */}
            {isTestPaymentAllowed() && (
              <label
                className={`flex items-start gap-3 rounded border p-3.5 cursor-pointer transition-all ${
                  formData.paymentMethod === "test"
                    ? "border-brand-accent bg-brand-accent-light/40 ring-1 ring-brand-accent"
                    : "border-brand-border hover:bg-brand-bg/50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="test"
                  checked={formData.paymentMethod === "test"}
                  onChange={() =>
                    setFormData({ ...formData, paymentMethod: "test" })
                  }
                  className="mt-1 text-brand-accent focus:ring-brand-accent"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-brand-ink">
                    <CreditCard className="h-4 w-4 text-brand-navy" />
                    <span>Test Mode (Development Only)</span>
                  </div>
                  <p className="text-[11px] text-brand-muted leading-relaxed">
                    Creates a test order only. No payment is processed and inventory is not decremented.
                  </p>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* 4. Special Instructions (Optional) */}
        <div className="space-y-3 rounded-xl border border-brand-border bg-white p-5 shadow-sm sm:p-7">
          <label
            htmlFor="order-notes"
            className="block text-sm font-semibold text-brand-ink"
          >
            Special Instructions / Delivery Notes (Optional)
          </label>
          <textarea
            id="order-notes"
            rows={2}
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="e.g. Loading dock entrance on West Street, call upon dispatch..."
            className="w-full rounded-lg border border-brand-border bg-white p-3 text-sm text-brand-ink placeholder:text-brand-muted focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
          />
        </div>
      </div>

      {/* Order Review Sidebar (5 Cols) */}
      <div className="space-y-4 lg:col-span-5">
        <div className="space-y-5 rounded-xl border border-brand-border bg-white p-5 shadow-sm sm:p-7">
          <div className="border-b border-brand-border/70 pb-4">
            <h2 className="text-base font-bold text-brand-ink">
              Order Summary ({itemCount} parts)
            </h2>
          </div>

          {/* Line items list */}
          <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-brand-border/60">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 pt-3 first:pt-0">
                <div className="relative h-12 w-14 flex-shrink-0 overflow-hidden rounded border border-brand-border bg-brand-bg">
                  {item.image ? (
                    <Image
                      src={getProductImageUrl(item.image)}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-brand-muted">
                      <Wrench className="h-4 w-4 opacity-30" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-brand-ink truncate">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-brand-muted font-mono">
                    SKU: {item.sku} &bull; Qty: {item.quantity}
                  </p>
                </div>

                <div className="text-right text-xs font-bold text-brand-ink">
                  {formatCurrency(item.price * item.quantity, item.currency)}
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-brand-border/70 pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-brand-muted">
              <span>Subtotal</span>
              <span className="font-semibold text-brand-ink">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-brand-muted">
              <span>Ground Freight &amp; Shipping</span>
              <span className="font-semibold text-brand-ink">
                {shippingEstimate === 0 ? "FREE" : formatCurrency(shippingEstimate)}
              </span>
            </div>
            <div className="flex justify-between text-brand-muted">
              <span>Estimated Tax (7%)</span>
              <span className="font-semibold text-brand-ink">
                {formatCurrency(taxEstimate)}
              </span>
            </div>
          </div>

          <div className="border-t border-brand-border/70 pt-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-bold text-brand-ink">Total</span>
              <span className="text-2xl font-black text-brand-ink">
                {formatCurrency(estimatedTotal)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-brand-muted">
              Totals verified authoritatively on the server upon order placement.
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            variant="primary"
            disabled={isPending}
            isLoading={isPending}
            className="w-full"
            leftIcon={<CheckCircle2 className="h-4 w-4" />}
          >
            {isPending ? "Validating & Placing Order..." : "Place Order"}
          </Button>

        </div>

        {/* Security and Trust Banner */}
        <div className="space-y-2 rounded-xl border border-brand-border bg-white p-5 text-sm text-brand-muted shadow-sm">
          <div className="flex items-center gap-2 text-brand-ink font-semibold">
            <ShieldCheck className="h-4 w-4 text-brand-accent" />
            <span>Server-Authoritative Order Protection</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Cart item availability, pricing, and stock limits are rechecked against the configured catalog. No online payment credentials are collected.
          </p>
        </div>
      </div>
    </form>
  );
};

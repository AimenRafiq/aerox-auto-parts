import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Package,
  ArrowRight,
  ShieldCheck,
  Building,
  Truck,
  FileText,
} from "lucide-react";
import { getOrderByNumber } from "@/lib/data/order-store";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { PrintReceiptButton } from "@/components/checkout/print-button";
import { STORE_NAME } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `Order Confirmation #${orderNumber}`,
    description: `View the itemized receipt for order #${orderNumber}.`,
  };
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    notFound();
  }

  const shippingAddr = order.shipping_address as {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };

  return (
    <div className="mx-auto max-w-store px-4 py-8 sm:py-12">
      {/* Top Success Banner */}
      <div className="rounded border border-brand-success/30 bg-brand-success-light p-6 text-center sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-success text-white">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <span className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-brand-success">
          Order Successfully Placed
        </span>
        <h1 className="mt-1 text-2xl font-black text-brand-ink sm:text-3xl">
          Thank you for your order, {order.customer_name}!
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-brand-ink/80 max-w-xl mx-auto leading-relaxed">
          Your order has been recorded in our fulfillment queue under reference{" "}
          <strong className="font-mono text-brand-navy">{order.order_number}</strong>. A confirmation copy has been dispatched to{" "}
          <strong className="text-brand-ink">{order.customer_email}</strong>.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <PrintReceiptButton />
          <Link href="/products">
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Continue Browsing Parts
            </Button>
          </Link>
        </div>
      </div>

      {/* Order Details & Summary Cards */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Order Meta Card */}
        <div className="rounded border border-brand-border bg-white p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-ink border-b border-brand-border/60 pb-2">
            Order Information
          </h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-brand-muted">Order Number:</span>
              <span className="font-mono font-bold text-brand-ink">
                {order.order_number}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Placed On:</span>
              <span className="text-brand-ink">
                {new Date(order.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-brand-muted">Fulfillment Status:</span>
              <Badge variant="warning">{order.status}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-brand-muted">Payment Mode:</span>
              <span className="font-semibold uppercase tracking-wider text-[11px] text-brand-navy">
                {order.payment_provider}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Contact */}
        <div className="rounded border border-brand-border bg-white p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-ink border-b border-brand-border/60 pb-2">
            Customer Contact
          </h3>
          <div className="space-y-1 text-xs text-brand-ink">
            <p className="font-semibold">{order.customer_name}</p>
            <p className="text-brand-muted">{order.customer_email}</p>
            {order.customer_phone && (
              <p className="text-brand-muted">{order.customer_phone}</p>
            )}
          </div>
        </div>

        {/* Shipping Destination */}
        <div className="rounded border border-brand-border bg-white p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-ink border-b border-brand-border/60 pb-2">
            Shipping Destination
          </h3>
          <div className="space-y-0.5 text-xs text-brand-ink">
            <p>{shippingAddr.street || "Standard Delivery"}</p>
            <p>
              {shippingAddr.city}, {shippingAddr.state} {shippingAddr.postalCode}
            </p>
            <p className="text-brand-muted">{shippingAddr.country}</p>
          </div>
        </div>
      </div>

      {/* Itemized Order Line Snapshots Table */}
      <div className="mt-8 rounded border border-brand-border bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-brand-border/70 pb-3">
          <Package className="h-4 w-4 text-brand-accent" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-ink">
            Itemized Order Snapshots
          </h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part SKU</TableHead>
              <TableHead>Purchased Component Description</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Line Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs font-bold text-brand-navy">
                  {item.sku_snapshot}
                </TableCell>
                <TableCell className="text-xs font-medium text-brand-ink">
                  {item.product_name_snapshot}
                </TableCell>
                <TableCell className="text-center text-xs">
                  {item.quantity}
                </TableCell>
                <TableCell className="text-right text-xs text-brand-muted">
                  {formatCurrency(item.unit_price, order.currency)}
                </TableCell>
                <TableCell className="text-right text-xs font-bold text-brand-ink">
                  {formatCurrency(item.line_total, order.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Totals Section */}
        <div className="flex flex-col items-end pt-4 space-y-1.5 text-xs">
          <div className="flex justify-between w-64 text-brand-muted">
            <span>Subtotal:</span>
            <span className="font-semibold text-brand-ink">
              {formatCurrency(order.subtotal, order.currency)}
            </span>
          </div>
          <div className="flex justify-between w-64 text-brand-muted">
            <span>Shipping:</span>
            <span className="font-semibold text-brand-ink">
              {order.shipping_amount === 0
                ? "FREE"
                : formatCurrency(order.shipping_amount, order.currency)}
            </span>
          </div>
          <div className="flex justify-between w-64 text-brand-muted">
            <span>Sales Tax (7%):</span>
            <span className="font-semibold text-brand-ink">
              {formatCurrency(order.tax_amount, order.currency)}
            </span>
          </div>
          <div className="flex justify-between w-64 border-t border-brand-border/70 pt-2 text-sm">
            <span className="font-bold text-brand-ink">Final Order Total:</span>
            <span className="font-extrabold text-brand-ink text-base">
              {formatCurrency(order.total, order.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Settlement & Fulfillment Protocol */}
      <div className="mt-8 rounded border border-brand-border bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-ink border-b border-brand-border/70 pb-3">
          Settlement Instructions &amp; Packaging Protocol
        </h3>

        {order.payment_provider === "manual" && (
          <div className="space-y-2 text-xs text-brand-ink leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-brand-navy">
              <Building className="h-4 w-4 text-brand-accent" />
              <span>Direct Bank Wire Settlement</span>
            </div>
            <p className="text-brand-muted">
              Please reference order number <strong className="font-mono text-brand-ink">{order.order_number}</strong> on your wire transfer or ACH remittance. Commercial packing will initiate immediately upon funds confirmation.
            </p>
          </div>
        )}

        {order.payment_provider === "cod" && (
          <div className="space-y-2 text-xs text-brand-ink leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-brand-navy">
              <Truck className="h-4 w-4 text-brand-accent" />
              <span>Cash / Certified Cheque on Delivery</span>
            </div>
            <p className="text-brand-muted">
              Please have an authorized recipient with exact settlement or certified cashier&apos;s cheque ready for the delivery driver upon freight arrival.
            </p>
          </div>
        )}

        {order.payment_provider === "test" && (
          <div className="space-y-2 text-xs text-brand-ink leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-brand-navy">
              <ShieldCheck className="h-4 w-4 text-brand-accent" />
              <span>Development Test Verification</span>
            </div>
            <p className="text-brand-muted">
              This order was placed using Test Mode. Inventory snapshots were recorded and order verification routines executed without initiating real financial charges.
            </p>
          </div>
        )}

        <p className="border-t border-brand-border/60 pt-4 text-xs text-brand-muted">
          Retain this order number for your records.
        </p>
      </div>
    </div>
  );
}

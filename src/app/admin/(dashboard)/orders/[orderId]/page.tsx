import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, ReceiptText, Truck } from "lucide-react";
import { OrderStatusControl } from "@/components/admin/order-status-control";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdminOrderById } from "@/lib/data/admin-orders";
import { ORDER_STATUS_TRANSITIONS } from "@/lib/order-workflow";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatCurrency } from "@/lib/utils";
import type { Json } from "@/types/database";

export const metadata: Metadata = {
  title: "Order Details",
};

function addressFields(address: Json): [string, string][] {
  if (!address || Array.isArray(address) || typeof address !== "object") return [];
  return Object.entries(address).filter(
    (entry): entry is [string, string] =>
      typeof entry[1] === "string" && entry[1].trim().length > 0
  );
}

function labelForField(field: string): string {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function dateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId)) {
    notFound();
  }
  const order = await getAdminOrderById(orderId);
  if (!order) notFound();

  const address = addressFields(order.shipping_address);
  const paymentStatusVariant =
    order.payment_status === "paid" || order.payment_status === "authorized"
      ? "success"
      : order.payment_status === "failed" || order.payment_status === "refunded"
        ? "error"
        : "warning";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 border-b border-brand-border/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-brand-muted hover:text-brand-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All orders
          </Link>
          <h1 className="text-xl font-bold text-brand-ink sm:text-2xl">
            Order {order.order_number}
          </h1>
          <p className="mt-1 text-xs text-brand-muted">
            Placed <time dateTime={order.created_at}>{dateTime(order.created_at)}</time>
          </p>
        </div>
        <Badge variant="accent">{order.status.replace(/_/g, " ")}</Badge>
      </div>

      {!isSupabaseConfigured() && (
        <Alert variant="warning" title="Read-only demo data">
          This order is from local in-memory checkout state and cannot be managed
          or persisted.
        </Alert>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <section className="rounded border border-brand-border bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-brand-border px-5 py-4">
              <ReceiptText className="h-4 w-4 text-brand-navy" />
              <h2 className="text-sm font-semibold text-brand-ink">Purchased items</h2>
            </div>
            {order.items.length === 0 ? (
              <p className="p-5 text-sm text-brand-muted">No item snapshots were saved for this order.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[36rem] text-left">
                  <thead className="border-b border-brand-border bg-brand-bg/60 text-[11px] uppercase tracking-wider text-brand-muted">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Part</th>
                      <th className="px-4 py-3 font-semibold">SKU snapshot</th>
                      <th className="px-4 py-3 text-right font-semibold">Unit price</th>
                      <th className="px-4 py-3 text-right font-semibold">Qty</th>
                      <th className="px-5 py-3 text-right font-semibold">Line total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-5 py-4 text-xs font-semibold text-brand-ink">
                          {item.product_name_snapshot}
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-brand-muted">
                          {item.sku_snapshot}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right text-xs text-brand-ink">
                          {formatCurrency(item.unit_price, order.currency)}
                        </td>
                        <td className="px-4 py-4 text-right text-xs text-brand-ink">
                          {item.quantity}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-right text-xs font-semibold text-brand-ink">
                          {formatCurrency(item.line_total, order.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="ml-auto max-w-sm space-y-2 border-t border-brand-border px-5 py-4 text-xs">
              <div className="flex justify-between text-brand-muted">
                <span>Subtotal</span><span>{formatCurrency(order.subtotal, order.currency)}</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>Shipping</span><span>{formatCurrency(order.shipping_amount, order.currency)}</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>Tax</span><span>{formatCurrency(order.tax_amount, order.currency)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-brand-muted">
                  <span>Discount</span><span>−{formatCurrency(order.discount_amount, order.currency)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-brand-border pt-2 text-sm font-bold text-brand-ink">
                <span>Total</span><span>{formatCurrency(order.total, order.currency)}</span>
              </div>
            </div>
          </section>

          <section className="rounded border border-brand-border bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-brand-border px-5 py-4">
              <Truck className="h-4 w-4 text-brand-navy" />
              <h2 className="text-sm font-semibold text-brand-ink">Shipping details</h2>
            </div>
            {address.length ? (
              <dl className="grid gap-x-6 gap-y-4 p-5 sm:grid-cols-2">
                {address.map(([field, value]) => (
                  <div key={field}>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
                      {labelForField(field)}
                    </dt>
                    <dd className="mt-1 break-words text-sm text-brand-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="p-5 text-sm text-brand-muted">No shipping address was saved.</p>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="space-y-4 rounded border border-brand-border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-brand-ink">Customer</h2>
            <p className="text-sm font-semibold text-brand-ink">{order.customer_name}</p>
            <a
              href={`mailto:${encodeURIComponent(order.customer_email)}`}
              className="flex items-center gap-2 break-all text-xs text-brand-accent hover:underline"
            >
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {order.customer_email}
            </a>
            {order.customer_phone && (
              <a
                href={`tel:${encodeURIComponent(order.customer_phone)}`}
                className="flex items-center gap-2 text-xs text-brand-accent hover:underline"
              >
                <Phone className="h-3.5 w-3.5 shrink-0" />
                {order.customer_phone}
              </a>
            )}
          </section>

          <section className="space-y-4 rounded border border-brand-border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-brand-ink">Payment</h2>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-brand-muted">Payment status</span>
              <Badge variant={paymentStatusVariant}>
                {order.payment_status.replace(/_/g, " ")}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-brand-muted">Provider</span>
              <span className="text-xs font-medium uppercase text-brand-ink">
                {order.payment_provider}
              </span>
            </div>
            {order.payment_reference && (
              <div className="space-y-1">
                <span className="block text-xs text-brand-muted">Reference</span>
                <span className="block break-all font-mono text-[11px] text-brand-ink">
                  {order.payment_reference}
                </span>
              </div>
            )}
            <p className="border-t border-brand-border pt-3 text-[11px] leading-relaxed text-brand-muted">
              Payment information is displayed for reference only. Fulfillment
              status changes do not authorize, capture, or refund payments.
            </p>
          </section>

          <section className="space-y-4 rounded border border-brand-border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-brand-ink">Fulfillment</h2>
            {isSupabaseConfigured() ? (
              <OrderStatusControl orderId={order.id} status={order.status} />
            ) : (
              <p className="text-xs text-brand-muted">
                Configure Supabase to update order status.
              </p>
            )}
            {order.notes && (
              <div className="border-t border-brand-border pt-3">
                <h3 className="text-xs font-semibold text-brand-ink">Customer notes</h3>
                <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-brand-muted">
                  {order.notes}
                </p>
              </div>
            )}
            <p className="text-[11px] text-brand-muted">
              Available next statuses: {ORDER_STATUS_TRANSITIONS[order.status].length
                ? ORDER_STATUS_TRANSITIONS[order.status].join(", ")
                : "none (final status)"}
            </p>
          </section>

          <Link href="/admin/orders" className="block">
            <Button variant="outline" className="w-full">
              Back to order list
            </Button>
          </Link>
        </aside>
      </div>
    </div>
  );
}

import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, ShoppingBag } from "lucide-react";
import { AdminOrderFilters } from "@/components/admin/admin-order-filters";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminOrders } from "@/lib/data/admin-orders";
import { isPaymentStatus, ORDER_STATUSES } from "@/lib/order-workflow";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order Fulfillment",
  description: "Search, review, and update customer orders.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function dateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusVariant(status: string): "default" | "accent" | "success" | "warning" | "error" {
  switch (status) {
    case "confirmed":
    case "processing":
      return "accent";
    case "shipped":
    case "delivered":
      return "success";
    case "cancelled":
    case "failed":
      return "error";
    case "pending":
    case "authorized":
      return "warning";
    case "paid":
      return "success";
    default:
      return "default";
  }
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = first(params.q)?.trim().slice(0, 100) ?? "";
  const requestedStatus = first(params.status) ?? "all";
  const status = requestedStatus === "all" || ORDER_STATUSES.includes(requestedStatus as (typeof ORDER_STATUSES)[number])
    ? (requestedStatus as "all" | (typeof ORDER_STATUSES)[number])
    : "all";
  const requestedPayment = first(params.payment) ?? "all";
  const paymentStatus =
    requestedPayment === "all" || isPaymentStatus(requestedPayment)
      ? requestedPayment
      : "all";
  const parsedPage = Number(first(params.page));
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const configured = isSupabaseConfigured();
  const result = await getAdminOrders({
    page,
    limit: 20,
    query,
    status,
    paymentStatus,
  });
  const { orders, totalCount, totalPages } = result;

  const pageHref = (nextPage: number) => {
    const queryParams = new URLSearchParams();
    if (query) queryParams.set("q", query);
    if (status !== "all") queryParams.set("status", status);
    if (paymentStatus !== "all") queryParams.set("payment", paymentStatus);
    if (nextPage > 1) queryParams.set("page", String(nextPage));
    const serialized = queryParams.toString();
    return `/admin/orders${serialized ? `?${serialized}` : ""}`;
  };
  if (page > totalPages) redirect(pageHref(totalPages));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 border-b border-brand-border/70 pb-4">
        <h1 className="text-xl font-bold text-brand-ink sm:text-2xl">
          Customer Orders &amp; Fulfillment
        </h1>
        <p className="text-xs text-brand-muted">
          Find orders, review purchase snapshots, and manage fulfillment status.
          Payment status is shown separately and is not changed here.
        </p>
      </div>

      {!configured && (
        <Alert variant="warning" title="Supabase is not configured">
          Orders are stored only in the configured database. Connect Supabase to
          search and manage persisted orders; no sample or customer records are shown here.
        </Alert>
      )}

      <AdminOrderFilters />

      <div className="flex items-center justify-between text-xs text-brand-muted">
        <span>
          {totalCount === 0
            ? "No orders found"
            : `Showing ${(page - 1) * result.limit + 1}–${Math.min(
                page * result.limit,
                totalCount
              )} of ${totalCount} orders`}
        </span>
        <span>Sorted newest first</span>
      </div>

      {orders.length === 0 ? (
        <div className="rounded border border-brand-border bg-white px-6 py-12 text-center shadow-sm">
          {query || status !== "all" ? (
            <Search className="mx-auto h-8 w-8 text-brand-muted/60" />
          ) : (
            <ShoppingBag className="mx-auto h-8 w-8 text-brand-muted/60" />
          )}
          <h2 className="mt-3 text-sm font-semibold text-brand-ink">
            {query || status !== "all" || paymentStatus !== "all"
              ? "No orders match these filters"
              : "No orders yet"}
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-brand-muted">
            {query || status !== "all" || paymentStatus !== "all"
              ? "Try another search or clear the order status filter."
              : "Orders placed through the storefront will appear here."}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Order status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Placed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
              return (
                <TableRow key={order.id}>
                  <TableCell className="whitespace-nowrap">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-mono text-xs font-semibold text-brand-accent hover:underline"
                    >
                      {order.order_number}
                    </Link>
                  </TableCell>
                  <TableCell className="min-w-52">
                    <p className="text-xs font-semibold text-brand-ink">{order.customer_name}</p>
                    <a
                      href={`mailto:${encodeURIComponent(order.customer_email)}`}
                      className="mt-1 block truncate text-xs text-brand-muted hover:text-brand-accent"
                    >
                      {order.customer_email}
                    </a>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-brand-ink">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs font-semibold text-brand-ink">
                    {formatCurrency(order.total, order.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(order.status)}>
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(order.payment_status)}>
                      {order.payment_status.replace(/_/g, " ")}
                    </Badge>
                    <span className="mt-1 block text-[10px] text-brand-muted">
                      {order.payment_provider.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-brand-muted">
                    <time dateTime={order.created_at}>{dateTime(order.created_at)}</time>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Order list pagination"
          className="flex items-center justify-between border-t border-brand-border pt-4"
        >
          <Link
            href={pageHref(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            tabIndex={page <= 1 ? -1 : undefined}
            className={`rounded border border-brand-border px-3 py-2 text-xs font-medium ${
              page <= 1
                ? "pointer-events-none text-brand-muted/50"
                : "bg-white text-brand-ink hover:bg-brand-bg"
            }`}
          >
            Previous
          </Link>
          <span className="text-xs text-brand-muted">Page {page} of {totalPages}</span>
          <Link
            href={pageHref(Math.min(totalPages, page + 1))}
            aria-disabled={page >= totalPages}
            tabIndex={page >= totalPages ? -1 : undefined}
            className={`rounded border border-brand-border px-3 py-2 text-xs font-medium ${
              page >= totalPages
                ? "pointer-events-none text-brand-muted/50"
                : "bg-white text-brand-ink hover:bg-brand-bg"
            }`}
          >
            Next
          </Link>
        </nav>
      )}
    </div>
  );
}

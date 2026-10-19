"use client";

import React, { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/order-workflow";

export function AdminOrderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const currentQuery = searchParams.get("q") ?? "";
  const currentStatus = searchParams.get("status") ?? "all";
  const currentPaymentStatus = searchParams.get("payment") ?? "all";
  const [searchTerm, setSearchTerm] = useState(currentQuery);

  useEffect(() => setSearchTerm(currentQuery), [currentQuery]);

  const updateFilters = (values: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    for (const [key, value] of Object.entries(values)) {
      if (!value || (key === "status" && value === "all")) params.delete(key);
      else params.set(key, value);
    }
    const query = params.toString();
    startTransition(() => router.push(`${pathname}${query ? `?${query}` : ""}`));
  };

  const clearFilters = () => {
    setSearchTerm("");
    startTransition(() => router.push(pathname));
  };

  return (
    <div className="flex flex-col gap-3 rounded border border-brand-border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <form
          className="relative max-w-md flex-1"
          onSubmit={(event) => {
            event.preventDefault();
            updateFilters({ q: searchTerm.trim().slice(0, 100) || null });
          }}
        >
          <label htmlFor="admin-order-search" className="sr-only">
            Search orders by order number, customer name, or email
          </label>
          <input
            id="admin-order-search"
            type="search"
            value={searchTerm}
            maxLength={100}
            disabled={isPending}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Order number, customer, or email..."
            className="w-full rounded border border-brand-border bg-brand-bg/50 py-2 pl-3 pr-9 text-xs text-brand-ink placeholder:text-brand-muted focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
          />
          <button
            type="submit"
            aria-label="Search orders"
            disabled={isPending}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-ink disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>
        <label className="sr-only" htmlFor="admin-order-status-filter">
          Filter orders by status
        </label>
        <select
          id="admin-order-status-filter"
          value={currentStatus}
          disabled={isPending}
          onChange={(event) => updateFilters({ status: event.target.value })}
          className="rounded border border-brand-border bg-brand-bg/50 px-3 py-2 text-xs text-brand-ink focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
        >
          <option value="all">All order statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="admin-order-payment-filter">
          Filter orders by payment status
        </label>
        <select
          id="admin-order-payment-filter"
          value={currentPaymentStatus}
          disabled={isPending}
          onChange={(event) => updateFilters({ payment: event.target.value })}
          className="rounded border border-brand-border bg-brand-bg/50 px-3 py-2 text-xs text-brand-ink focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
        >
          <option value="all">All payment statuses</option>
          {PAYMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              Payment: {status.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>
      {(currentQuery || currentStatus !== "all" || currentPaymentStatus !== "all") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          disabled={isPending}
          leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}

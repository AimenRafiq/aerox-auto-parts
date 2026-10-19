import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Package,
  AlertTriangle,
  ShoppingBag,
  Layers,
  ArrowRight,
  Plus,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { getProducts, getCategories, getBrands } from "@/lib/data/catalog";
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
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Overview",
  description: "Administrative dashboard for inventory alerts, catalog counts, and order fulfillment.",
};

export default async function AdminDashboardPage() {
  const [catalogData, categories, brands] = await Promise.all([
    getProducts({ limit: 50 }),
    getCategories(),
    getBrands(),
  ]);

  const { products, totalCount } = catalogData;

  const lowStockItems = products.filter(
    (p) => p.stock_quantity > 0 && p.stock_quantity <= 15
  );
  const outOfStockItems = products.filter((p) => p.stock_quantity === 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-brand-border/70 pb-4">
        <div>
          <h1 className="text-xl font-bold text-brand-ink sm:text-2xl">
            Store Operations Overview
          </h1>
          <p className="text-xs text-brand-muted">
            Live catalog status, stock depletion alerts, and fulfillment routing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/products/new">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add New Part
            </Button>
          </Link>
        </div>
      </div>

      {/* Operational KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Total Catalog Items */}
        <div className="rounded border border-brand-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Published Catalog
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-navy/10 text-brand-navy">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-brand-ink">
              {totalCount}
            </span>
            <span className="ml-1 text-xs text-brand-muted">active parts</span>
          </div>
          <div className="mt-2 text-[11px] text-brand-muted">
            Spanning {categories.length} automotive categories
          </div>
        </div>

        {/* KPI 2: Low Stock Warning */}
        <div className="rounded border border-brand-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Inventory Depletion
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-warning-light text-brand-warning">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-brand-ink">
              {lowStockItems.length}
            </span>
            <span className="ml-1 text-xs text-brand-muted">low-stock alerts</span>
          </div>
          <div className="mt-2 text-[11px] text-brand-muted">
            {outOfStockItems.length} parts completely depleted
          </div>
        </div>

        {/* KPI 3: Verified Brands */}
        <div className="rounded border border-brand-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Approved Manufacturers
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-navy/10 text-brand-navy">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-brand-ink">
              {brands.length}
            </span>
            <span className="ml-1 text-xs text-brand-muted">partner brands</span>
          </div>
          <div className="mt-2 text-[11px] text-brand-muted">
            OEM &amp; tier-1 aftermarket suppliers
          </div>
        </div>

        {/* KPI 4: Fulfillment Queue */}
        <div className="rounded border border-brand-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Fulfillment Status
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-accent-light text-brand-accent">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-brand-ink">Live</span>
            <span className="ml-1 text-xs text-brand-muted">queue connected</span>
          </div>
          <div className="mt-2 text-[11px] text-brand-muted">
            Order management active
          </div>
        </div>
      </div>

      {/* Critical Inventory Depletion Table */}
      <div className="rounded border border-brand-border bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-brand-border/70 bg-brand-bg/50 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-brand-warning" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-ink">
              Inventory Attention Required (Low Stock &le; 15 Units)
            </h2>
          </div>
          <Link
            href="/admin/products"
            className="text-xs font-semibold text-brand-accent hover:underline flex items-center gap-1"
          >
            <span>Manage All Products</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {lowStockItems.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Part Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Stock Level</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockItems.map((part) => (
                <TableRow key={part.id}>
                  <TableCell className="font-mono text-xs font-bold text-brand-navy">
                    {part.sku}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-brand-ink">
                    <Link
                      href={`/admin/products/${part.id}`}
                      className="hover:text-brand-accent hover:underline"
                    >
                      {part.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-brand-muted">
                    {part.category?.name || "Uncategorized"}
                  </TableCell>
                  <TableCell className="text-center text-xs font-bold text-brand-warning">
                    {part.stock_quantity} units
                  </TableCell>
                  <TableCell className="text-right text-xs text-brand-ink">
                    {formatCurrency(part.price, part.currency)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="warning">Low Stock</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center text-xs text-brand-muted">
            <CheckCircle2 className="mx-auto h-8 w-8 text-brand-success mb-2" />
            All inventory levels are currently above safe threshold buffers.
          </div>
        )}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/admin/products"
          className="rounded border border-brand-border bg-white p-4 shadow-sm hover:border-brand-accent hover:shadow transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-xs text-brand-ink group-hover:text-brand-accent">
              <Package className="h-4 w-4" />
              <span>Catalog &amp; Inventory Management</span>
            </div>
            <ArrowRight className="h-4 w-4 text-brand-muted group-hover:text-brand-accent transition-transform group-hover:translate-x-0.5" />
          </div>
          <p className="mt-2 text-[11px] text-brand-muted leading-relaxed">
            Create, update, archive, and adjust price and stock for replacement parts.
          </p>
        </Link>

        <Link
          href="/admin/orders"
          className="rounded border border-brand-border bg-white p-4 shadow-sm hover:border-brand-accent hover:shadow transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-xs text-brand-ink group-hover:text-brand-accent">
              <ShoppingBag className="h-4 w-4" />
              <span>Order Fulfillment Control</span>
            </div>
            <ArrowRight className="h-4 w-4 text-brand-muted group-hover:text-brand-accent transition-transform group-hover:translate-x-0.5" />
          </div>
          <p className="mt-2 text-[11px] text-brand-muted leading-relaxed">
            Review customer orders, transition fulfillment statuses, and inspect purchase snapshots.
          </p>
        </Link>

        <Link
          href="/admin/categories"
          className="rounded border border-brand-border bg-white p-4 shadow-sm hover:border-brand-accent hover:shadow transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-xs text-brand-ink group-hover:text-brand-accent">
              <Layers className="h-4 w-4" />
              <span>Category &amp; Taxonomy Control</span>
            </div>
            <ArrowRight className="h-4 w-4 text-brand-muted group-hover:text-brand-accent transition-transform group-hover:translate-x-0.5" />
          </div>
          <p className="mt-2 text-[11px] text-brand-muted leading-relaxed">
            Organize automotive subsystem hierarchies and public storefront navigation slugs.
          </p>
        </Link>
      </div>
    </div>
  );
}

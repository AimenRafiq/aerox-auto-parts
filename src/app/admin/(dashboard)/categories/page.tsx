import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Layers, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCategories } from "@/lib/data/catalog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Category Management",
  description: "Automotive system categories and taxonomy management.",
};

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-brand-border/70 pb-4">
        <div>
          <h1 className="text-xl font-bold text-brand-ink sm:text-2xl">
            Category &amp; System Taxonomy
          </h1>
          <p className="text-xs text-brand-muted">
            Manage automotive subsystem categories and storefront navigation paths.
          </p>
        </div>
        <div>
          <Badge variant="default">{categories.length} Categories Configured</Badge>
        </div>
      </div>

      <div className="rounded border border-brand-border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sort Order</TableHead>
              <TableHead>Category Name</TableHead>
              <TableHead>URL Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-mono text-xs text-center w-24">
                  {cat.sort_order}
                </TableCell>
                <TableCell className="text-xs font-semibold text-brand-ink">
                  {cat.name}
                </TableCell>
                <TableCell className="font-mono text-xs text-brand-accent">
                  /categories/{cat.slug}
                </TableCell>
                <TableCell className="text-xs text-brand-muted max-w-md truncate">
                  {cat.description || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={cat.is_active ? "success" : "default"}>
                    {cat.is_active ? "Active" : "Hidden"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="pt-2">
        <Link href="/admin">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Tag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBrands } from "@/lib/data/catalog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Brand Management",
  description: "Manufacturer and aftermarket brand management.",
};

export default async function AdminBrandsPage() {
  const brands = await getBrands();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-brand-border/70 pb-4">
        <div>
          <h1 className="text-xl font-bold text-brand-ink sm:text-2xl">
            Manufacturer &amp; Partner Brands
          </h1>
          <p className="text-xs text-brand-muted">
            Approved OE suppliers and aftermarket performance component brands.
          </p>
        </div>
        <div>
          <Badge variant="default">{brands.length} Brands Active</Badge>
        </div>
      </div>

      <div className="rounded border border-brand-border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand Name</TableHead>
              <TableHead>Catalog Filter Slug</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell className="text-xs font-semibold text-brand-ink">
                  {brand.name}
                </TableCell>
                <TableCell className="font-mono text-xs text-brand-accent">
                  /products?brand={brand.slug}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={brand.is_active ? "success" : "default"}>
                    {brand.is_active ? "Active" : "Inactive"}
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

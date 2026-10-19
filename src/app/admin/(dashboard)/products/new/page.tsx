import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { getBrands, getCategories } from "@/lib/data/catalog";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Add Product",
};

export default async function NewAdminProductPage() {
  const [categories, brands] = await Promise.all([getCategories(), getBrands()]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="border-b border-brand-border/70 pb-4">
        <h1 className="text-xl font-bold text-brand-ink sm:text-2xl">Add product</h1>
        <p className="mt-1 text-xs text-brand-muted">
          Create an inventory record and choose whether to publish it.
        </p>
      </div>
      <ProductForm
        categories={categories}
        brands={brands}
        supabaseConfigured={isSupabaseConfigured()}
      />
    </div>
  );
}

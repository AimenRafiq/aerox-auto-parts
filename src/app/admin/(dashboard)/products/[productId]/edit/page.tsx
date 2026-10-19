import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import {
  getAdminProductById,
  getBrands,
  getCategories,
} from "@/lib/data/catalog";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Edit Product",
};

export default async function EditAdminProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const [product, categories, brands] = await Promise.all([
    getAdminProductById(productId),
    getCategories(),
    getBrands(),
  ]);
  if (!product) notFound();

  if (
    product.category &&
    !categories.some((category) => category.id === product.category?.id)
  ) {
    categories.push(product.category);
  }
  if (
    product.brand &&
    !brands.some((brand) => brand.id === product.brand?.id)
  ) {
    brands.push(product.brand);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="border-b border-brand-border/70 pb-4">
        <h1 className="text-xl font-bold text-brand-ink sm:text-2xl">Edit product</h1>
        <p className="mt-1 text-xs text-brand-muted">
          Update catalog details and stock for {product.sku}.
        </p>
      </div>
      <ProductForm
        product={product}
        categories={categories}
        brands={brands}
        supabaseConfigured={isSupabaseConfigured()}
      />
    </div>
  );
}

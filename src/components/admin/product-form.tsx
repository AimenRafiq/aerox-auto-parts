"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Save } from "lucide-react";
import {
  createProductAction,
  updateProductAction,
  type ProductActionResult,
} from "@/actions/product-actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProductImageUrl } from "@/lib/utils";
import type { AdminProductDetail } from "@/lib/data/catalog";
import type { Brand, Category } from "@/types/database";

interface ProductFormProps {
  product?: AdminProductDetail;
  categories: Category[];
  brands: Brand[];
  supabaseConfigured: boolean;
}

function errorFor(result: ProductActionResult, field: string): string | undefined {
  return result.fieldErrors?.[field]?.[0];
}

export function ProductForm({
  product,
  categories,
  brands,
  supabaseConfigured,
}: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ProductActionResult | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const actionResult = product
        ? await updateProductAction(product.id, formData)
        : await createProductAction(formData);
      setResult(actionResult);
      if (actionResult.success) {
        router.push("/admin/products");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!supabaseConfigured && (
        <Alert variant="warning" title="Supabase is not configured">
          This workspace uses sample catalog data. Saving products and images is
          disabled until Supabase is configured.
        </Alert>
      )}

      {result?.error && (
        <Alert variant="error" title="Product was not saved">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{result.error}</span>
          </div>
        </Alert>
      )}

      <section className="space-y-4 rounded border border-brand-border bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-sm font-semibold text-brand-ink">Product details</h2>
          <p className="mt-1 text-xs text-brand-muted">
            Use the manufacturer’s real part number and customer-facing product information.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="sku"
            label="SKU"
            required
            defaultValue={product?.sku}
            error={result ? errorFor(result, "sku") : undefined}
            autoComplete="off"
          />
          <Input
            name="name"
            label="Product name"
            required
            defaultValue={product?.name}
            error={result ? errorFor(result, "name") : undefined}
          />
          <Input
            name="slug"
            label="URL slug"
            required
            defaultValue={product?.slug}
            error={result ? errorFor(result, "slug") : undefined}
            helperText="Lowercase words separated by hyphens."
            autoComplete="off"
          />
          <label className="w-full space-y-1.5">
            <span className="block text-xs font-semibold uppercase tracking-wider text-brand-ink">
              Brand
            </span>
            <select
              name="brandId"
              defaultValue={product?.brand_id ?? ""}
              className="w-full rounded border border-brand-border bg-white px-3 py-2 text-sm text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
            >
              <option value="">No brand selected</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            {result && errorFor(result, "brandId") && (
              <span className="block text-xs text-brand-error">
                {errorFor(result, "brandId")}
              </span>
            )}
          </label>
          <label className="w-full space-y-1.5">
            <span className="block text-xs font-semibold uppercase tracking-wider text-brand-ink">
              Category <span className="text-brand-error">*</span>
            </span>
            <select
              name="categoryId"
              required
              defaultValue={product?.category_id ?? ""}
              className="w-full rounded border border-brand-border bg-white px-3 py-2 text-sm text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {result && errorFor(result, "categoryId") && (
              <span className="block text-xs text-brand-error">
                {errorFor(result, "categoryId")}
              </span>
            )}
          </label>
        </div>
        <Input
          name="shortDescription"
          label="Short description"
          maxLength={300}
          defaultValue={product?.short_description ?? ""}
          error={result ? errorFor(result, "shortDescription") : undefined}
        />
        <label className="block space-y-1.5">
          <span className="block text-xs font-semibold uppercase tracking-wider text-brand-ink">
            Full description
          </span>
          <textarea
            name="description"
            rows={5}
            maxLength={3000}
            defaultValue={product?.description ?? ""}
            aria-invalid={Boolean(result && errorFor(result, "description"))}
            className="w-full resize-y rounded border border-brand-border bg-white px-3 py-2 text-sm text-brand-ink focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
          />
          {result && errorFor(result, "description") && (
            <span className="block text-xs text-brand-error">
              {errorFor(result, "description")}
            </span>
          )}
        </label>
      </section>

      <section className="space-y-4 rounded border border-brand-border bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-sm font-semibold text-brand-ink">Price and inventory</h2>
          <p className="mt-1 text-xs text-brand-muted">
            Prices are stored in USD and accept up to two decimal places.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            name="price"
            label="Price (USD)"
            type="number"
            required
            min="0"
            max="99999999.99"
            step="0.01"
            defaultValue={product?.price ?? ""}
            error={result ? errorFor(result, "price") : undefined}
          />
          <Input
            name="compareAtPrice"
            label="Compare-at price (USD)"
            type="number"
            min="0"
            max="99999999.99"
            step="0.01"
            defaultValue={product?.compare_at_price ?? ""}
            error={result ? errorFor(result, "compareAtPrice") : undefined}
          />
          <Input
            name="stockQuantity"
            label="Stock quantity"
            type="number"
            required
            min="0"
            step="1"
            defaultValue={product?.stock_quantity ?? 0}
            error={result ? errorFor(result, "stockQuantity") : undefined}
          />
          <Input
            name="weight"
            label="Weight (optional)"
            type="number"
            min="0"
            step="0.01"
            defaultValue={product?.weight ?? ""}
            error={result ? errorFor(result, "weight") : undefined}
          />
        </div>
        <Input
          name="dimensions"
          label="Dimensions (optional)"
          maxLength={100}
          defaultValue={product?.dimensions ?? ""}
          error={result ? errorFor(result, "dimensions") : undefined}
          helperText="Only add dimensions when they are known and useful for shipping."
        />
        <label className="flex items-start gap-3 rounded border border-brand-border p-3">
          <input
            name="isPublished"
            type="checkbox"
            defaultChecked={product?.is_published ?? false}
            className="mt-0.5 h-4 w-4 accent-brand-accent"
          />
          <span>
            <span className="block text-sm font-medium text-brand-ink">
              Publish in the storefront
            </span>
            <span className="mt-0.5 block text-xs text-brand-muted">
              Unchecked products remain drafts and are visible only to administrators.
            </span>
          </span>
        </label>
      </section>

      <section className="space-y-4 rounded border border-brand-border bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-sm font-semibold text-brand-ink">Product images</h2>
          <p className="mt-1 text-xs text-brand-muted">
            Upload up to five JPEG, PNG, or WebP images per save, each up to 5 MB.
            Compress images before upload. New images are appended in the selected
            order.
          </p>
        </div>
        {product?.images && product.images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[...product.images]
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((image, index) => (
                <figure
                  key={image.id ?? image.storage_path}
                  className="overflow-hidden rounded border border-brand-border"
                >
                  <div className="relative aspect-[4/3] bg-brand-bg">
                    <Image
                      src={getProductImageUrl(image.storage_path)}
                      alt={image.alt_text || product.name}
                      fill
                      sizes="180px"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="px-2 py-1.5 text-[11px] text-brand-muted">
                    Image {index + 1}
                  </figcaption>
                </figure>
              ))}
          </div>
        )}
        <label className="block space-y-1.5">
          <span className="block text-xs font-semibold uppercase tracking-wider text-brand-ink">
            Add images
          </span>
          <input
            name="images"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="block w-full rounded border border-brand-border bg-white px-3 py-2 text-sm text-brand-ink file:mr-3 file:rounded file:border-0 file:bg-brand-bg file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-ink"
            aria-describedby="image-help"
          />
          <span id="image-help" className="block text-xs text-brand-muted">
            The server checks file type, content signature, and size. Existing images are retained.
          </span>
        </label>
        <Input
          name="imageAlt"
          label="Alt text for new images"
          maxLength={150}
          defaultValue=""
          helperText="Describe the part shown, not the image itself. Required when uploading."
          error={result ? errorFor(result, "imageAlt") : undefined}
        />
      </section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Link href="/admin/products">
          <Button
            variant="outline"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        </Link>
        <Button
          type="submit"
          isLoading={isPending}
          disabled={!supabaseConfigured}
          leftIcon={<Save className="h-4 w-4" />}
        >
          {product ? "Save product" : "Create product"}
        </Button>
      </div>
    </form>
  );
}

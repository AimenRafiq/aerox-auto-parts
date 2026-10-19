import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/data/catalog";
import { getSiteOrigin } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteOrigin();
  if (!origin) return [];

  const [categories, firstPage] = await Promise.all([
    getCategories(),
    getProducts({ page: 1, limit: 50 }),
  ]);
  const pages = await Promise.all(
    Array.from({ length: Math.max(0, firstPage.totalPages - 1) }, (_, index) =>
      getProducts({ page: index + 2, limit: 50 })
    )
  );
  const products = [...firstPage.products, ...pages.flatMap((page) => page.products)];

  return [
    { url: new URL("/", origin).toString(), changeFrequency: "weekly", priority: 1 },
    { url: new URL("/products", origin).toString(), changeFrequency: "daily", priority: 0.8 },
    ...categories.map((category) => ({
      url: new URL(`/categories/${category.slug}`, origin).toString(),
      lastModified: category.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: new URL(`/products/${product.slug}`, origin).toString(),
      lastModified: product.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}

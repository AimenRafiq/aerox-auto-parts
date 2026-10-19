import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  SEED_PRODUCTS,
  SEED_CATEGORIES,
  SEED_BRANDS,
  type ExtendedProduct,
} from "./seed-fallback";
import type { Category, Brand, ProductImage } from "@/types/database";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface CatalogFilterParams {
  page?: number;
  limit?: number;
  categorySlug?: string;
  brandSlug?: string;
  query?: string;
  sort?: "price-asc" | "price-desc" | "name-asc" | "newest";
}

export interface CatalogResult {
  products: ExtendedProduct[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export { isSupabaseConfigured };

/**
 * Fetches active catalog categories.
 */
export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, parent_id, is_active, sort_order, created_at, updated_at")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Category catalog query failed:", error);
      throw new Error("Could not load product categories. Please try again.");
    }
    return data ?? [];
  }
  return SEED_CATEGORIES.filter((c) => c.is_active);
}

/**
 * Fetches active brands.
 */
export async function getBrands(): Promise<Brand[]> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("brands")
      .select("id, name, slug, is_active, created_at, updated_at")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Brand catalog query failed:", error);
      throw new Error("Could not load product brands. Please try again.");
    }
    return data ?? [];
  }
  return SEED_BRANDS.filter((b) => b.is_active);
}

/**
 * Fetches catalog products with search, category/brand filters, sorting, and pagination.
 */
export async function getProducts(
  params: CatalogFilterParams = {}
): Promise<CatalogResult> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(50, params.limit || 12));
  const offset = (page - 1) * limit;

  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();

    let query = supabase
      .from("products")
      .select(
        `
          id, sku, name, slug, short_description, description,
          brand_id, category_id, price, compare_at_price, currency,
          stock_quantity, is_published, weight, dimensions,
          created_at, updated_at, archived_at,
          brand:brands(id, name, slug),
          category:categories(id, name, slug),
          images:product_images(storage_path, alt_text, sort_order)
        `,
        { count: "exact" }
      )
      .eq("is_published", true)
      .is("archived_at", null);

    if (params.query?.trim()) {
      const term = `%${params.query.trim()}%`;
      query = query.or(`name.ilike.${term},sku.ilike.${term},description.ilike.${term}`);
    }

    if (params.categorySlug) {
      const { data: cat, error } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", params.categorySlug)
        .maybeSingle();
      if (error) {
        console.error("Catalog category filter query failed:", error);
        throw new Error("Could not load products for the selected category.");
      }
      if (!cat) {
        return { products: [], totalCount: 0, page, limit, totalPages: 1 };
      }
      query = query.eq("category_id", cat.id);
    }

    if (params.brandSlug) {
      const { data: brd, error } = await supabase
        .from("brands")
        .select("id")
        .eq("slug", params.brandSlug)
        .maybeSingle();
      if (error) {
        console.error("Catalog brand filter query failed:", error);
        throw new Error("Could not load products for the selected brand.");
      }
      if (!brd) {
        return { products: [], totalCount: 0, page, limit, totalPages: 1 };
      }
      query = query.eq("brand_id", brd.id);
    }

    switch (params.sort) {
      case "price-asc":
        query = query.order("price", { ascending: true });
        break;
      case "price-desc":
        query = query.order("price", { ascending: false });
        break;
      case "name-asc":
        query = query.order("name", { ascending: true });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error("Catalog product query failed:", error);
      throw new Error("Could not load the product catalog. Please try again.");
    }
    const totalCount = count ?? data.length;
    return {
      products: data as unknown as ExtendedProduct[],
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  }

  // Robust Fallback Catalog (seeded auto parts)
  let filtered = [...SEED_PRODUCTS].filter(
    (p) => p.is_published && p.archived_at === null
  );

  if (params.categorySlug) {
    filtered = filtered.filter((p) => p.category?.slug === params.categorySlug);
  }

  if (params.brandSlug) {
    filtered = filtered.filter((p) => p.brand?.slug === params.brandSlug);
  }

  if (params.query?.trim()) {
    const q = params.query.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q) ||
        p.category?.name.toLowerCase().includes(q)
    );
  }

  // Sorting
  switch (params.sort) {
    case "price-asc":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "name-asc":
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "newest":
    default:
      filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      break;
  }

  const totalCount = filtered.length;
  const paginated = filtered.slice(offset, offset + limit);

  return {
    products: paginated,
    totalCount,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
  };
}

/**
 * Fetches only the published products requested by a checkout, without relying on
 * whichever products happen to appear on the first storefront page.
 */
export async function getProductsByIds(ids: string[]): Promise<ExtendedProduct[]> {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) return [];

  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id, sku, name, slug, short_description, description,
        brand_id, category_id, price, compare_at_price, currency,
        stock_quantity, is_published, weight, dimensions,
        created_at, updated_at, archived_at,
        brand:brands(id, name, slug),
        category:categories(id, name, slug),
        images:product_images(storage_path, alt_text, sort_order)
      `
      )
      .in("id", uniqueIds)
      .eq("is_published", true)
      .is("archived_at", null);

    if (error) {
      console.error("Checkout product lookup failed:", error);
      throw new Error("Could not verify cart items against the current catalog.");
    }
    return (data ?? []) as unknown as ExtendedProduct[];
  }

  return SEED_PRODUCTS.filter(
    (product) =>
      uniqueIds.includes(product.id) &&
      product.is_published &&
      product.archived_at === null
  );
}

/**
 * Fetches a single published product with catalog details and images.
 */
export async function getProductBySlug(
  slug: string
): Promise<ExtendedProduct | null> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        `
          id, sku, name, slug, short_description, description,
          brand_id, category_id, price, compare_at_price, currency,
          stock_quantity, is_published, weight, dimensions,
          created_at, updated_at, archived_at,
          brand:brands(id, name, slug),
          category:categories(id, name, slug),
          images:product_images(storage_path, alt_text, sort_order)
        `
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .is("archived_at", null)
      .maybeSingle();

    if (error) {
      console.error("Product detail query failed:", error);
      throw new Error("Could not load this product. Please try again.");
    }
    return data ? (data as unknown as ExtendedProduct) : null;
  }

  const found = SEED_PRODUCTS.find(
    (p) => p.slug === slug && p.is_published && p.archived_at === null
  );
  return found || null;
}

/**
 * Fetches a single product by its unique ID for administrative editing.
 */
export async function getProductById(
  id: string,
  includeArchived: boolean = true
): Promise<ExtendedProduct | null> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    let query = supabase
      .from("products")
      .select(
        `
          id, sku, name, slug, short_description, description,
          brand_id, category_id, price, compare_at_price, currency,
          stock_quantity, is_published, weight, dimensions,
          created_at, updated_at, archived_at,
          brand:brands(id, name, slug),
          category:categories(id, name, slug),
          images:product_images(storage_path, alt_text, sort_order)
        `
      )
      .eq("id", id);

    if (!includeArchived) {
      query = query.is("archived_at", null);
    }

    const { data, error } = await query.maybeSingle();
    if (error) {
      console.error("Admin product detail query failed:", error);
      throw new Error("Could not load this product. Please try again.");
    }
    return data ? (data as unknown as ExtendedProduct) : null;
  }

  const found = SEED_PRODUCTS.find((p) => p.id === id);
  return found || null;
}

export interface AdminProductFilterParams {
  page?: number;
  limit?: number;
  query?: string;
  categorySlug?: string;
  status?: "all" | "published" | "draft" | "archived" | "low_stock";
}

export interface AdminProductDetail extends ExtendedProduct {
  images?: ProductImage[];
}

/**
 * Administrative product list query allowing inspection of drafts, published, and archived items.
 */
export async function getAdminProducts(
  params: AdminProductFilterParams = {}
): Promise<CatalogResult> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(50, params.limit || 15));
  const offset = (page - 1) * limit;

  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();

    let query = supabase
      .from("products")
      .select(
        `
          id, sku, name, slug, short_description, description,
          brand_id, category_id, price, compare_at_price, currency,
          stock_quantity, is_published, weight, dimensions,
          created_at, updated_at, archived_at,
          brand:brands(id, name, slug),
          category:categories(id, name, slug),
          images:product_images(storage_path, alt_text, sort_order)
        `,
        { count: "exact" }
      );

    if (params.query?.trim()) {
      const search = params.query
        .trim()
        .slice(0, 100)
        .replace(/[\\%_]/g, "\\$&")
        .replace(/"/g, '\\"');
      const term = `"%${search}%"`;
      query = query.or(`name.ilike.${term},sku.ilike.${term}`);
    }

    if (params.categorySlug) {
      const { data: cat, error: categoryError } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", params.categorySlug)
        .maybeSingle();
      if (categoryError) {
        console.error("Admin product category filter failed:", categoryError);
        throw new Error("Could not load products for the selected category.");
      }
      if (!cat) {
        return {
          products: [],
          totalCount: 0,
          page,
          limit,
          totalPages: 1,
        };
      }
      query = query.eq("category_id", cat.id);
    }

    switch (params.status) {
      case "published":
        query = query.eq("is_published", true).is("archived_at", null);
        break;
      case "draft":
        query = query.eq("is_published", false).is("archived_at", null);
        break;
      case "archived":
        query = query.not("archived_at", "is", null);
        break;
      case "low_stock":
        query = query.lte("stock_quantity", 15).is("archived_at", null);
        break;
      case "all":
      default:
        break;
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) {
      console.error("Admin product list query failed:", error);
      throw new Error("Could not load the product catalog. Please try again.");
    }
    const totalCount = count ?? data.length;
    return {
      products: (data ?? []) as unknown as ExtendedProduct[],
      totalCount,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(totalCount / limit)),
    };
  }

  // Fallback
  let items = [...SEED_PRODUCTS];

  if (params.query?.trim()) {
    const q = params.query.trim().toLowerCase();
    items = items.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }

  if (params.categorySlug) {
    items = items.filter((p) => p.category?.slug === params.categorySlug);
  }

  switch (params.status) {
    case "published":
      items = items.filter((p) => p.is_published && p.archived_at === null);
      break;
    case "draft":
      items = items.filter((p) => !p.is_published && p.archived_at === null);
      break;
    case "archived":
      items = items.filter((p) => p.archived_at !== null);
      break;
    case "low_stock":
      items = items.filter(
        (p) => p.stock_quantity <= 15 && p.archived_at === null
      );
      break;
    case "all":
    default:
      break;
  }

  const totalCount = items.length;
  const paginated = items.slice(offset, offset + limit);

  return {
    products: paginated,
    totalCount,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(totalCount / limit)),
  };
}

export async function getAdminProductById(
  id: string
): Promise<AdminProductDetail | null> {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id, sku, name, slug, short_description, description,
        brand_id, category_id, price, compare_at_price, currency,
        stock_quantity, is_published, weight, dimensions,
        created_at, updated_at, archived_at,
        brand:brands(id, name, slug),
        category:categories(id, name, slug),
        images:product_images(id, product_id, storage_path, alt_text, sort_order, created_at)
      `
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Admin product detail query failed:", error);
      throw new Error("Could not load this product. Please try again.");
    }
    if (!data) return null;
    const product = data as unknown as AdminProductDetail;
    product.images = [...(product.images ?? [])].sort(
      (first, second) => first.sort_order - second.sort_order
    );
    return product;
  }

  return (SEED_PRODUCTS.find((product) => product.id === id) as AdminProductDetail) ?? null;
}

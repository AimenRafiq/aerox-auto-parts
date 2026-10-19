"use server";

import { revalidatePath } from "next/cache";
import { productSchema, type ProductFormData } from "@/lib/validations/product";
import { requireAdminSession, logAdminAction } from "@/lib/auth/admin-auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const IMAGE_BUCKET = "product-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES_PER_SAVE = 5;

export interface ProductActionResult {
  success: boolean;
  productId?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

function getValidationErrors(error: {
  errors: Array<{ path: (string | number)[]; message: string }>;
}): ProductActionResult {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.errors) {
    const field = issue.path.join(".") || "form";
    fieldErrors[field] ??= [];
    fieldErrors[field].push(issue.message);
  }
  return {
    success: false,
    error: "Please correct the highlighted form errors.",
    fieldErrors,
  };
}

function readProductForm(formData: FormData): { data: unknown; files: File[] } {
  const field = (name: string) => formData.get(name);
  const imageValues = formData.getAll("images");
  return {
    data: {
      sku: field("sku"),
      name: field("name"),
      slug: field("slug"),
      shortDescription: field("shortDescription"),
      description: field("description"),
      brandId: field("brandId") ?? "",
      categoryId: field("categoryId"),
      price: field("price"),
      compareAtPrice: field("compareAtPrice") || null,
      stockQuantity: field("stockQuantity"),
      isPublished: field("isPublished") === "on",
      weight: field("weight") || null,
      dimensions: field("dimensions"),
      imageAlt: field("imageAlt") ?? "",
    },
    files: imageValues.filter(
      (value): value is File =>
        typeof value !== "string" && value.size > 0 && value.name.length > 0
    ),
  };
}

function validateImages(files: File[], altText: string): string | null {
  if (files.length > MAX_IMAGES_PER_SAVE) {
    return `Upload no more than ${MAX_IMAGES_PER_SAVE} images at a time.`;
  }
  if (files.length > 0 && !altText.trim()) {
    return "Add descriptive alt text before uploading product images.";
  }
  for (const file of files) {
    if (file.size <= 0 || file.size > MAX_IMAGE_SIZE) {
      return "Each image must be between 1 byte and 5 MB.";
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return "Images must be JPEG, PNG, or WebP files.";
    }
  }
  return null;
}

async function hasValidImageSignature(file: File): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (file.type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (file.type === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }
  return (
    file.type === "image/webp" &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  );
}

async function uploadImages(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  productId: string,
  files: File[],
  altText: string,
  startOrder: number
): Promise<{ paths: string[]; error?: string }> {
  const uploadedPaths: string[] = [];
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  for (const [index, file] of files.entries()) {
    if (!(await hasValidImageSignature(file))) {
      return { paths: uploadedPaths, error: "An uploaded file is not a valid image." };
    }

    const path = `${productId}/${crypto.randomUUID()}.${extensions[file.type]}`;
    const { error: uploadError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(path, new Uint8Array(await file.arrayBuffer()), {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      console.error("Product image upload failed:", uploadError);
      return {
        paths: uploadedPaths,
        error: "Could not upload the product image. Check the storage setup and try again.",
      };
    }
    uploadedPaths.push(path);

    const { error: imageError } = await supabase.from("product_images").insert({
      product_id: productId,
      storage_path: path,
      alt_text: altText.trim(),
      sort_order: startOrder + index,
    });
    if (imageError) {
      console.error("Product image record could not be saved:", imageError);
      return {
        paths: uploadedPaths,
        error: "The image uploaded, but its catalog record could not be saved.",
      };
    }
  }
  return { paths: uploadedPaths };
}

async function removeUploadedFiles(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  paths: string[]
): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).remove(paths);
  if (error) console.error("Failed to clean up product image files:", error);
}

async function removeUploadedImageRecords(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  productId: string,
  paths: string[]
): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId)
    .in("storage_path", paths);
  if (error) console.error("Failed to clean up product image records:", error);
}

function isUniqueConstraintError(error: { code?: string }): boolean {
  return error.code === "23505";
}

async function revalidateCatalog(productSlug?: string): Promise<void> {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  if (productSlug) {
    revalidatePath(`/products/${productSlug}`);
    revalidatePath(`/admin/products/${productSlug}/edit`);
  }
}

export async function createProductAction(
  formData: FormData
): Promise<ProductActionResult> {
  await requireAdminSession();
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Configure Supabase before saving catalog changes.",
    };
  }

  const { data: rawData, files } = readProductForm(formData);
  const parsed = productSchema.safeParse(rawData);
  if (!parsed.success) return getValidationErrors(parsed.error);
  const data: ProductFormData = parsed.data;
  const imageError = validateImages(files, data.imageAlt);
  if (imageError) return { success: false, error: imageError };

  const productId = crypto.randomUUID();
  const supabase = await getSupabaseServerClient();
  const { error: insertError } = await supabase.from("products").insert({
    id: productId,
    sku: data.sku,
    name: data.name,
    slug: data.slug,
    short_description: data.shortDescription || null,
    description: data.description || null,
    brand_id: data.brandId || null,
    category_id: data.categoryId,
    price: data.price,
    compare_at_price: data.compareAtPrice ?? null,
    currency: "USD",
    stock_quantity: data.stockQuantity,
    is_published: data.isPublished,
    weight: data.weight ?? null,
    dimensions: data.dimensions || null,
  });

  if (insertError) {
    console.error("Product creation failed:", insertError);
    if (isUniqueConstraintError(insertError)) {
      return {
        success: false,
        error: "That SKU or slug is already in use. Update the conflicting value and try again.",
      };
    }
    return {
      success: false,
      error: "Could not save the product. Check the category and brand selections and try again.",
    };
  }

  const imageResult = await uploadImages(
    supabase,
    productId,
    files,
    data.imageAlt,
    0
  );
  if (imageResult.error) {
    const { error: cleanupError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);
    if (cleanupError) {
      console.error("Failed to roll back product after image upload failure:", cleanupError);
    }
    await removeUploadedFiles(supabase, imageResult.paths);
    return { success: false, error: imageResult.error };
  }

  await logAdminAction({
    action: "create_product",
    entityType: "product",
    entityId: productId,
    details: { sku: data.sku, name: data.name, price: data.price },
  });
  await revalidateCatalog(data.slug);
  return { success: true, productId };
}

export async function updateProductAction(
  productId: string,
  formData: FormData
): Promise<ProductActionResult> {
  await requireAdminSession();
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Configure Supabase before saving catalog changes.",
    };
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(productId)) {
    return { success: false, error: "The product identifier is invalid." };
  }

  const { data: rawData, files } = readProductForm(formData);
  const parsed = productSchema.safeParse(rawData);
  if (!parsed.success) return getValidationErrors(parsed.error);
  const data: ProductFormData = parsed.data;
  const imageError = validateImages(files, data.imageAlt);
  if (imageError) return { success: false, error: imageError };

  const supabase = await getSupabaseServerClient();
  const { data: existingProduct, error: lookupError } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .maybeSingle();
  if (lookupError || !existingProduct) {
    if (lookupError) console.error("Product lookup failed:", lookupError);
    return { success: false, error: "The product could not be found." };
  }

  const { data: existingImages, error: imagesError } = await supabase
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  if (imagesError) {
    console.error("Product image lookup failed:", imagesError);
    return { success: false, error: "Could not load the product's image list." };
  }

  const uploaded = await uploadImages(
    supabase,
    productId,
    files,
    data.imageAlt,
    existingImages.length
  );
  if (uploaded.error) {
    await removeUploadedImageRecords(supabase, productId, uploaded.paths);
    await removeUploadedFiles(supabase, uploaded.paths);
    return { success: false, error: uploaded.error };
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({
      sku: data.sku,
      name: data.name,
      slug: data.slug,
      short_description: data.shortDescription || null,
      description: data.description || null,
      brand_id: data.brandId || null,
      category_id: data.categoryId,
      price: data.price,
      compare_at_price: data.compareAtPrice ?? null,
      stock_quantity: data.stockQuantity,
      is_published: data.isPublished,
      weight: data.weight ?? null,
      dimensions: data.dimensions || null,
    })
    .eq("id", productId);

  if (updateError) {
    console.error("Product update failed:", updateError);
    await removeUploadedImageRecords(supabase, productId, uploaded.paths);
    await removeUploadedFiles(supabase, uploaded.paths);
    if (isUniqueConstraintError(updateError)) {
      return {
        success: false,
        error: "That SKU or slug is already in use. Update the conflicting value and try again.",
      };
    }
    return { success: false, error: "Could not save the product changes." };
  }

  await logAdminAction({
    action: "update_product",
    entityType: "product",
    entityId: productId,
    details: { sku: data.sku, name: data.name, price: data.price },
  });
  await revalidateCatalog(data.slug);
  return { success: true, productId };
}

export async function archiveProductAction(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdminSession();
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Configure Supabase before changing catalog items." };
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .update({ archived_at: new Date().toISOString(), is_published: false })
    .eq("id", productId)
    .is("archived_at", null)
    .select("id")
    .maybeSingle();
  if (error) {
    console.error("Product archive failed:", error);
    return { success: false, error: "Could not archive this product." };
  }
  if (!data) return { success: false, error: "This product is already archived or no longer exists." };

  await logAdminAction({
    action: "archive_product",
    entityType: "product",
    entityId: productId,
  });
  await revalidateCatalog();
  return { success: true };
}

export async function restoreProductAction(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdminSession();
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Configure Supabase before changing catalog items." };
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .update({ archived_at: null, is_published: false })
    .eq("id", productId)
    .not("archived_at", "is", null)
    .select("id")
    .maybeSingle();
  if (error) {
    console.error("Product restore failed:", error);
    return { success: false, error: "Could not restore this product." };
  }
  if (!data) return { success: false, error: "This product is already active or no longer exists." };

  await logAdminAction({
    action: "restore_product",
    entityType: "product",
    entityId: productId,
  });
  await revalidateCatalog();
  return { success: true };
}

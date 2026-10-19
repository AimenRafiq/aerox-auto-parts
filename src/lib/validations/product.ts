import { z } from "zod";

const optionalText = (max: number, label: string) =>
  z
    .string()
    .max(max, `${label} cannot exceed ${max} characters.`)
    .optional()
    .or(z.literal(""));

const requiredFormNumber = z.preprocess(
  (value) =>
    (typeof value === "string" && value.trim() !== "") || typeof value === "number"
      ? Number(value)
      : undefined,
  z.number().finite()
);

const optionalFormNumber = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined
      ? null
      : (typeof value === "string" && value.trim() !== "") ||
          typeof value === "number"
        ? Number(value)
        : undefined,
  z.number().finite().nullable()
);

export const productSchema = z
  .object({
    sku: z
      .string()
      .trim()
      .min(3, "SKU must be at least 3 characters.")
      .max(50, "SKU cannot exceed 50 characters.")
      .regex(
        /^[A-Za-z0-9_-]+$/,
        "SKU may only contain letters, numbers, hyphens, and underscores."
      ),
    name: z
      .string()
      .trim()
      .min(3, "Product name must be at least 3 characters.")
      .max(150, "Product name cannot exceed 150 characters."),
    slug: z
      .string()
      .trim()
      .min(3, "Slug must be at least 3 characters.")
      .max(150, "Slug cannot exceed 150 characters.")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must use lowercase letters, numbers, and single hyphens between words."
      ),
    shortDescription: optionalText(300, "Short description"),
    description: optionalText(3000, "Description"),
    brandId: z.union([
      z.string().uuid("Please select a valid brand."),
      z.literal(""),
    ]),
    categoryId: z.string().uuid("Please select a valid category."),
    price: requiredFormNumber.pipe(
      z
        .number()
        .min(0, "Price cannot be negative.")
        .max(99999999.99, "Price exceeds the supported maximum.")
    ),
    compareAtPrice: optionalFormNumber.pipe(
      z
        .number()
        .nullable()
        .refine(
          (value) => value === null || value >= 0,
          "Compare-at price cannot be negative."
        )
        .refine(
          (value) => value === null || value <= 99999999.99,
          "Compare-at price exceeds the supported maximum."
        )
    ),
    stockQuantity: requiredFormNumber.pipe(
      z
        .number()
        .int("Stock quantity must be a whole number.")
        .min(0, "Stock quantity cannot be negative.")
        .max(2147483647, "Stock quantity exceeds the supported maximum.")
    ),
    isPublished: z.boolean(),
    weight: optionalFormNumber.pipe(
      z
        .number()
        .nullable()
        .refine(
          (value) => value === null || value >= 0,
          "Weight cannot be negative."
        )
        .refine(
          (value) => value === null || value <= 999999.99,
          "Weight exceeds the supported maximum."
        )
    ),
    dimensions: optionalText(100, "Dimensions"),
    imageAlt: z
      .string()
      .trim()
      .max(150, "Image alt text cannot exceed 150 characters."),
  })
  .superRefine((product, context) => {
    if (Math.abs(product.price * 100 - Math.round(product.price * 100)) > 1e-7) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price"],
        message: "Price may have no more than two decimal places.",
      });
    }
    if (
      product.compareAtPrice !== null &&
      Math.abs(
        product.compareAtPrice * 100 -
          Math.round(product.compareAtPrice * 100)
      ) > 1e-7
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["compareAtPrice"],
        message: "Compare-at price may have no more than two decimal places.",
      });
    }
    if (
      product.compareAtPrice !== null &&
      product.compareAtPrice < product.price
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["compareAtPrice"],
        message: "Compare-at price must be equal to or greater than the price.",
      });
    }
  });

export type ProductFormData = z.infer<typeof productSchema>;

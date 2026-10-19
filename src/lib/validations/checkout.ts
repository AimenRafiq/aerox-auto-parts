import { z } from "zod";

export const checkoutFormSchema = z.object({
  customerName: z
    .string()
    .min(2, "Full name must be at least 2 characters.")
    .max(100, "Full name cannot exceed 100 characters."),
  customerEmail: z
    .string()
    .email("Please provide a valid email address for order notifications."),
  customerPhone: z
    .string()
    .min(7, "Phone number must be at least 7 digits.")
    .max(25, "Phone number cannot exceed 25 characters.")
    .optional()
    .or(z.literal("")),
  shippingStreet: z
    .string()
    .min(5, "Street address must be at least 5 characters.")
    .max(150, "Street address cannot exceed 150 characters."),
  shippingCity: z
    .string()
    .min(2, "City name must be at least 2 characters.")
    .max(60, "City cannot exceed 60 characters."),
  shippingState: z
    .string()
    .min(2, "State or Province must be at least 2 characters.")
    .max(50, "State cannot exceed 50 characters."),
  shippingPostalCode: z
    .string()
    .min(3, "ZIP or Postal code must be at least 3 characters.")
    .max(20, "Postal code cannot exceed 20 characters."),
  shippingCountry: z
    .string()
    .min(2, "Country is required.")
    .default("United States"),
  paymentMethod: z.enum(["manual", "cod", "test"], {
    errorMap: () => ({ message: "Please select an approved payment option." }),
  }),
  notes: z
    .string()
    .max(500, "Order notes cannot exceed 500 characters.")
    .optional()
    .or(z.literal("")),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required."),
        quantity: z.number().int().positive("Quantity must be greater than zero."),
      })
    )
    .min(1, "Your cart must contain at least one item to checkout.")
    .max(50, "Your cart cannot contain more than 50 different products.")
    .superRefine((items, context) => {
      const productIds = new Set<string>();
      items.forEach((item, index) => {
        if (productIds.has(item.productId)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, "productId"],
            message: "Each product may appear only once in the cart.",
          });
        }
        productIds.add(item.productId);
      });
    }),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

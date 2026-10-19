import { getProductsByIds } from "@/lib/data/catalog";
import {
  validateCartAgainstProducts,
  type CartInputItem,
  type CartValidationResult,
} from "@/lib/cart-validation-core";

export { validateCartAgainstProducts } from "@/lib/cart-validation-core";
export type {
  CartInputItem,
  CartValidationResult,
} from "@/lib/cart-validation-core";

/**
 * Server-side authoritative cart validator.
 * Revalidates stock, publish status, and prices directly against the database/catalog.
 * NEVER trusts client-submitted totals or unit prices.
 */
export async function revalidateCartItems(
  clientItems: CartInputItem[]
): Promise<CartValidationResult> {
  if (!clientItems || clientItems.length === 0) {
    return {
      isValid: true,
      items: [],
      subtotal: 0,
      errors: [],
    };
  }

  const productIds = clientItems.map((item) => item.productId);
  const products = await getProductsByIds(productIds);
  return validateCartAgainstProducts(clientItems, products);
}

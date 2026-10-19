import type { ExtendedProduct } from "./data/seed-fallback";

export interface CartInputItem {
  productId: string;
  quantity: number;
}

export interface ValidatedLineItem {
  product: ExtendedProduct;
  requestedQuantity: number;
  confirmedQuantity: number;
  unitPrice: number;
  lineTotal: number;
  isAvailable: boolean;
  stockRemaining: number;
  error?: string;
}

export interface CartValidationResult {
  isValid: boolean;
  items: ValidatedLineItem[];
  subtotal: number;
  errors: string[];
}

export function validateCartAgainstProducts(
  clientItems: CartInputItem[],
  products: ExtendedProduct[]
): CartValidationResult {
  const productIds = clientItems.map((item) => item.productId);
  if (new Set(productIds).size !== productIds.length) {
    return {
      isValid: false,
      items: [],
      subtotal: 0,
      errors: ["Each product may appear only once in the cart."],
    };
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const validatedItems: ValidatedLineItem[] = [];
  const errors: string[] = [];
  let calculatedSubtotal = 0;

  for (const clientItem of clientItems) {
    if (!Number.isSafeInteger(clientItem.quantity) || clientItem.quantity <= 0) {
      errors.push("Cart quantities must be positive whole numbers.");
      continue;
    }

    const product = productMap.get(clientItem.productId);
    if (!product || !product.is_published || product.archived_at !== null) {
      errors.push("A requested item is no longer available in our catalog.");
      continue;
    }

    const availableStock = product.stock_quantity;
    if (availableStock <= 0) {
      errors.push(`"${product.name}" (SKU: ${product.sku}) is currently out of stock.`);
      validatedItems.push({
        product,
        requestedQuantity: clientItem.quantity,
        confirmedQuantity: 0,
        unitPrice: product.price,
        lineTotal: 0,
        isAvailable: false,
        stockRemaining: 0,
        error: "Out of stock",
      });
      continue;
    }

    const confirmedQuantity = Math.min(clientItem.quantity, availableStock);
    if (confirmedQuantity < clientItem.quantity) {
      errors.push(
        `Quantity for "${product.name}" was adjusted to available inventory (${availableStock}).`
      );
    }

    const unitPrice = Number(product.price);
    const lineTotal = Number((unitPrice * confirmedQuantity).toFixed(2));
    calculatedSubtotal += lineTotal;
    validatedItems.push({
      product,
      requestedQuantity: clientItem.quantity,
      confirmedQuantity,
      unitPrice,
      lineTotal,
      isAvailable: true,
      stockRemaining: availableStock,
    });
  }

  return {
    isValid: errors.length === 0,
    items: validatedItems,
    subtotal: Number(calculatedSubtotal.toFixed(2)),
    errors,
  };
}

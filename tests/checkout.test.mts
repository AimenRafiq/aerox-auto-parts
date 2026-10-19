import assert from "node:assert/strict";
import test from "node:test";
import { checkoutFormSchema } from "../src/lib/validations/checkout.ts";
import { validateCartAgainstProducts } from "../src/lib/cart-validation-core.ts";
import { SEED_PRODUCTS } from "../src/lib/data/seed-fallback.ts";
import { isTestPaymentAllowed } from "../src/lib/payment-methods.ts";

const validCheckout = {
  customerName: "Jordan Smith",
  customerEmail: "jordan@example.com",
  customerPhone: "",
  shippingStreet: "123 Main Street",
  shippingCity: "Springfield",
  shippingState: "IL",
  shippingPostalCode: "62701",
  shippingCountry: "United States",
  paymentMethod: "manual",
  notes: "",
  items: [{ productId: "product-1", quantity: 2 }],
};

test("checkout accepts valid customer data and product quantities", () => {
  assert.equal(checkoutFormSchema.safeParse(validCheckout).success, true);
});

test("checkout rejects duplicate products and non-positive quantities", () => {
  const result = checkoutFormSchema.safeParse({
    ...validCheckout,
    items: [
      { productId: "product-1", quantity: 1 },
      { productId: "product-1", quantity: 2 },
      { productId: "product-2", quantity: 0 },
    ],
  });
  assert.equal(result.success, false);
});

test("cart totals use catalog pricing, not client-supplied amounts", () => {
  const product = { ...SEED_PRODUCTS[0], price: 12.34, stock_quantity: 5 };
  const result = validateCartAgainstProducts(
    [{ productId: product.id, quantity: 2 }],
    [product]
  );
  assert.equal(result.isValid, true);
  assert.equal(result.subtotal, 24.68);
  assert.equal(result.items[0].unitPrice, 12.34);
  assert.equal(result.items[0].lineTotal, 24.68);
});

test("cart validation rejects unavailable items and caps quantities to stock", () => {
  const product = { ...SEED_PRODUCTS[0], stock_quantity: 1 };
  const result = validateCartAgainstProducts(
    [
      { productId: product.id, quantity: 2 },
      { productId: "not-in-catalog", quantity: 1 },
    ],
    [product]
  );
  assert.equal(result.isValid, false);
  assert.equal(result.items[0].confirmedQuantity, 1);
  assert.equal(result.subtotal, Number(product.price));
  assert.equal(result.errors.length, 2);
});

test("cart validation rejects fractional, zero, and unsafe quantities", () => {
  const product = SEED_PRODUCTS[0];
  for (const quantity of [0, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    const result = validateCartAgainstProducts(
      [{ productId: product.id, quantity }],
      [product]
    );
    assert.equal(result.isValid, false);
    assert.equal(result.items.length, 0);
  }
});

test("cart validation rejects duplicate lines so stock cannot be double-counted", () => {
  const product = SEED_PRODUCTS[0];
  const result = validateCartAgainstProducts(
    [
      { productId: product.id, quantity: 1 },
      { productId: product.id, quantity: 1 },
    ],
    [product]
  );
  assert.equal(result.isValid, false);
  assert.equal(result.subtotal, 0);
});

test("test payment is disabled in production", () => {
  assert.equal(isTestPaymentAllowed("production"), false);
  assert.equal(isTestPaymentAllowed("development"), true);
});

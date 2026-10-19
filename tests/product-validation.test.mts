import assert from "node:assert/strict";
import test from "node:test";
import { productSchema } from "../src/lib/validations/product.ts";

const validProduct = {
  sku: "ARX-123",
  name: "Replacement brake pad set",
  slug: "replacement-brake-pad-set",
  shortDescription: "",
  description: "",
  brandId: "",
  categoryId: "c1000000-0000-0000-0000-000000000001",
  price: "39.99",
  compareAtPrice: "45.00",
  stockQuantity: "4",
  isPublished: true,
  weight: "",
  dimensions: "",
  imageAlt: "Brake pad set",
};

test("product form coerces valid numeric fields and optional values", () => {
  const result = productSchema.safeParse(validProduct);
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.price, 39.99);
    assert.equal(result.data.stockQuantity, 4);
    assert.equal(result.data.weight, null);
  }
});

test("product form rejects invalid slugs, fractional prices, and negative stock", () => {
  const result = productSchema.safeParse({
    ...validProduct,
    slug: "Bad Slug",
    price: "10.999",
    stockQuantity: "-1",
  });
  assert.equal(result.success, false);
});

"use client";

import React, { useState } from "react";
import { Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExtendedProduct } from "@/lib/data/seed-fallback";

import { useCart } from "@/context/cart-context";

export interface AddToCartFormProps {
  product: ExtendedProduct;
}

export const AddToCartForm: React.FC<AddToCartFormProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();

  const maxStock = product.stock_quantity;
  const isOutOfStock = maxStock === 0;

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(maxStock, prev + 1));
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2500);
  };

  return (
    <div className="space-y-4 rounded border border-brand-border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-ink">
          Select Quantity
        </span>
        <span className="text-xs text-brand-muted">
          {isOutOfStock ? "Unavailable" : `${maxStock} units available`}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Quantity Stepper */}
        <div className="flex items-center rounded border border-brand-border bg-brand-bg">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={quantity <= 1 || isOutOfStock}
            aria-label="Decrease quantity"
            className="flex h-10 w-10 items-center justify-center text-brand-ink hover:bg-brand-border/40 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-sm font-semibold text-brand-ink">
            {isOutOfStock ? 0 : quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrease}
            disabled={quantity >= maxStock || isOutOfStock}
            aria-label="Increase quantity"
            className="flex h-10 w-10 items-center justify-center text-brand-ink hover:bg-brand-border/40 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Add to Cart CTA */}
        <Button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          size="lg"
          variant={isAdded ? "secondary" : "primary"}
          className="flex-1"
          leftIcon={
            isAdded ? (
              <Check className="h-4 w-4 text-brand-success-light" />
            ) : (
              <ShoppingBag className="h-4 w-4" />
            )
          }
        >
          {isOutOfStock
            ? "Out of Stock"
            : isAdded
            ? "Added to Cart"
            : "Add to Cart"}
        </Button>
      </div>

      {isAdded && (
        <p className="text-xs font-medium text-brand-success text-center">
          &check; Item added. You can review quantities in your cart.
        </p>
      )}
    </div>
  );
};


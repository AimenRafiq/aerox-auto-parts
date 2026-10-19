"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency, getProductImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench, ShoppingBag, Check, ArrowRight } from "lucide-react";
import { useCart } from "@/context/cart-context";
import type { ExtendedProduct } from "@/lib/data/seed-fallback";

export interface ProductCardProps {
  product: ExtendedProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();

  const primaryImage =
    product.images && product.images.length > 0
      ? getProductImageUrl(
          [...product.images].sort((a, b) => a.sort_order - b.sort_order)[0]
            .storage_path
        )
      : null;

  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;
  const isOutOfStock = product.stock_quantity === 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <Card className="group flex flex-col justify-between overflow-hidden border-brand-border/80 shadow-[0_8px_26px_-22px_rgba(32,37,34,0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-accent/50 hover:shadow-lg">
      <div>
        {/* Product Image Area */}
        <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-brand-border/60 bg-[#f1efeb]">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-brand-muted">
              <Wrench className="h-10 w-10 opacity-30" />
            </div>
          )}

          {/* Stock Badge Overlay */}
          <div className="absolute left-2.5 top-2.5">
            {isOutOfStock ? (
              <Badge variant="error">Out of Stock</Badge>
            ) : isLowStock ? (
              <Badge variant="warning">Low Stock ({product.stock_quantity})</Badge>
            ) : (
              <Badge variant="success">In Stock</Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4 space-y-2">
          {/* Brand & SKU */}
          <div className="flex items-center justify-between text-[11px] text-brand-muted">
            {product.brand && (
              <span className="font-bold uppercase tracking-[0.12em] text-brand-accent">
                {product.brand.name}
              </span>
            )}
            <span className="font-mono text-brand-muted">
              SKU: {product.sku}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="line-clamp-2 text-sm font-semibold text-brand-ink transition-colors group-hover:text-brand-accent">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>

          {/* Short description */}
          {product.short_description && (
            <p className="line-clamp-2 text-xs text-brand-muted leading-relaxed">
              {product.short_description}
            </p>
          )}
        </CardContent>
      </div>

      {/* Footer / Price & Quick Add */}
      <div className="border-t border-brand-border/60 bg-brand-bg/30 p-4 pt-3 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold tracking-tight text-brand-ink">
              {formatCurrency(product.price, product.currency)}
            </span>
            {product.compare_at_price && (
              <span className="text-xs text-brand-muted line-through">
                {formatCurrency(product.compare_at_price, product.currency)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center justify-center rounded-md border border-brand-border bg-white px-3 py-2 text-xs font-semibold text-brand-ink transition-colors hover:border-brand-ink hover:bg-brand-bg"
          >
            <span>Details</span>
          </Link>
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            title={isOutOfStock ? "Out of Stock" : "Add 1 to Cart"}
            aria-label={isOutOfStock ? "Out of Stock" : `Add ${product.name} to Cart`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-brand-accent text-white shadow-sm transition-colors hover:bg-brand-accent-hover disabled:pointer-events-none disabled:opacity-40"
          >
            {isAdded ? (
              <Check className="h-4 w-4 text-brand-success-light" />
            ) : (
              <ShoppingBag className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </Card>
  );
};

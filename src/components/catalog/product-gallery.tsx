"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Wrench } from "lucide-react";
import { cn, getProductImageUrl } from "@/lib/utils";

export interface ProductGalleryProps {
  images?: { storage_path: string; alt_text: string; sort_order: number }[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images = [],
  productName,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const orderedImages = [...images].sort(
    (first, second) => first.sort_order - second.sort_order
  );

  const activeImage = orderedImages[selectedIndex]
    ? getProductImageUrl(orderedImages[selectedIndex].storage_path)
    : null;

  return (
    <div className="space-y-3">
      {/* Main Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded border border-brand-border bg-white shadow-sm">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={orderedImages[selectedIndex]?.alt_text || productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-bg text-brand-muted">
            <Wrench className="h-16 w-16 opacity-30" />
          </div>
        )}
      </div>

      {/* Thumbnails row if multiple images exist */}
      {orderedImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {orderedImages.map((img, idx) => (
            <button
              key={img.storage_path + idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "relative h-16 w-20 flex-shrink-0 overflow-hidden rounded border bg-white transition-all",
                selectedIndex === idx
                  ? "border-brand-accent ring-2 ring-brand-accent/20"
                  : "border-brand-border hover:border-brand-border-dark opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={getProductImageUrl(img.storage_path)}
                alt={img.alt_text || `View ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

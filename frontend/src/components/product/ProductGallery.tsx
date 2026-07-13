"use client";

import { useState } from "react";

import { PlaceholderImage } from "@/components/catalog/PlaceholderImage";
import type { ProductImage } from "@/types/catalog";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sorted = [...images].sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col gap-4">
      <PlaceholderImage className="border border-edge" />

      {sorted.length > 1 ? (
        <div className="flex gap-3">
          {sorted.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-24 w-24 shrink-0 border bg-surface-soft ${
                index === activeIndex ? "border-2 border-brass" : "border-edge"
              }`}
              aria-label={`Фото ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

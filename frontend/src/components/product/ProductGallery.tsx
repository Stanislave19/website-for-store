"use client";

import { useState, type MouseEvent } from "react";

import { PlaceholderImage } from "@/components/catalog/PlaceholderImage";
import type { ProductImage } from "@/types/catalog";

const ZOOM_SCALE = 2;

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [zoomed, setZoomed] = useState(false);
  const sorted = [...images].sort((a, b) => a.position - b.position);
  const active = sorted[activeIndex];

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      {sorted.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto md:order-1 md:w-20 md:shrink-0 md:flex-col md:gap-2.5 md:overflow-y-auto md:overflow-x-visible">
          {sorted.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Фото ${index + 1}`}
              aria-current={index === activeIndex}
              className={`h-20 w-20 shrink-0 overflow-hidden border bg-cream ${
                index === activeIndex ? "border-2 border-brass" : "border-edge"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      <div className="relative flex-1 md:order-2">
        <div
          className="relative aspect-square w-full overflow-hidden border border-edge bg-cream"
          onMouseMove={active ? handleMouseMove : undefined}
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
        >
          {active ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={active.url}
              alt={productName}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-200 ease-out"
              style={{
                transformOrigin: zoomOrigin,
                transform: zoomed ? `scale(${ZOOM_SCALE})` : "scale(1)",
              }}
            />
          ) : (
            <PlaceholderImage />
          )}

          {sorted.length > 1 ? (
            <span className="absolute right-3 bottom-3 rounded-sm border border-edge bg-cream/90 px-2.5 py-1 font-sans text-[11px] text-leather">
              {activeIndex + 1} / {sorted.length}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, type MouseEvent } from "react";

import { PlaceholderImage } from "./PlaceholderImage";

export interface ProductImageHoverProps {
  images: string[];
}

export function ProductImageHover({ images }: ProductImageHoverProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (images.length <= 1) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - bounds.left) / bounds.width;
    const index = Math.min(images.length - 1, Math.max(0, Math.floor(ratio * images.length)));
    setActiveIndex(index);
  }

  function handleMouseLeave() {
    setActiveIndex(0);
  }

  return (
    <div
      className="relative w-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {images.length === 0 ? (
        <PlaceholderImage />
      ) : (
        images.map((url, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={url + index}
            src={url}
            alt=""
            className={`aspect-square w-full bg-cream object-cover transition-opacity duration-300 ${
              index === activeIndex ? "opacity-100" : "absolute inset-0 opacity-0"
            }`}
          />
        ))
      )}

      {images.length > 1 ? (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((url, index) => (
            <span
              key={`dot-${url}-${index}`}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                index === activeIndex ? "bg-brass" : "bg-white/70"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

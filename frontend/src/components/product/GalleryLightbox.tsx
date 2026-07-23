"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef } from "react";

import type { ProductImage } from "@/types/catalog";

const SWIPE_THRESHOLD_PX = 50;

interface GalleryLightboxProps {
  images: ProductImage[];
  productName: string;
  activeIndex: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export function GalleryLightbox({
  images,
  productName,
  activeIndex,
  onIndexChange,
  onClose,
}: GalleryLightboxProps) {
  const active = images[activeIndex];
  const touchStartX = useRef<number | null>(null);

  function goPrev() {
    onIndexChange((activeIndex - 1 + images.length) % images.length);
  }

  function goNext() {
    onIndexChange((activeIndex + 1) % images.length);
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && images.length > 1) goPrev();
      if (event.key === "ArrowRight" && images.length > 1) goNext();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, images.length]);

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX || images.length <= 1) return;
    if (delta > 0) {
      goPrev();
    } else {
      goNext();
    }
  }

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-ink/95"
      role="dialog"
      aria-modal="true"
      aria-label={`Фото — ${productName}`}
    >
      <button
        type="button"
        aria-label="Закрити"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-ink/40 text-cream"
      >
        <X size={22} />
      </button>

      {images.length > 1 ? (
        <span className="absolute top-4 left-4 z-10 rounded-sm bg-ink/40 px-2.5 py-1 font-sans text-[13px] text-cream">
          {activeIndex + 1} / {images.length}
        </span>
      ) : null}

      <div
        className="relative flex flex-1 items-center justify-center px-4 py-16"
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {images.length > 1 ? (
          <button
            type="button"
            aria-label="Попереднє фото"
            onClick={(event) => {
              event.stopPropagation();
              goPrev();
            }}
            className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-ink/40 text-cream sm:left-4"
          >
            <ChevronLeft size={24} />
          </button>
        ) : null}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active.url}
          alt={productName}
          onClick={(event) => event.stopPropagation()}
          className="max-h-full max-w-full cursor-default object-contain select-none"
        />

        {images.length > 1 ? (
          <button
            type="button"
            aria-label="Наступне фото"
            onClick={(event) => {
              event.stopPropagation();
              goNext();
            }}
            className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-ink/40 text-cream sm:right-4"
          >
            <ChevronRight size={24} />
          </button>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="flex shrink-0 justify-center gap-1.5 pb-6">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Фото ${index + 1}`}
              aria-current={index === activeIndex}
              onClick={() => onIndexChange(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === activeIndex ? "w-6 bg-brass" : "w-1.5 bg-cream/50"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

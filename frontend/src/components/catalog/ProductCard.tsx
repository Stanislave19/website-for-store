"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { PlaceholderImage } from "./PlaceholderImage";

export interface ProductCardProps {
  slug: string;
  name: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  brand?: string;
}

function formatPrice(value: number): string {
  return `${Math.round(value).toLocaleString("uk-UA")} ₴`;
}

export function ProductCard({ slug, name, description, price, oldPrice }: ProductCardProps) {
  const [inWishlist, setInWishlist] = useState(false);
  const hasDiscount = oldPrice !== null && oldPrice > price;

  return (
    <div className="group flex h-full flex-col border border-edge bg-white">
      <Link href={`/product/${slug}`} className="relative block w-full">
        <PlaceholderImage />
        <button
          type="button"
          aria-label={inWishlist ? "Прибрати з обраного" : "Додати в обране"}
          onClick={(event) => {
            event.preventDefault();
            setInWishlist((value) => !value);
          }}
          className="absolute right-3 bottom-3 flex h-[30px] w-[30px] items-center justify-center rounded-full border border-edge bg-white"
        >
          <Heart size={16} className={inWishlist ? "fill-sale text-sale" : "text-ink"} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <Link href={`/product/${slug}`}>
          <h3 className="line-clamp-2 min-h-[2.6em] font-serif text-[17px] leading-[1.3] font-medium text-ink">
            {name}
          </h3>
        </Link>
        <p className="line-clamp-2 min-h-[2.4em] font-sans text-sm leading-snug text-leather">
          {description ?? ""}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <div className="flex flex-wrap items-baseline gap-x-2 whitespace-nowrap">
            <span
              className={`font-sans text-lg font-medium ${hasDiscount ? "text-sale" : "text-racing"}`}
            >
              {formatPrice(price)}
            </span>
            {hasDiscount ? (
              <span className="font-sans text-[13px] text-leather line-through">
                {formatPrice(oldPrice as number)}
              </span>
            ) : null}
          </div>

          <button
            type="button"
            className="shrink-0 rounded-[3px] bg-racing px-5 py-2.5 font-sans text-sm font-medium whitespace-nowrap text-cream"
          >
            Купити
          </button>
        </div>
      </div>
    </div>
  );
}

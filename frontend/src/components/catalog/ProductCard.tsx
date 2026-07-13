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
    <div className="group flex flex-col border border-edge bg-white">
      <Link href={`/product/${slug}`} className="relative block">
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
          <Heart
            size={16}
            className={inWishlist ? "fill-sale text-sale" : "text-ink"}
          />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/product/${slug}`}>
          <h3 className="font-serif text-[22px] font-medium text-ink">{name}</h3>
        </Link>
        {description ? (
          <p className="line-clamp-2 font-sans text-sm text-leather">{description}</p>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
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
        </div>

        <button
          type="button"
          className="mt-2 rounded-[3px] bg-racing px-6 py-3 font-sans text-sm font-medium text-cream"
        >
          Купити
        </button>
      </div>
    </div>
  );
}

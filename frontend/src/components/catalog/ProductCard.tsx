"use client";

import { Heart } from "lucide-react";
import Link from "next/link";

import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useToast } from "@/components/ui/ToastProvider";

import { PlaceholderImage } from "./PlaceholderImage";

export interface ProductCardProps {
  id: number;
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

export function ProductCard({ id, slug, name, description, price, oldPrice }: ProductCardProps) {
  const { toggle, isWishlisted } = useWishlist();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const inWishlist = isWishlisted(id);
  const hasDiscount = oldPrice !== null && oldPrice > price;

  return (
    <div className="group flex h-full flex-col border border-edge bg-white transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-brass">
      <Link href={`/product/${slug}`} className="relative block w-full">
        <PlaceholderImage />
        <button
          type="button"
          aria-label={inWishlist ? "Прибрати з обраного" : "Додати в обране"}
          onClick={(event) => {
            event.preventDefault();
            toggle(id, slug);
          }}
          className="absolute right-4 bottom-4 flex h-9 w-9 items-center justify-center rounded-full border border-edge bg-white"
        >
          <Heart size={18} className={inWishlist ? "fill-sale text-sale" : "text-ink"} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <Link href={`/product/${slug}`}>
          <h3 className="line-clamp-2 min-h-[2.6em] font-serif text-[27px] leading-[1.3] font-medium text-ink">
            {name}
          </h3>
        </Link>
        <p className="line-clamp-2 min-h-[2.6em] font-sans text-[15px] leading-snug text-leather">
          {description ?? ""}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <div className="flex flex-wrap items-baseline gap-x-2 whitespace-nowrap">
            <span
              className={`font-sans text-[22px] font-medium ${hasDiscount ? "text-sale" : "text-racing"}`}
            >
              {formatPrice(price)}
            </span>
            {hasDiscount ? (
              <span className="font-sans text-sm text-leather line-through">
                {formatPrice(oldPrice as number)}
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => {
              addItem(id, slug);
              showToast({
                message: `${name} додано в кошик`,
                actionLabel: "Перейти в кошик",
                actionHref: "/cart",
              });
            }}
            className="shrink-0 rounded-[3px] bg-racing px-7 py-3.5 font-sans text-sm font-medium whitespace-nowrap text-cream"
          >
            Купити
          </button>
        </div>
      </div>
    </div>
  );
}

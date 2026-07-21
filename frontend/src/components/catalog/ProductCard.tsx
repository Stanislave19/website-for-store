"use client";

import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useToast } from "@/components/ui/ToastProvider";

import { ProductImageHover } from "./ProductImageHover";

export interface ProductCardProps {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  brand?: string;
  mainImage?: string | null;
  priority?: boolean;
}

function formatPrice(value: number): string {
  return `${Math.round(value).toLocaleString("uk-UA")} ₴`;
}

export function ProductCard({
  id,
  slug,
  name,
  description,
  price,
  oldPrice,
  mainImage,
  priority = false,
}: ProductCardProps) {
  const { toggle, isWishlisted } = useWishlist();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [justAdded, setJustAdded] = useState(false);
  const inWishlist = isWishlisted(id);
  const hasDiscount = oldPrice !== null && oldPrice > price;

  return (
    <div className="group flex h-full min-w-0 flex-col border border-edge bg-white transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-2 hover:border-brass hover:shadow-[0_20px_32px_-16px_rgba(20,54,31,0.28)]">
      <Link href={`/product/${slug}`} className="relative block w-full">
        <ProductImageHover images={mainImage ? [mainImage] : []} priority={priority} />
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

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 sm:p-5">
        <Link href={`/product/${slug}`}>
          <h3 className="line-clamp-2 min-h-[2.6em] font-serif text-[20px] leading-[1.3] font-medium break-words text-ink sm:text-[27px]">
            {name}
          </h3>
        </Link>
        {/*
          SEO: текст опису лишається в DOM завжди (не display:none/hidden),
          щоб пошукові системи бачили контент сторінки категорії.
          Візуально ховаємо через opacity/max-h і показуємо лише при
          наведенні на desktop — на мобільному (немає hover) прихований завжди.
        */}
        <p className="hidden max-h-0 overflow-hidden font-sans text-[15px] leading-snug text-leather opacity-0 transition-all duration-200 ease-out group-hover:max-h-[3em] group-hover:opacity-100 lg:block">
          {description ?? ""}
        </p>

        <div className="mt-auto flex min-w-0 items-center justify-between gap-3 pt-4">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
            <span
              className={`font-sans text-[18px] font-medium sm:text-[22px] ${hasDiscount ? "text-sale" : "text-racing"}`}
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
            aria-label="Додати в кошик"
            onClick={() => {
              addItem(id, slug);
              setJustAdded(true);
              setTimeout(() => setJustAdded(false), 300);
              showToast({
                message: `${name} додано в кошик`,
                actionLabel: "Перейти в кошик",
                actionHref: "/cart",
              });
            }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[3px] bg-racing text-cream"
          >
            <ShoppingCart size={18} className={justAdded ? "animate-cart-pop" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}

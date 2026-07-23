"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

import { useAddedToCart } from "@/components/ui/AddedToCartModal";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";

export function ProductActions({
  productId,
  slug,
  name,
  price,
  image,
}: {
  productId: number;
  slug: string;
  name: string;
  price: number;
  image: string | null;
}) {
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const { showAddedToCart } = useAddedToCart();
  const [added, setAdded] = useState(false);
  const inWishlist = isWishlisted(productId);

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={() => {
          addItem(productId, slug);
          setAdded(true);
          setTimeout(() => setAdded(false), 1200);
          showAddedToCart({ slug, name, image, price });
        }}
        className={`rounded-[3px] bg-racing px-8 py-4 font-sans text-[15px] font-medium text-cream sm:w-[65%] ${
          added ? "animate-cart-pop" : ""
        }`}
      >
        {added ? "Додано в кошик" : "Купити"}
      </button>
      <button
        type="button"
        onClick={() => toggle(productId, slug)}
        className="flex items-center justify-center gap-2 rounded-[3px] border border-edge px-6 py-4 font-sans text-[15px] font-medium text-ink"
      >
        <Heart size={18} className={inWishlist ? "fill-sale text-sale" : ""} />
        {inWishlist ? "В обраному" : "В обране"}
      </button>
    </div>
  );
}

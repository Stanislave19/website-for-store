"use client";

import { useEffect, useState } from "react";

import { useAddedToCart } from "@/components/ui/AddedToCartModal";
import { useCart } from "@/hooks/useCart";

function formatPrice(value: number): string {
  return `${Math.round(value).toLocaleString("uk-UA")} ₴`;
}

export function MobileStickyBuyBar({
  productId,
  slug,
  name,
  price,
  image,
  anchorId,
}: {
  productId: number;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  anchorId: string;
}) {
  const { addItem } = useCart();
  const { showAddedToCart } = useAddedToCart();
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const anchor = document.getElementById(anchorId);
    if (!anchor) return;

    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), {
      rootMargin: "-96px 0px 0px 0px",
    });
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [anchorId]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-16 z-30 border-t border-edge bg-cream px-4 py-3 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-serif text-[14px] font-medium text-ink">{name}</p>
          <p className="font-sans text-[15px] font-medium text-racing">{formatPrice(price)}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            addItem(productId, slug);
            setAdded(true);
            setTimeout(() => setAdded(false), 1200);
            showAddedToCart({ slug, name, image, price });
          }}
          className={`shrink-0 rounded-[3px] bg-racing px-6 py-3 font-sans text-sm font-medium text-cream ${
            added ? "animate-cart-pop" : ""
          }`}
        >
          {added ? "Додано" : "Купити"}
        </button>
      </div>
    </div>
  );
}

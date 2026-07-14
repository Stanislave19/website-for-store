"use client";

import { usePersistentStore } from "@/lib/persistent-store";

export interface WishlistItem {
  productId: number;
  slug: string;
}

const WISHLIST_KEY = "lerom_wishlist";

export function useWishlist() {
  const [items, setItems] = usePersistentStore<WishlistItem[]>(WISHLIST_KEY, []);

  function isWishlisted(productId: number) {
    return items.some((item) => item.productId === productId);
  }

  function toggle(productId: number, slug: string) {
    setItems((current) =>
      current.some((item) => item.productId === productId)
        ? current.filter((item) => item.productId !== productId)
        : [...current, { productId, slug }],
    );
  }

  function remove(productId: number) {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }

  return { items, isWishlisted, toggle, remove, count: items.length };
}

"use client";

import { usePersistentStore } from "@/lib/persistent-store";

export interface CartItem {
  productId: number;
  slug: string;
  quantity: number;
}

const CART_KEY = "lerom_cart";

export function useCart() {
  const [items, setItems] = usePersistentStore<CartItem[]>(CART_KEY, []);

  function addItem(productId: number, slug: string, quantity = 1) {
    setItems((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      return [...current, { productId, slug, quantity }];
    });
  }

  function removeItem(productId: number) {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }

  function setQuantity(productId: number, quantity: number) {
    if (quantity < 1) {
      removeItem(productId);
      return;
    }
    setItems((current) =>
      current.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
    );
  }

  function clear() {
    setItems([]);
  }

  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, addItem, removeItem, setQuantity, clear, count };
}

"use client";

import { useEffect, useMemo, useState } from "react";

import { useCart } from "@/hooks/useCart";
import { getProductBySlug } from "@/lib/api";
import type { ProductDetail } from "@/types/catalog";

export function useCartProducts() {
  const { items, removeItem } = useCart();
  const [products, setProducts] = useState<Record<string, ProductDetail>>({});
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const slugsKey = useMemo(() => [...items.map((item) => item.slug)].sort().join(","), [items]);
  const loading = loadedKey !== slugsKey;

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      items.map(async (item) => {
        try {
          const product = await getProductBySlug(item.slug);
          return { slug: item.slug, productId: item.productId, product };
        } catch {
          return { slug: item.slug, productId: item.productId, product: null };
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      const next: Record<string, ProductDetail> = {};
      for (const result of results) {
        if (result.product) {
          next[result.slug] = result.product;
        } else {
          removeItem(result.productId);
        }
      }
      setProducts(next);
      setLoadedKey(slugsKey);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugsKey]);

  const itemsTotal = items.reduce((sum, item) => {
    const product = products[item.slug];
    return product ? sum + product.price * item.quantity : sum;
  }, 0);

  return { items, products, loading, itemsTotal };
}

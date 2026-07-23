"use client";

import { useEffect, useState } from "react";

import { ProductCard } from "@/components/catalog/ProductCard";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { getProductBySlug } from "@/lib/api";
import type { ProductDetail } from "@/types/catalog";

export function RecentlyViewedSection({ excludeSlug }: { excludeSlug: string }) {
  const { slugs } = useRecentlyViewed();
  const [products, setProducts] = useState<ProductDetail[]>([]);

  const relevantSlugs = slugs.filter((slug) => slug !== excludeSlug).slice(0, 4);
  const key = relevantSlugs.join(",");

  useEffect(() => {
    let cancelled = false;
    Promise.all(relevantSlugs.map((slug) => getProductBySlug(slug).catch(() => null))).then((results) => {
      if (!cancelled) {
        setProducts(results.filter((product): product is ProductDetail => product !== null));
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (products.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-6 font-serif text-2xl font-medium text-ink">Нещодавно переглянуті</h2>
      <div className="grid grid-cols-2 border-t border-l border-edge lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            slug={product.slug}
            name={product.name}
            description={product.description}
            price={product.price}
            oldPrice={product.old_price}
            brand={product.brand}
            mainImage={product.images[0]?.url ?? null}
          />
        ))}
      </div>
    </section>
  );
}

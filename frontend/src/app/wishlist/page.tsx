"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ProductCard } from "@/components/catalog/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";
import { getProductBySlug } from "@/lib/api";
import { pluralize } from "@/lib/pluralize";
import type { ProductDetail } from "@/types/catalog";

export default function WishlistPage() {
  const { items, remove } = useWishlist();
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const slugsKey = useMemo(() => [...items.map((item) => item.slug)].sort().join(","), [items]);
  const loading = loadedKey !== slugsKey;

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      items.map(async (item) => {
        try {
          return await getProductBySlug(item.slug);
        } catch {
          remove(item.productId);
          return null;
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      setProducts(results.filter((product): product is ProductDetail => product !== null));
      setLoadedKey(slugsKey);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugsKey]);

  if (!loading && items.length === 0) {
    return (
      <main className="w-full px-6 py-16 md:px-14">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 border border-edge bg-white px-8 py-16 text-center">
          <Heart size={48} className="text-edge" />
          <h1 className="font-serif text-2xl text-ink">Список бажань порожній</h1>
          <p className="font-sans text-[15px] text-leather">
            Додавайте моделі, що сподобались, натискаючи сердечко на картці товару
          </p>
          <Link
            href="/catalog"
            className="mt-2 rounded-[3px] bg-racing px-8 py-3.5 font-sans text-sm font-medium text-cream"
          >
            Перейти до каталогу
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full px-6 py-10 md:px-14">
      <div className="mb-8 flex items-baseline gap-3">
        <h1 className="font-serif text-[34px] font-medium text-ink">Список бажань</h1>
        <span className="font-sans text-[15px] text-brass">
          {products.length} {pluralize(products.length, ["модель", "моделі", "моделей"])}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-4 lg:gap-10">
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
          />
        ))}
      </div>
    </main>
  );
}

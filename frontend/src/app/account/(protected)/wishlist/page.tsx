"use client";

import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ProductImageHover } from "@/components/catalog/ProductImageHover";
import { useCart } from "@/hooks/useCart";
import { listWishlist, removeWishlistItem } from "@/lib/account-api";
import { pluralize } from "@/lib/pluralize";
import type { WishlistProduct } from "@/types/account";

function formatPrice(value: number): string {
  return `${Math.round(value).toLocaleString("uk-UA")} ₴`;
}

export default function AccountWishlistPage() {
  const { addItem } = useCart();
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listWishlist()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  async function handleRemove(productId: number) {
    setItems((current) => current.filter((item) => item.product_id !== productId));
    await removeWishlistItem(productId);
  }

  if (loading) {
    return <p className="font-sans text-sm text-leather">Завантаження…</p>;
  }

  if (items.length === 0) {
    return (
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
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-medium text-ink">
        Список бажань — {items.length} {pluralize(items.length, ["модель", "моделі", "моделей"])}
      </h1>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {items.map((item) => {
          const hasDiscount = item.old_price !== null && item.old_price > item.price;
          return (
            <div key={item.product_id} className="flex h-full flex-col border border-edge bg-white">
              <Link href={`/product/${item.slug}`} className="relative block w-full">
                <ProductImageHover images={item.main_image ? [item.main_image] : []} />
              </Link>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <Link href={`/product/${item.slug}`}>
                  <h3 className="line-clamp-2 font-serif text-[16px] font-medium text-ink">{item.name}</h3>
                </Link>
                <div className="mt-auto flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className={`font-sans text-[16px] font-medium ${hasDiscount ? "text-sale" : "text-racing"}`}>
                      {formatPrice(item.price)}
                    </span>
                    {hasDiscount ? (
                      <span className="font-sans text-xs text-leather line-through">
                        {formatPrice(item.old_price as number)}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addItem(item.product_id, item.slug)}
                    className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[3px] bg-racing font-sans text-[13px] font-medium text-cream"
                  >
                    <ShoppingCart size={15} />
                    В кошик
                  </button>
                  <button
                    type="button"
                    aria-label="Прибрати з обраного"
                    onClick={() => handleRemove(item.product_id)}
                    className="flex h-10 w-10 items-center justify-center rounded-[3px] border border-edge"
                  >
                    <Heart size={16} className="fill-sale text-sale" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

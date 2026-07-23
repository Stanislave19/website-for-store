"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { PlaceholderImage } from "@/components/catalog/PlaceholderImage";
import { useCartProducts } from "@/hooks/useCartProducts";
import { pluralize } from "@/lib/pluralize";

interface AddedItem {
  slug: string;
  name: string;
  image: string | null;
  price: number;
}

interface AddedToCartContextValue {
  showAddedToCart: (item: AddedItem) => void;
}

const AddedToCartContext = createContext<AddedToCartContextValue | null>(null);

function formatPrice(value: number): string {
  return `${Math.round(value).toLocaleString("uk-UA")} ₴`;
}

export function AddedToCartProvider({ children }: { children: React.ReactNode }) {
  const [item, setItem] = useState<AddedItem | null>(null);
  const { items, itemsTotal } = useCartProducts();

  const showAddedToCart = useCallback((next: AddedItem) => {
    setItem(next);
  }, []);

  const close = useCallback(() => setItem(null), []);

  useEffect(() => {
    if (!item) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, close]);

  const totalQuantity = items.reduce((sum, cartItem) => sum + cartItem.quantity, 0);

  return (
    <AddedToCartContext.Provider value={{ showAddedToCart }}>
      {children}

      {item ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Товар додано в кошик"
        >
          <button
            type="button"
            aria-label="Закрити"
            onClick={close}
            className="absolute inset-0 bg-ink/40"
          />

          <div className="relative flex w-full max-h-[90vh] flex-col overflow-y-auto rounded-t-[3px] border-t border-edge bg-cream sm:max-w-md sm:rounded-[3px] sm:border">
            <div className="flex shrink-0 items-center justify-between border-b border-edge px-6 py-5">
              <h2 className="font-serif text-xl font-medium text-ink">Товар додано в кошик</h2>
              <button type="button" onClick={close} aria-label="Закрити" className="text-ink">
                <X size={22} />
              </button>
            </div>

            <div className="flex items-center gap-4 px-6 py-5">
              <div className="w-20 shrink-0">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt="" className="aspect-square w-full bg-white object-cover" />
                ) : (
                  <PlaceholderImage />
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <Link
                  href={`/product/${item.slug}`}
                  onClick={close}
                  className="font-sans text-[15px] font-medium text-ink hover:text-brass"
                >
                  {item.name}
                </Link>
                <span className="font-sans text-sm text-leather">1 × {formatPrice(item.price)}</span>
              </div>
            </div>

            <div className="mx-6 border-t border-edge" />

            <div className="flex items-center justify-between px-6 py-5 font-sans text-sm">
              <span className="text-leather">
                У кошику: {totalQuantity} {pluralize(totalQuantity, ["товар", "товари", "товарів"])}
              </span>
              <span className="text-right text-ink">
                Підсумок кошика: <span className="font-medium text-racing">{formatPrice(itemsTotal)}</span>
              </span>
            </div>

            <div className="flex shrink-0 flex-col gap-3 border-t border-edge px-6 py-5 sm:flex-row">
              <button
                type="button"
                onClick={close}
                className="flex h-12 flex-1 items-center justify-center rounded-[3px] border border-edge font-sans text-sm font-medium text-ink"
              >
                Продовжити покупки
              </button>
              <Link
                href="/checkout"
                onClick={close}
                className="flex h-12 flex-1 items-center justify-center rounded-[3px] bg-racing font-sans text-sm font-medium text-cream"
              >
                Оформити замовлення
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </AddedToCartContext.Provider>
  );
}

export function useAddedToCart(): AddedToCartContextValue {
  const ctx = useContext(AddedToCartContext);
  if (!ctx) throw new Error("useAddedToCart має використовуватись усередині AddedToCartProvider");
  return ctx;
}

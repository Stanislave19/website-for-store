"use client";

import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";

import { PlaceholderImage } from "@/components/catalog/PlaceholderImage";
import { useCart } from "@/hooks/useCart";
import { useCartProducts } from "@/hooks/useCartProducts";
import { usePromoCode } from "@/hooks/usePromoCode";
import { pluralize } from "@/lib/pluralize";

function formatPrice(value: number): string {
  return `${Math.round(value).toLocaleString("uk-UA")} ₴`;
}

export default function CartPage() {
  const { setQuantity, removeItem } = useCart();
  const { items, products, loading, itemsTotal } = useCartProducts();
  const {
    code: promoCode,
    setCode: setPromoCode,
    error: promoError,
    promo,
    applying,
    apply: applyPromo,
    discountAmount,
  } = usePromoCode(itemsTotal);

  const total = Math.max(0, itemsTotal - discountAmount);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  if (!loading && items.length === 0) {
    return (
      <main className="w-full px-6 py-16 md:px-14">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 border border-edge bg-white px-8 py-16 text-center">
          <ShoppingCart size={48} className="text-edge" />
          <h1 className="font-serif text-2xl text-ink">Кошик порожній</h1>
          <p className="font-sans text-[15px] text-leather">
            Перегляньте каталог і оберіть свій годинник
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
      <nav className="mb-6 font-sans text-[13px] text-leather">
        <Link href="/">Головна</Link>
        <span className="mx-2 text-edge">/</span>
        <span className="text-ink">Кошик</span>
      </nav>

      <div className="mb-8 flex items-baseline gap-3">
        <h1 className="font-serif text-[34px] font-medium text-ink">Кошик</h1>
        <span className="font-sans text-[15px] text-brass">
          {items.length} {pluralize(items.length, ["товар", "товари", "товарів"])}
        </span>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="flex-1">
          <div className="border border-edge bg-white">
            {items.map((item) => {
              const product = products[item.slug];
              if (!product) return null;
              const hasDiscount = product.old_price !== null && product.old_price > product.price;

              return (
                <div
                  key={item.productId}
                  className="relative flex flex-col gap-4 border-b border-edge p-6 last:border-b-0 sm:flex-row sm:items-center"
                >
                  <button
                    type="button"
                    aria-label="Видалити"
                    onClick={() => removeItem(item.productId)}
                    className="absolute top-4 right-4 text-leather hover:text-error sm:static sm:ml-auto sm:order-last"
                  >
                    <Trash2 size={18} />
                  </button>

                  <Link href={`/product/${product.slug}`} className="w-[110px] shrink-0">
                    <PlaceholderImage />
                  </Link>

                  <div className="flex flex-1 flex-col gap-1">
                    <Link
                      href={`/product/${product.slug}`}
                      className="font-serif text-xl font-medium text-ink"
                    >
                      {product.name}
                    </Link>
                    <span className="font-sans text-xs text-leather">Арт. {product.sku}</span>
                    <span className="font-sans text-[13px] text-leather">
                      {product.brand}, {product.mechanism_type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Зменшити кількість"
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-[3px] border border-edge text-ink hover:border-brass"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center font-sans text-[15px] font-medium">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Збільшити кількість"
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-[3px] border border-edge text-ink hover:border-brass"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="w-[110px] text-left sm:text-right">
                    <span
                      className={`font-sans text-lg font-medium ${hasDiscount ? "text-sale" : "text-racing"}`}
                    >
                      {formatPrice(product.price * item.quantity)}
                    </span>
                    {hasDiscount ? (
                      <div className="font-sans text-[13px] text-leather line-through">
                        {formatPrice((product.old_price as number) * item.quantity)}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <Link href="/catalog" className="mt-4 inline-block font-sans text-sm text-brass">
            ← Продовжити покупки
          </Link>
        </div>

        <div className="lg:w-[35%]">
          <div className="sticky top-6 border border-edge bg-white p-7">
            <h2 className="mb-5 font-serif text-[22px] font-medium text-ink">Підсумок</h2>

            <div className={`flex gap-2 ${promo || promoError ? "mb-2" : "mb-5"}`}>
              <input
                type="text"
                value={promoCode}
                onChange={(event) => setPromoCode(event.target.value)}
                placeholder="Промокод"
                className={`w-full rounded-[3px] border px-3 py-2.5 font-sans text-sm text-ink outline-none ${
                  promo ? "border-racing" : "border-edge focus:border-brass"
                }`}
              />
              <button
                type="button"
                onClick={applyPromo}
                disabled={applying || !promoCode.trim()}
                className="shrink-0 rounded-[3px] bg-racing px-4 py-2.5 font-sans text-sm font-medium text-cream disabled:opacity-50"
              >
                {applying ? "…" : "Застосувати"}
              </button>
            </div>
            {promo ? (
              <p className="mb-5 font-sans text-xs font-medium text-racing">✓ Промокод застосовано</p>
            ) : null}
            {promoError ? <p className="mb-5 font-sans text-xs text-error">{promoError}</p> : null}

            <div className="border-t border-edge pt-4">
              <div className="flex justify-between py-1.5 font-sans text-sm">
                <span className="text-leather">
                  {totalQuantity} {pluralize(totalQuantity, ["товар", "товари", "товарів"])}
                </span>
                <span className="text-ink">{formatPrice(itemsTotal)}</span>
              </div>
              {promo ? (
                <div className="flex justify-between py-1.5 font-sans text-sm">
                  <span className="text-leather">Знижка</span>
                  <span className="text-sale">−{formatPrice(discountAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between py-1.5 font-sans text-sm">
                <span className="text-leather">Доставка</span>
                <span className="text-leather">За тарифами перевізника</span>
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between border-t border-edge pt-4">
              <span className="font-sans text-base font-medium text-ink">Разом</span>
              <span className="font-sans text-2xl font-medium text-racing">{formatPrice(total)}</span>
            </div>

            <Link
              href="/checkout"
              className="mt-6 flex h-[52px] w-full items-center justify-center rounded-[3px] bg-racing font-sans text-base font-medium text-cream"
            >
              Оформити замовлення
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

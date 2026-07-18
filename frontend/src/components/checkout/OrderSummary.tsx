import Link from "next/link";

import { PlaceholderImage } from "@/components/catalog/PlaceholderImage";
import type { CartItem } from "@/hooks/useCart";
import type { ProductDetail } from "@/types/catalog";

function formatPrice(value: number): string {
  return `${Math.round(value).toLocaleString("uk-UA")} ₴`;
}

interface OrderSummaryProps {
  items: CartItem[];
  products: Record<string, ProductDetail>;
  promoCode: string;
  onPromoCodeChange: (value: string) => void;
  promoError: string | null;
  promoApplied: boolean;
  applyingPromo: boolean;
  onApplyPromo: () => void;
  itemsTotal: number;
  discountAmount: number;
  canSubmit: boolean;
  submitting: boolean;
  onSubmit: () => void;
}

export function OrderSummary({
  items,
  products,
  promoCode,
  onPromoCodeChange,
  promoError,
  promoApplied,
  applyingPromo,
  onApplyPromo,
  itemsTotal,
  discountAmount,
  canSubmit,
  submitting,
  onSubmit,
}: OrderSummaryProps) {
  const total = Math.max(0, itemsTotal - discountAmount);

  return (
    <div className="sticky top-6 border border-edge bg-white p-7">
      <h2 className="mb-5 font-serif text-[22px] font-medium text-ink">Ваше замовлення</h2>

      <div className="flex flex-col gap-4">
        {items.map((item) => {
          const product = products[item.slug];
          if (!product) return null;
          const hasDiscount = product.old_price !== null && product.old_price > product.price;

          return (
            <div key={item.productId} className="flex gap-3 border-b border-edge pb-4 last:border-b-0">
              <Link href={`/product/${product.slug}`} className="h-[72px] w-[72px] shrink-0 border border-edge">
                <PlaceholderImage />
              </Link>
              <div className="flex flex-1 flex-col gap-0.5">
                <Link href={`/product/${product.slug}`} className="font-serif text-[15px] font-medium text-ink">
                  {product.name}
                </Link>
                <span className="font-sans text-xs text-leather">
                  Арт. {product.sku} × {item.quantity}
                </span>
                <span
                  className={`font-sans text-[15px] font-medium ${hasDiscount ? "text-sale" : "text-ink"}`}
                >
                  {formatPrice(product.price * item.quantity)}
                  {hasDiscount ? (
                    <span className="ml-2 font-sans text-[13px] font-normal text-leather line-through">
                      {formatPrice((product.old_price as number) * item.quantity)}
                    </span>
                  ) : null}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex gap-2">
        <input
          type="text"
          value={promoCode}
          onChange={(event) => onPromoCodeChange(event.target.value)}
          placeholder="Промокод"
          className={`w-full rounded-[3px] border px-3 py-2.5 font-sans text-sm text-ink outline-none ${
            promoApplied ? "border-racing" : "border-edge focus:border-brass"
          }`}
        />
        <button
          type="button"
          onClick={onApplyPromo}
          disabled={applyingPromo || !promoCode.trim()}
          className="shrink-0 rounded-[3px] bg-racing px-4 py-2.5 font-sans text-sm font-medium text-cream disabled:opacity-50"
        >
          {applyingPromo ? "…" : "Застосувати"}
        </button>
      </div>
      {promoApplied ? (
        <p className="mt-2 font-sans text-xs font-medium text-racing">✓ Промокод застосовано</p>
      ) : null}
      {promoError ? <p className="mt-2 font-sans text-xs text-error">{promoError}</p> : null}

      <div className="mt-4 border-t border-edge pt-4">
        <div className="flex justify-between py-1.5 font-sans text-sm">
          <span className="text-leather">Товари</span>
          <span className="text-ink">{formatPrice(itemsTotal)}</span>
        </div>
        {promoApplied ? (
          <div className="flex justify-between py-1.5 font-sans text-sm">
            <span className="text-leather">Знижка</span>
            <span className="text-sale">−{formatPrice(discountAmount)}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-2 flex items-baseline justify-between border-t border-edge pt-4">
        <span className="font-sans text-base font-medium text-ink">Разом</span>
        <span className="font-sans text-2xl font-medium text-racing">{formatPrice(total)}</span>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit || submitting}
        className="mt-6 flex h-[52px] w-full items-center justify-center rounded-[3px] bg-racing font-sans text-base font-medium text-cream disabled:opacity-50"
      >
        {submitting ? "Оформлюємо…" : "Оформити замовлення"}
      </button>
      <p className="mt-3 text-center font-sans text-xs text-leather">
        Менеджер зв'яжеться з вами найближчим часом для підтвердження
      </p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getAccountOrder } from "@/lib/account-api";
import { ORDER_STATUS_LABELS } from "@/types/admin";
import type { AccountOrderDetail } from "@/types/account";

const DELIVERY_METHOD_LABELS: Record<AccountOrderDetail["delivery_method"], string> = {
  nova_poshta: "Нова Пошта",
  ukrposhta: "Укрпошта",
  courier: "Кур'єр",
  pickup: "Самовивіз",
};

const CONTACT_METHOD_LABELS: Record<AccountOrderDetail["contact_method"], string> = {
  call: "Дзвінок",
  telegram: "Telegram",
  viber: "Viber",
};

export default function AccountOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<AccountOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAccountOrder(orderId)
      .then(setOrder)
      .catch(() => setError("Не вдалося завантажити замовлення"))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return <p className="font-sans text-sm text-leather">Завантаження…</p>;
  }

  if (error || !order) {
    return <p className="font-sans text-sm text-error">{error ?? "Замовлення не знайдено"}</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium text-ink">Замовлення №{order.id}</h1>
        <Link href="/account/orders" className="font-sans text-[13px] text-racing hover:underline">
          ← До списку
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-edge bg-white p-5">
          <h2 className="mb-3 font-serif text-lg font-medium text-ink">Статус і зв&apos;язок</h2>
          <dl className="space-y-1.5 font-sans text-sm text-ink">
            <div className="flex justify-between">
              <dt className="text-leather">Статус</dt>
              <dd>{ORDER_STATUS_LABELS[order.status]}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-leather">Спосіб зв&apos;язку</dt>
              <dd>{CONTACT_METHOD_LABELS[order.contact_method]}</dd>
            </div>
            {order.comment ? (
              <div className="flex justify-between">
                <dt className="text-leather">Коментар</dt>
                <dd>{order.comment}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="border border-edge bg-white p-5">
          <h2 className="mb-3 font-serif text-lg font-medium text-ink">Доставка</h2>
          <dl className="space-y-1.5 font-sans text-sm text-ink">
            <div className="flex justify-between">
              <dt className="text-leather">Спосіб</dt>
              <dd>{DELIVERY_METHOD_LABELS[order.delivery_method]}</dd>
            </div>
            {order.city ? (
              <div className="flex justify-between">
                <dt className="text-leather">Місто</dt>
                <dd>{order.city}</dd>
              </div>
            ) : null}
            {order.np_office ? (
              <div className="flex justify-between">
                <dt className="text-leather">Відділення</dt>
                <dd>{order.np_office}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>

      <div className="mt-6 border border-edge bg-white p-5">
        <h2 className="mb-3 font-serif text-lg font-medium text-ink">Товари</h2>
        <div className="overflow-x-auto">
          <table className="w-full font-sans text-sm">
            <thead>
              <tr className="border-b border-edge text-left text-leather">
                <th className="py-2 font-normal">Товар</th>
                <th className="py-2 font-normal">Кількість</th>
                <th className="py-2 font-normal">Ціна</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-edge last:border-0">
                  <td className="py-2 text-ink">{item.product_name}</td>
                  <td className="py-2 text-ink">{item.quantity}</td>
                  <td className="py-2 text-racing">{item.price_at_order.toLocaleString("uk-UA")} ₴</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 space-y-1 border-t border-edge pt-3 font-sans text-sm">
          <div className="flex justify-between text-leather">
            <span>Сума товарів</span>
            <span>{order.items_total.toLocaleString("uk-UA")} ₴</span>
          </div>
          {order.discount_amount > 0 ? (
            <div className="flex justify-between text-sale">
              <span>Знижка{order.promo_code ? ` (${order.promo_code})` : ""}</span>
              <span>-{order.discount_amount.toLocaleString("uk-UA")} ₴</span>
            </div>
          ) : null}
          <div className="flex justify-between font-medium text-ink">
            <span>Разом</span>
            <span>{order.total.toLocaleString("uk-UA")} ₴</span>
          </div>
        </div>
      </div>
    </div>
  );
}

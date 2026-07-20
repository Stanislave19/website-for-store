"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AdminApiError, getAdminOrder, updateAdminOrderStatus } from "@/lib/admin-api";
import { ORDER_STATUS_LABELS, ORDER_STATUS_OPTIONS } from "@/types/admin";
import type { AdminOrderDetail, OrderStatus } from "@/types/admin";

const DELIVERY_METHOD_LABELS: Record<AdminOrderDetail["delivery_method"], string> = {
  nova_poshta: "Нова Пошта",
  ukrposhta: "Укрпошта",
  courier: "Кур'єр",
  pickup: "Самовивіз",
};

const CONTACT_METHOD_LABELS: Record<AdminOrderDetail["contact_method"], string> = {
  call: "Дзвінок",
  telegram: "Telegram",
  viber: "Viber",
};

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusValue, setStatusValue] = useState<OrderStatus>("new");
  const [saving, setSaving] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    getAdminOrder(orderId)
      .then((data) => {
        setOrder(data);
        setStatusValue(data.status);
      })
      .catch(() => setError("Не вдалося завантажити замовлення"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function handleSaveStatus() {
    setSaving(true);
    setStatusError(null);
    try {
      const updated = await updateAdminOrderStatus(orderId, statusValue);
      setOrder(updated);
    } catch (err) {
      setStatusError(err instanceof AdminApiError ? err.message : "Не вдалося змінити статус");
    } finally {
      setSaving(false);
    }
  }

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
        <Link href="/admin/orders" className="font-sans text-[13px] text-racing hover:underline">
          ← До списку
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-edge bg-white p-5">
          <h2 className="mb-3 font-serif text-lg font-medium text-ink">Контакти</h2>
          <dl className="space-y-1.5 font-sans text-sm text-ink">
            <div className="flex justify-between">
              <dt className="text-leather">Ім&apos;я</dt>
              <dd>
                {order.first_name} {order.last_name}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-leather">Телефон</dt>
              <dd>{order.phone}</dd>
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

      <div className="mt-6 border border-edge bg-white p-5">
        <h2 className="mb-3 font-serif text-lg font-medium text-ink">Статус</h2>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusValue}
            onChange={(event) => setStatusValue(event.target.value as OrderStatus)}
            className="h-11 rounded-[3px] border border-edge px-3 font-sans text-[15px] text-ink outline-none focus:border-racing"
          >
            {ORDER_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={saving || statusValue === order.status}
            onClick={handleSaveStatus}
            className="rounded-[3px] bg-racing px-5 py-2.5 font-sans text-sm font-medium text-cream disabled:opacity-60"
          >
            Зберегти статус
          </button>
        </div>
        {statusError ? <p className="mt-3 font-sans text-sm text-error">{statusError}</p> : null}
      </div>
    </div>
  );
}

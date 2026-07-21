"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { listAccountOrders } from "@/lib/account-api";
import { pluralize } from "@/lib/pluralize";
import { ORDER_STATUS_LABELS } from "@/types/admin";
import type { AccountOrderListItem } from "@/types/account";

export default function AccountOrdersPage() {
  const [items, setItems] = useState<AccountOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAccountOrders({})
      .then((data) => setItems(data.items))
      .catch(() => setError("Не вдалося завантажити замовлення"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="font-sans text-sm text-leather">Завантаження…</p>;
  }

  if (error) {
    return <p className="font-sans text-sm text-error">{error}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 border border-edge bg-white px-8 py-16 text-center">
        <h1 className="font-serif text-2xl text-ink">Замовлень ще немає</h1>
        <p className="font-sans text-[15px] text-leather">
          Оформлені заявки з&apos;являтимуться тут
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
        Мої замовлення — {items.length} {pluralize(items.length, ["замовлення", "замовлення", "замовлень"])}
      </h1>

      <div className="flex flex-col gap-3">
        {items.map((order) => (
          <Link
            key={order.id}
            href={`/account/orders/${order.id}`}
            className="flex flex-wrap items-center justify-between gap-3 border border-edge bg-white p-5 hover:border-brass"
          >
            <div>
              <p className="font-sans text-[15px] font-medium text-ink">Замовлення №{order.id}</p>
              <p className="font-sans text-[13px] text-leather">
                {new Date(order.created_at).toLocaleDateString("uk-UA")} · {ORDER_STATUS_LABELS[order.status]}
              </p>
            </div>
            <span className="font-sans text-[18px] font-medium text-racing">
              {order.total.toLocaleString("uk-UA")} ₴
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

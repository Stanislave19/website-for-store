"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { listAdminOrders } from "@/lib/admin-api";
import { pluralize } from "@/lib/pluralize";
import { ORDER_STATUS_LABELS, ORDER_STATUS_OPTIONS } from "@/types/admin";
import type { AdminOrderListItem, OrderStatus } from "@/types/admin";

export default function AdminOrdersPage() {
  const [items, setItems] = useState<AdminOrderListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load(currentPage: number, status: OrderStatus | "") {
    setLoading(true);
    setError(null);
    listAdminOrders({ page: currentPage, status: status || undefined })
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
        setPages(data.pages);
        setPage(data.page);
      })
      .catch(() => setError("Не вдалося завантажити замовлення"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(1, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-medium text-ink">
        Замовлення — {total} {pluralize(total, ["замовлення", "замовлення", "замовлень"])}
      </h1>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label className="font-sans text-[13px] text-leather">Статус:</label>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as OrderStatus | "")}
          className="h-11 rounded-[3px] border border-edge px-3 font-sans text-[15px] text-ink outline-none focus:border-racing"
        >
          <option value="">Усі статуси</option>
          {ORDER_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="mb-4 font-sans text-sm text-error">{error}</p> : null}

      <div className="overflow-x-auto border border-edge bg-white">
        <table className="w-full font-sans text-sm">
          <thead>
            <tr className="border-b border-edge text-left text-leather">
              <th className="px-4 py-3 font-normal">№</th>
              <th className="px-4 py-3 font-normal">Клієнт</th>
              <th className="px-4 py-3 font-normal">Телефон</th>
              <th className="px-4 py-3 font-normal">Сума</th>
              <th className="px-4 py-3 font-normal">Статус</th>
              <th className="px-4 py-3 font-normal">Дата</th>
              <th className="px-4 py-3 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-leather">
                  Завантаження…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-leather">
                  Нічого не знайдено
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-edge last:border-0">
                  <td className="px-4 py-3 text-ink">#{item.id}</td>
                  <td className="px-4 py-3 text-ink">
                    {item.first_name} {item.last_name}
                  </td>
                  <td className="px-4 py-3 text-leather">{item.phone}</td>
                  <td className="px-4 py-3 text-racing">{item.total.toLocaleString("uk-UA")} ₴</td>
                  <td className="px-4 py-3 text-ink">{ORDER_STATUS_LABELS[item.status]}</td>
                  <td className="px-4 py-3 text-leather">
                    {new Date(item.created_at).toLocaleDateString("uk-UA")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${item.id}`}
                      className="font-sans text-[13px] text-racing hover:underline"
                    >
                      Деталі
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 ? (
        <div className="mt-4 flex gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => load(pageNumber, statusFilter)}
              className={`h-9 w-9 rounded-[3px] border font-sans text-sm ${
                pageNumber === page ? "border-racing bg-racing text-cream" : "border-edge text-ink"
              }`}
            >
              {pageNumber}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

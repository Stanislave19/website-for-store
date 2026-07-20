"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminApiError, deleteAdminPromo, listAdminPromos } from "@/lib/admin-api";
import type { AdminPromo } from "@/types/admin";

export default function AdminPromoCodesPage() {
  const [items, setItems] = useState<AdminPromo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    listAdminPromos()
      .then(setItems)
      .catch(() => setError("Не вдалося завантажити промокоди"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Видалити промокод? Цю дію не можна скасувати.")) return;
    setDeletingId(id);
    try {
      await deleteAdminPromo(id);
      load();
    } catch (err) {
      alert(err instanceof AdminApiError ? err.message : "Не вдалося видалити промокод");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-medium text-ink">Промокоди</h1>
        <Link
          href="/admin/promo-codes/new"
          className="rounded-[3px] bg-racing px-5 py-2.5 font-sans text-sm font-medium text-cream"
        >
          + Додати промокод
        </Link>
      </div>

      {error ? <p className="mb-4 font-sans text-sm text-error">{error}</p> : null}

      <div className="overflow-x-auto border border-edge bg-white">
        <table className="w-full font-sans text-sm">
          <thead>
            <tr className="border-b border-edge text-left text-leather">
              <th className="px-4 py-3 font-normal">Код</th>
              <th className="px-4 py-3 font-normal">Знижка</th>
              <th className="px-4 py-3 font-normal">Термін дії</th>
              <th className="px-4 py-3 font-normal">Використано</th>
              <th className="px-4 py-3 font-normal">Активний</th>
              <th className="px-4 py-3 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-leather">
                  Завантаження…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-leather">
                  Промокодів ще немає
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-edge last:border-0">
                  <td className="px-4 py-3 text-ink">{item.code}</td>
                  <td className="px-4 py-3 text-racing">
                    {item.discount_type === "percent"
                      ? `${item.discount_value}%`
                      : `${item.discount_value.toLocaleString("uk-UA")} ₴`}
                  </td>
                  <td className="px-4 py-3 text-leather">
                    {item.expires_at ? new Date(item.expires_at).toLocaleDateString("uk-UA") : "—"}
                  </td>
                  <td className="px-4 py-3 text-leather">
                    {item.usage_count}
                    {item.usage_limit !== null ? ` / ${item.usage_limit}` : ""}
                  </td>
                  <td className="px-4 py-3">{item.is_active ? "Так" : "Ні"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/promo-codes/${item.id}/edit`}
                      className="mr-3 font-sans text-[13px] text-racing hover:underline"
                    >
                      Редагувати
                    </Link>
                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => handleDelete(item.id)}
                      className="font-sans text-[13px] text-error hover:underline disabled:opacity-60"
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

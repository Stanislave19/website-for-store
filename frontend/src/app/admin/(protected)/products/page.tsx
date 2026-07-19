"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { deleteAdminProduct, listAdminProducts, AdminApiError } from "@/lib/admin-api";
import type { AdminProductListItem } from "@/types/admin";

export default function AdminProductsPage() {
  const [items, setItems] = useState<AdminProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function load(currentPage: number, currentSearch: string) {
    setLoading(true);
    setError(null);
    listAdminProducts({ page: currentPage, search: currentSearch || undefined })
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
        setPages(data.pages);
        setPage(data.page);
      })
      .catch(() => setError("Не вдалося завантажити товари"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Видалити товар? Цю дію не можна скасувати.")) return;
    setDeletingId(id);
    try {
      await deleteAdminProduct(id);
      load(page, search);
    } catch (err) {
      if (err instanceof AdminApiError) {
        alert(err.message);
      } else {
        alert("Не вдалося видалити товар");
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-medium text-ink">Товари ({total})</h1>
        <Link
          href="/admin/products/new"
          className="rounded-[3px] bg-racing px-5 py-2.5 font-sans text-sm font-medium text-cream"
        >
          + Додати товар
        </Link>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          load(1, search);
        }}
        className="mb-5"
      >
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Пошук за назвою або артикулом"
          className="h-11 w-full max-w-sm rounded-[3px] border border-edge px-3 font-sans text-[15px] text-ink outline-none focus:border-racing"
        />
      </form>

      {error ? <p className="mb-4 font-sans text-sm text-error">{error}</p> : null}

      <div className="overflow-x-auto border border-edge bg-white">
        <table className="w-full font-sans text-sm">
          <thead>
            <tr className="border-b border-edge text-left text-leather">
              <th className="px-4 py-3 font-normal">Фото</th>
              <th className="px-4 py-3 font-normal">Назва</th>
              <th className="px-4 py-3 font-normal">Артикул</th>
              <th className="px-4 py-3 font-normal">Ціна</th>
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
                  Нічого не знайдено
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-edge last:border-0">
                  <td className="px-4 py-3">
                    {item.main_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.main_image} alt={item.name} className="h-12 w-12 object-cover" />
                    ) : (
                      <div className="h-12 w-12 bg-cream" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink">{item.name}</td>
                  <td className="px-4 py-3 text-leather">{item.sku}</td>
                  <td className="px-4 py-3 text-racing">{item.price.toLocaleString("uk-UA")} ₴</td>
                  <td className="px-4 py-3">{item.is_active ? "Так" : "Ні"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${item.id}/edit`}
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

      {pages > 1 ? (
        <div className="mt-4 flex gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => load(pageNumber, search)}
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

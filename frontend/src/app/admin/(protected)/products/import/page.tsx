"use client";

import Link from "next/link";
import { useState } from "react";

import { AdminApiError, getImportTemplateUrl, importAdminProducts } from "@/lib/admin-api";
import type { ProductImportReport } from "@/types/admin";

export default function AdminProductImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ProductImportReport | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) return;
    setSubmitting(true);
    setError(null);
    setReport(null);
    try {
      const result = await importAdminProducts(file);
      setReport(result);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Не вдалося виконати імпорт");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="mb-6 font-sans text-[13px] text-leather">
        <Link href="/admin/products">Товари</Link>
        <span className="mx-2 text-edge">/</span>
        <span className="text-ink">Імпорт</span>
      </nav>
      <h1 className="mb-2 font-serif text-2xl font-medium text-ink">Масовий імпорт товарів</h1>
      <p className="mb-6 font-sans text-sm text-leather">
        Завантажте файл .csv або .xlsx. Товар з наявним артикулом оновиться, з новим — створиться.{" "}
        <a
          href={getImportTemplateUrl()}
          className="text-racing hover:underline"
        >
          Завантажити шаблон CSV
        </a>
        .
      </p>

      <form onSubmit={handleSubmit} className="mb-6 border border-edge bg-white p-6">
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="mb-4 block font-sans text-sm text-ink"
        />
        <button
          type="submit"
          disabled={!file || submitting}
          className="rounded-[3px] bg-racing px-6 py-3 font-sans text-sm font-medium text-cream disabled:opacity-60"
        >
          {submitting ? "Імпортуємо…" : "Імпортувати"}
        </button>
      </form>

      {error ? <p className="mb-4 font-sans text-sm text-error">{error}</p> : null}

      {report ? (
        <div className="border border-edge bg-white p-6">
          <h2 className="mb-3 font-serif text-lg font-medium text-ink">Результат</h2>
          <dl className="mb-4 grid grid-cols-3 gap-4 font-sans text-sm">
            <div>
              <dt className="text-leather">Рядків у файлі</dt>
              <dd className="text-lg text-ink">{report.total_rows}</dd>
            </div>
            <div>
              <dt className="text-leather">Створено</dt>
              <dd className="text-lg text-racing">{report.created}</dd>
            </div>
            <div>
              <dt className="text-leather">Оновлено</dt>
              <dd className="text-lg text-racing">{report.updated}</dd>
            </div>
          </dl>

          {report.errors.length > 0 ? (
            <div>
              <h3 className="mb-2 font-sans text-sm font-medium text-error">
                Помилки ({report.errors.length})
              </h3>
              <table className="w-full font-sans text-sm">
                <thead>
                  <tr className="border-b border-edge text-left text-leather">
                    <th className="py-2 pr-4 font-normal">Рядок</th>
                    <th className="py-2 font-normal">Повідомлення</th>
                  </tr>
                </thead>
                <tbody>
                  {report.errors.map((rowError, index) => (
                    <tr key={index} className="border-b border-edge last:border-0">
                      <td className="py-2 pr-4 text-ink">{rowError.row}</td>
                      <td className="py-2 text-error">{rowError.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="font-sans text-sm text-racing">Усі рядки успішно оброблено.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

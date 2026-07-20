"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createAdminPromo, updateAdminPromo, AdminApiError } from "@/lib/admin-api";
import type { AdminPromo, DiscountType } from "@/types/admin";

interface PromoCodeFormProps {
  promo?: AdminPromo;
}

export function PromoCodeForm({ promo }: PromoCodeFormProps) {
  const router = useRouter();
  const isEdit = Boolean(promo);

  const [code, setCode] = useState(promo?.code ?? "");
  const [discountType, setDiscountType] = useState<DiscountType>(promo?.discount_type ?? "percent");
  const [discountValue, setDiscountValue] = useState(promo ? String(promo.discount_value) : "");
  const [expiresAt, setExpiresAt] = useState(promo?.expires_at ?? "");
  const [usageLimit, setUsageLimit] = useState(promo?.usage_limit ? String(promo.usage_limit) : "");
  const [isActive, setIsActive] = useState(promo?.is_active ?? true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const payload = {
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: Number(discountValue),
      expires_at: expiresAt.trim() || null,
      usage_limit: usageLimit.trim() ? Number(usageLimit) : null,
      is_active: isActive,
    };

    setSubmitting(true);
    try {
      if (isEdit && promo) {
        await updateAdminPromo(promo.id, payload);
      } else {
        await createAdminPromo(payload);
      }
      router.push("/admin/promo-codes");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof AdminApiError ? err.message : "Не вдалося зберегти промокод. Перевірте поля.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <section className="border border-edge bg-white p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Код" required>
            <input
              type="text"
              required
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Тип знижки" required>
            <select
              value={discountType}
              onChange={(event) => setDiscountType(event.target.value as DiscountType)}
              className={inputClass}
            >
              <option value="percent">Відсоток</option>
              <option value="fixed">Фіксована сума</option>
            </select>
          </Field>
          <Field label="Розмір знижки" required>
            <input
              type="number"
              required
              min={0}
              step="0.01"
              value={discountValue}
              onChange={(event) => setDiscountValue(event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Термін дії">
            <input
              type="date"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Ліміт використань">
            <input
              type="number"
              min={0}
              value={usageLimit}
              onChange={(event) => setUsageLimit(event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Активний">
            <label className="flex h-11 items-center gap-2 font-sans text-sm text-ink">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
              />
              Промокод активний
            </label>
          </Field>
        </div>
      </section>

      {error ? <p className="font-sans text-sm text-error">{error}</p> : null}

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-[3px] bg-racing px-6 py-3 font-sans text-sm font-medium text-cream disabled:opacity-60"
        >
          {submitting ? "Зберігаємо…" : isEdit ? "Зберегти зміни" : "Створити промокод"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "h-11 w-full rounded-[3px] border border-edge px-3 font-sans text-[15px] text-ink outline-none focus:border-racing";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block font-sans text-[13px] text-leather">
        {label} {required ? <span className="text-brass">*</span> : null}
      </label>
      {children}
    </div>
  );
}

"use client";

import { useState } from "react";

import { validatePromoCode } from "@/lib/api";

interface AppliedPromo {
  code: string;
  type: "percent" | "fixed";
  value: number;
  amount: number;
}

export function usePromoCode(itemsTotal: number) {
  const [code, setCodeRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [promo, setPromo] = useState<AppliedPromo | null>(null);
  const [applying, setApplying] = useState(false);

  function setCode(value: string) {
    setCodeRaw(value);
    // Текст змінився після застосування — стара знижка більше не відповідає
    // введеному коду, тож знімаємо позначку "застосовано" (сам текст не чіпаємо).
    if (promo && value.trim() !== promo.code) {
      setPromo(null);
    }
    if (error) setError(null);
  }

  async function apply() {
    const trimmed = code.trim();
    if (!trimmed) return;
    setApplying(true);
    setError(null);
    try {
      const result = await validatePromoCode(trimmed, itemsTotal);
      if (!result.valid) {
        setPromo(null);
        setError(result.error ?? "Промокод недійсний");
      } else {
        setPromo({
          code: trimmed,
          type: (result.discount_type as "percent" | "fixed") ?? "fixed",
          value: result.discount_value ?? 0,
          amount: result.discount_amount,
        });
      }
    } catch {
      setPromo(null);
      setError("Не вдалося перевірити промокод. Спробуйте ще раз.");
    } finally {
      setApplying(false);
    }
  }

  const discountAmount = promo?.amount ?? 0;
  const appliedCode = promo?.code;

  return { code, setCode, error, promo, applying, apply, discountAmount, appliedCode };
}

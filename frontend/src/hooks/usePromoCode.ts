"use client";

import { useState } from "react";

import { validatePromoCode } from "@/lib/api";

interface AppliedPromo {
  type: "percent" | "fixed";
  value: number;
  amount: number;
}

export function usePromoCode(itemsTotal: number) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [promo, setPromo] = useState<AppliedPromo | null>(null);
  const [applying, setApplying] = useState(false);

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
  const appliedCode = promo ? code.trim() : undefined;

  return { code, setCode, error, promo, applying, apply, discountAmount, appliedCode };
}

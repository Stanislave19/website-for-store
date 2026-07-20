"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { PromoCodeForm } from "@/components/admin/PromoCodeForm";
import { getAdminPromo } from "@/lib/admin-api";
import type { AdminPromo } from "@/types/admin";

export default function EditAdminPromoCodePage() {
  const params = useParams<{ id: string }>();
  const promoId = Number(params.id);

  const [promo, setPromo] = useState<AdminPromo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAdminPromo(promoId)
      .then((data) => {
        if (!cancelled) setPromo(data);
      })
      .catch(() => {
        if (!cancelled) setError("Промокод не знайдено");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [promoId]);

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="mb-6 font-sans text-[13px] text-leather">
        <Link href="/admin/promo-codes">Промокоди</Link>
        <span className="mx-2 text-edge">/</span>
        <span className="text-ink">Редагування</span>
      </nav>
      <h1 className="mb-6 font-serif text-2xl font-medium text-ink">Редагування промокоду</h1>

      {loading ? (
        <p className="font-sans text-sm text-leather">Завантаження…</p>
      ) : error || !promo ? (
        <p className="font-sans text-sm text-error">{error ?? "Промокод не знайдено"}</p>
      ) : (
        <PromoCodeForm promo={promo} />
      )}
    </div>
  );
}

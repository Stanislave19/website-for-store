"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ProductForm } from "@/components/admin/ProductForm";
import { ProductImages } from "@/components/admin/ProductImages";
import { getAdminProduct } from "@/lib/admin-api";
import type { AdminProductDetail } from "@/types/admin";

export default function EditAdminProductPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);

  const [product, setProduct] = useState<AdminProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAdminProduct(productId)
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch(() => {
        if (!cancelled) setError("Товар не знайдено");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="mb-6 font-sans text-[13px] text-leather">
        <Link href="/admin/products">Товари</Link>
        <span className="mx-2 text-edge">/</span>
        <span className="text-ink">Редагування</span>
      </nav>
      <h1 className="mb-6 font-serif text-2xl font-medium text-ink">Редагування товару</h1>

      {loading ? (
        <p className="font-sans text-sm text-leather">Завантаження…</p>
      ) : error || !product ? (
        <p className="font-sans text-sm text-error">{error ?? "Товар не знайдено"}</p>
      ) : (
        <div className="flex flex-col gap-6">
          <ProductImages productId={product.id} images={product.images} />
          <ProductForm product={product} />
        </div>
      )}
    </div>
  );
}

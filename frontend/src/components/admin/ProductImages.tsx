"use client";

import { useRef, useState } from "react";

import { deleteAdminProductImage, uploadAdminProductImage, AdminApiError } from "@/lib/admin-api";
import type { AdminProductImage } from "@/types/admin";

interface ProductImagesProps {
  productId: number;
  images: AdminProductImage[];
}

export function ProductImages({ productId, images: initialImages }: ProductImagesProps) {
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const image = await uploadAdminProductImage(productId, file);
      setImages((current) => [...current, image]);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Не вдалося завантажити фото");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(imageId: number) {
    try {
      await deleteAdminProductImage(productId, imageId);
      setImages((current) => current.filter((img) => img.id !== imageId));
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Не вдалося видалити фото");
    }
  }

  return (
    <section className="border border-edge bg-white p-6">
      <h2 className="mb-4 font-serif text-lg font-medium text-ink">Фото</h2>

      {images.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-3">
          {images.map((image) => (
            <div key={image.id} className="relative h-24 w-24 border border-edge">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => handleDelete(image.id)}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-error font-sans text-xs text-cream"
                aria-label="Видалити фото"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-4 font-sans text-sm text-leather">Фото ще не додано</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleFileChange}
        disabled={uploading}
        className="font-sans text-sm text-ink"
      />
      {uploading ? <p className="mt-2 font-sans text-sm text-leather">Завантажуємо…</p> : null}
      {error ? <p className="mt-2 font-sans text-sm text-error">{error}</p> : null}
    </section>
  );
}

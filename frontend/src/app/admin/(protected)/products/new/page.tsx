import Link from "next/link";

import { ProductForm } from "@/components/admin/ProductForm";

export default function NewAdminProductPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <nav className="mb-6 font-sans text-[13px] text-leather">
        <Link href="/admin/products">Товари</Link>
        <span className="mx-2 text-edge">/</span>
        <span className="text-ink">Новий товар</span>
      </nav>
      <h1 className="mb-6 font-serif text-2xl font-medium text-ink">Новий товар</h1>
      <p className="mb-6 font-sans text-sm text-leather">
        Фото можна буде додати після створення товару.
      </p>
      <ProductForm />
    </div>
  );
}

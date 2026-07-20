import Link from "next/link";

import { PromoCodeForm } from "@/components/admin/PromoCodeForm";

export default function NewAdminPromoCodePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <nav className="mb-6 font-sans text-[13px] text-leather">
        <Link href="/admin/promo-codes">Промокоди</Link>
        <span className="mx-2 text-edge">/</span>
        <span className="text-ink">Новий промокод</span>
      </nav>
      <h1 className="mb-6 font-serif text-2xl font-medium text-ink">Новий промокод</h1>
      <PromoCodeForm />
    </div>
  );
}

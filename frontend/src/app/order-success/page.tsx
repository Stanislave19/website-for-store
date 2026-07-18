"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  return (
    <main className="flex w-full flex-col items-center px-6 py-20 md:px-14">
      <div className="flex max-w-lg flex-col items-center gap-5 border border-edge bg-white px-8 py-16 text-center">
        <CheckCircle2 size={48} className="text-racing" />
        <h1 className="font-serif text-[28px] font-medium text-ink">
          {orderId ? `Заявку №${orderId} прийнято` : "Заявку прийнято"}
        </h1>
        <p className="font-sans text-[15px] text-leather">
          Менеджер зв'яжеться з вами найближчим часом для підтвердження замовлення.
        </p>
        <Link
          href="/catalog"
          className="mt-2 rounded-[3px] bg-racing px-8 py-3.5 font-sans text-sm font-medium text-cream"
        >
          Повернутись у каталог
        </Link>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={null}>
      <OrderSuccessContent />
    </Suspense>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getAccountSession } from "@/lib/account-api";

export default function AccountEntryPage() {
  const router = useRouter();

  useEffect(() => {
    getAccountSession()
      .then(() => router.replace("/account/orders"))
      .catch(() => router.replace("/account/login"));
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream">
      <p className="font-sans text-sm text-leather">Завантаження…</p>
    </main>
  );
}

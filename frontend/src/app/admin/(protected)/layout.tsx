"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { adminLogout, adminMe } from "@/lib/admin-api";
import type { AdminSession } from "@/types/admin";

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    adminMe()
      .then((data) => {
        if (!cancelled) setSession(data);
      })
      .catch(() => {
        if (!cancelled) router.replace("/admin/login");
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    await adminLogout();
    router.push("/admin/login");
  }

  if (checking || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream">
        <p className="font-sans text-sm text-leather">Перевіряємо вхід…</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="flex items-center justify-between border-b border-edge bg-white px-6 py-4">
        <Link href="/admin/products" className="font-serif text-lg font-medium text-ink">
          LEROM Admin
        </Link>
        <div className="flex items-center gap-4">
          <span className="font-sans text-[13px] text-leather">
            {session.role === "owner" ? "Власник" : "Менеджер"}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-[3px] border border-edge px-3 py-2 font-sans text-[13px] text-ink hover:border-brass"
          >
            <LogOut size={15} />
            Вийти
          </button>
        </div>
      </header>
      <main className="px-6 py-8 md:px-10">{children}</main>
    </div>
  );
}

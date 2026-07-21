"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

import { getAccountSession, logoutClient } from "@/lib/account-api";
import type { ClientSession } from "@/types/account";

export const AccountSessionContext = createContext<ClientSession | null>(null);

export function useAccountSession(): ClientSession | null {
  return useContext(AccountSessionContext);
}

const NAV_LINKS = [
  { href: "/account/orders", label: "Мої замовлення" },
  { href: "/account/addresses", label: "Адреси" },
  { href: "/account/wishlist", label: "Список бажань" },
];

export default function ProtectedAccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<ClientSession | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getAccountSession()
      .then((data) => {
        if (!cancelled) setSession(data);
      })
      .catch(() => {
        if (!cancelled) router.replace("/account/login");
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    await logoutClient();
    router.push("/account/login");
  }

  if (checking || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream">
        <p className="font-sans text-sm text-leather">Перевіряємо вхід…</p>
      </main>
    );
  }

  return (
    <AccountSessionContext.Provider value={session}>
      <div className="min-h-screen bg-cream">
        <header className="border-b border-edge bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-serif text-lg font-medium text-ink">
              LEROM
            </Link>
            <div className="flex items-center gap-4">
              <span className="font-sans text-[13px] text-leather">{session.email}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-[3px] border border-edge px-3 py-2 font-sans text-[13px] text-ink hover:border-brass"
              >
                <LogOut size={15} />
                Вийти
              </button>
            </div>
          </div>
          <nav className="mt-4 flex flex-wrap gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-[3px] px-3 py-2 font-sans text-[13px] ${
                    active ? "bg-racing text-cream" : "text-ink hover:border-brass"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="px-6 py-8 md:px-10">{children}</main>
      </div>
    </AccountSessionContext.Provider>
  );
}

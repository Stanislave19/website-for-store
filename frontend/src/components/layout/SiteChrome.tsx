"use client";

import { usePathname } from "next/navigation";

import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";
import { Header } from "./Header";

const HIDE_BOTTOM_NAV_PREFIXES = ["/checkout"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  const hideBottomNav = HIDE_BOTTOM_NAV_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  return (
    <>
      <Header />
      <div className={`flex-1 ${hideBottomNav ? "" : "pb-[64px] lg:pb-0"}`}>{children}</div>
      <Footer />
      {hideBottomNav ? null : <BottomNav />}
    </>
  );
}

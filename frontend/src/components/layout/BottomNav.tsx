"use client";

import { Heart, LayoutGrid, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";

import { useSearchOverlay } from "./SearchOverlay";

function NavBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="absolute -top-1 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brass px-1 font-sans text-[10px] font-medium text-ink">
      {count}
    </span>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { openSearch } = useSearchOverlay();

  const itemClassName = (active: boolean) =>
    `flex flex-1 flex-col items-center gap-1 py-2.5 font-sans text-[11px] ${
      active ? "text-racing" : "text-leather"
    }`;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-edge bg-cream lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch justify-around">
        <Link href="/catalog" aria-label="Каталог" className={itemClassName(pathname === "/catalog")}>
          <LayoutGrid size={22} />
          Каталог
        </Link>

        <button type="button" aria-label="Пошук" onClick={openSearch} className={itemClassName(false)}>
          <Search size={22} />
          Пошук
        </button>

        <Link href="/cart" aria-label="Кошик" className={itemClassName(pathname === "/cart")}>
          <span className="relative">
            <ShoppingCart size={22} />
            <NavBadge count={cartCount} />
          </span>
          Кошик
        </Link>

        <Link href="/wishlist" aria-label="Обране" className={itemClassName(pathname === "/wishlist")}>
          <span className="relative">
            <Heart size={22} />
            <NavBadge count={wishlistCount} />
          </span>
          Обране
        </Link>
      </div>
    </nav>
  );
}

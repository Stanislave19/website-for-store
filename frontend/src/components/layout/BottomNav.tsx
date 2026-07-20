"use client";

import { Heart, LayoutGrid, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";

function NavBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="absolute -top-1 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brass px-1 font-sans text-[10px] font-medium text-ink">
      {count}
    </span>
  );
}

const NAV_ITEMS = [
  { href: "/catalog", label: "Каталог", icon: LayoutGrid },
  { href: "/catalog?search=1", label: "Пошук", icon: Search },
  { href: "/cart", label: "Кошик", icon: ShoppingCart },
  { href: "/wishlist", label: "Обране", icon: Heart },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-edge bg-cream lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const path = href.split("?")[0];
          const active = pathname === path;
          const count = href === "/cart" ? cartCount : href === "/wishlist" ? wishlistCount : 0;
          return (
            <Link
              key={label}
              href={href}
              aria-label={label}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 font-sans text-[11px] ${
                active ? "text-racing" : "text-leather"
              }`}
            >
              <span className="relative">
                <Icon size={22} />
                <NavBadge count={count} />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

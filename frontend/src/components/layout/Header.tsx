"use client";

import { Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";

import { Logo } from "./Logo";
import { useSearchOverlay } from "./SearchOverlay";

function CountBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brass px-1 font-sans text-[10px] font-medium text-ink">
      {count}
    </span>
  );
}

const NAV_LINKS = [
  { href: "/catalog", label: "Каталог" },
  { href: "/about", label: "Про нас" },
  { href: "/warranty", label: "Гарантія" },
  { href: "/contacts", label: "Контакти" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { openSearch } = useSearchOverlay();

  return (
    <header className="border-b border-edge bg-cream">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 md:px-14">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-serif text-[17px] font-medium text-ink transition-colors hover:text-brass"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-[22px] md:flex">
          <button type="button" aria-label="Пошук" onClick={openSearch}>
            <Search size={22} className="text-ink" />
          </button>
          <Link href="/wishlist" aria-label="Список бажань" className="relative">
            <Heart size={22} className="text-ink" />
            <CountBadge count={wishlistCount} />
          </Link>
          <Link href="/cart" aria-label="Кошик" className="relative">
            <ShoppingCart size={22} className="text-ink" />
            <CountBadge count={cartCount} />
          </Link>
          <Link href="/account" aria-label="Кабінет">
            <User size={22} className="text-ink" />
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden"
          aria-label="Меню"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {menuOpen ? (
        <div className="flex flex-col gap-5 border-t border-edge px-6 py-6 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-serif text-[17px] font-medium text-ink"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex items-center gap-6">
            <button
              type="button"
              aria-label="Пошук"
              onClick={() => {
                setMenuOpen(false);
                openSearch();
              }}
            >
              <Search size={22} className="text-ink" />
            </button>
            <Link href="/wishlist" aria-label="Список бажань" className="relative">
              <Heart size={22} className="text-ink" />
              <CountBadge count={wishlistCount} />
            </Link>
            <Link href="/cart" aria-label="Кошик" className="relative">
              <ShoppingCart size={22} className="text-ink" />
              <CountBadge count={cartCount} />
            </Link>
            <Link href="/account" aria-label="Кабінет">
              <User size={22} className="text-ink" />
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

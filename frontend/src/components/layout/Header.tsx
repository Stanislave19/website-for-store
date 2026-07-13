"use client";

import { Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Logo } from "./Logo";

const NAV_LINKS = [
  { href: "/catalog", label: "Каталог" },
  { href: "/about", label: "Про нас" },
  { href: "/warranty", label: "Гарантія" },
  { href: "/contacts", label: "Контакти" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <Link href="/catalog" aria-label="Пошук">
            <Search size={22} className="text-ink" />
          </Link>
          <Link href="/wishlist" aria-label="Список бажань">
            <Heart size={22} className="text-ink" />
          </Link>
          <Link href="/cart" aria-label="Кошик">
            <ShoppingCart size={22} className="text-ink" />
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
            <Link href="/catalog" aria-label="Пошук">
              <Search size={22} className="text-ink" />
            </Link>
            <Link href="/wishlist" aria-label="Список бажань">
              <Heart size={22} className="text-ink" />
            </Link>
            <Link href="/cart" aria-label="Кошик">
              <ShoppingCart size={22} className="text-ink" />
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

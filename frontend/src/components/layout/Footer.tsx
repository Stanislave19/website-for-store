import Link from "next/link";

import { Logo } from "./Logo";

const CATALOG_LINKS = [
  { href: "/catalog", label: "Каталог" },
  { href: "/about", label: "Про нас" },
  { href: "/warranty", label: "Гарантія" },
  { href: "/contacts", label: "Контакти" },
];

export function Footer() {
  return (
    <footer className="bg-racing text-footer-text">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <Logo variant="racing" />
            <p className="mt-4 max-w-xs text-sm">
              Годинники для тих, хто цінує стриману впевненість.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-footer-muted text-xs"
              >
                IG
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-footer-muted text-xs"
              >
                FB
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-serif text-base font-medium text-cream">Каталог</h3>
            <ul className="flex flex-col gap-2 text-sm">
              {CATALOG_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-cream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-serif text-base font-medium text-cream">Контакти</h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li className="text-brass">+380 44 123 4567</li>
              <li className="text-brass">hello@lerom.watch</li>
              <li>Київ, вул. Хрещатик 12</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-serif text-base font-medium text-cream">Зв&apos;язатися</h3>
            <div className="flex gap-3">
              <a
                href="https://t.me/lerom_manager"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[3px] border border-footer-muted px-4 py-2 text-sm hover:text-cream"
              >
                Telegram
              </a>
              <a
                href="viber://chat"
                className="rounded-[3px] border border-footer-muted px-4 py-2 text-sm hover:text-cream"
              >
                Viber
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-footer-muted pt-6 text-xs opacity-80">
          © {new Date().getFullYear()} LEROM Watch Co. Усі права захищено.
        </div>
      </div>
    </footer>
  );
}

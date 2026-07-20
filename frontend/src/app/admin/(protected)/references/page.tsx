import Link from "next/link";

const LINKS = [
  { href: "/admin/references/brands", label: "Бренди" },
  { href: "/admin/references/mechanism-types", label: "Типи механізму" },
  { href: "/admin/references/attribute-types", label: "Типи атрибутів" },
  { href: "/admin/references/attribute-values", label: "Значення атрибутів" },
];

export default function AdminReferencesPage() {
  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-medium text-ink">Довідники</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="border border-edge bg-white px-5 py-4 font-sans text-[15px] text-ink hover:border-brass"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

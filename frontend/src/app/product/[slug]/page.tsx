import { Package, Shield } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductActions } from "@/components/product/ProductActions";
import { ProductGallery } from "@/components/product/ProductGallery";
import { TrustBadges } from "@/components/ui/TrustBadges";
import { getProductBySlug, getProducts } from "@/lib/api";

const GENDER_LABELS: Record<string, string> = {
  male: "Чоловічі",
  female: "Жіночі",
  unisex: "Унісекс",
};

function formatPrice(value: number): string {
  return `${Math.round(value).toLocaleString("uk-UA")} ₴`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    return {
      title: `${product.name} — LEROM Watch Co.`,
      description: product.description ?? `${product.name}, ${product.brand}, ${formatPrice(product.price)}`,
    };
  } catch {
    return { title: "Товар не знайдено — LEROM Watch Co." };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product;
  try {
    product = await getProductBySlug(slug);
  } catch {
    notFound();
  }

  const similarResponse = await getProducts({ category: product.category_id, page_size: 5 });
  const similar = similarResponse.items.filter((item) => item.slug !== product.slug).slice(0, 4);

  const hasDiscount = product.old_price !== null && product.old_price > product.price;

  const characteristics = [
    { label: "Бренд", value: product.brand },
    { label: "Стать", value: GENDER_LABELS[product.gender] ?? product.gender },
    { label: "Тип механізму", value: product.mechanism_type },
    ...(product.case_diameter_mm !== null
      ? [{ label: "Діаметр корпусу", value: `${product.case_diameter_mm} мм` }]
      : []),
    ...product.attributes.map((attribute) => ({
      label: attribute.attribute_type,
      value: attribute.value,
    })),
  ];
  const half = Math.ceil(characteristics.length / 2);
  const leftColumn = characteristics.slice(0, half);
  const rightColumn = characteristics.slice(half);

  return (
    <main className="w-full px-6 py-8 md:px-14">
      <nav className="mb-6 font-sans text-[13px] text-leather">
        <Link href="/">Головна</Link>
        <span className="mx-2 text-edge">/</span>
        <Link href="/catalog">Каталог</Link>
        <span className="mx-2 text-edge">/</span>
        <Link href={`/catalog?category=${product.category_id}`}>{product.category}</Link>
        <span className="mx-2 text-edge">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <ProductGallery images={product.images} />

        <div className="flex flex-col gap-4">
          <span className="font-sans text-[13px] text-brass">{product.brand}</span>
          <h1 className="font-serif text-[34px] font-medium text-ink">{product.name}</h1>
          <span className="font-sans text-[13px] text-leather">Арт. {product.sku}</span>

          <div className="flex items-baseline gap-3">
            <span
              className={`font-sans text-[28px] font-medium ${hasDiscount ? "text-sale" : "text-racing"}`}
            >
              {formatPrice(product.price)}
            </span>
            {hasDiscount ? (
              <span className="font-sans text-base text-leather line-through">
                {formatPrice(product.old_price as number)}
              </span>
            ) : null}
          </div>

          {product.description ? (
            <p className="font-sans text-[15px] leading-relaxed text-leather">
              {product.description}
            </p>
          ) : null}

          <ProductActions productId={product.id} slug={product.slug} />

          <div className="flex flex-col gap-2 pt-2">
            {[
              { icon: Shield, text: "Гарантія 24 місяці" },
              { icon: Package, text: "Оригінальний товар" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon size={20} className="text-brass" />
                <span className="font-sans text-[13px] text-leather">{text}</span>
              </div>
            ))}
          </div>

          <div className="rounded-[3px] border border-edge p-5">
            <h3 className="mb-3 font-serif text-base text-ink">Потрібна консультація?</h3>
            <div className="flex gap-3">
              <a
                href="https://t.me/lerom_manager"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[3px] border border-edge px-5 py-2.5 font-sans text-sm text-ink"
              >
                Telegram
              </a>
              <a
                href="viber://chat"
                className="rounded-[3px] border border-edge px-5 py-2.5 font-sans text-sm text-ink"
              >
                Viber
              </a>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="mb-6 font-serif text-2xl font-medium text-ink">Характеристики</h2>
        <div className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
          {[leftColumn, rightColumn].map((column, columnIndex) => (
            <div key={columnIndex} className="flex flex-col">
              {column.map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between border-b border-edge py-3 font-sans text-sm"
                >
                  <span className="text-leather">{row.label}</span>
                  <span className="text-ink">{row.value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="mb-6 font-serif text-2xl font-medium text-ink">Гарантія та комплектація</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-[3px] border border-edge p-6">
            <Shield size={24} className="mb-3 text-brass" />
            <h3 className="mb-2 font-serif text-base text-ink">
              Гарантія {product.warranty_months ?? 24} місяці
            </h3>
            <p className="font-sans text-sm text-leather">
              Офіційна гарантія виробника покриває механізм, корпус і скло за умов належної
              експлуатації.
            </p>
          </div>
          <div className="rounded-[3px] border border-edge p-6">
            <Package size={24} className="mb-3 text-brass" />
            <h3 className="mb-2 font-serif text-base text-ink">Комплектація</h3>
            <p className="font-sans text-sm text-leather">
              {product.package_contents ?? "Фірмова коробка, гарантійний талон, інструкція"}
            </p>
          </div>
        </div>
      </section>

      {similar.length > 0 ? (
        <section className="mt-16">
          <h2 className="mb-6 font-serif text-2xl font-medium text-ink">Схожі моделі</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {similar.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                slug={item.slug}
                name={item.name}
                description={item.description}
                price={item.price}
                oldPrice={item.old_price}
                brand={item.brand}
              />
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-16 -mx-6 md:-mx-14">
        <TrustBadges />
      </div>
    </main>
  );
}

import Link from "next/link";

import { getFilters, getProducts } from "@/lib/api";
import { PlaceholderImage } from "@/components/catalog/PlaceholderImage";
import { ProductCard } from "@/components/catalog/ProductCard";
import { TrustBadges } from "@/components/ui/TrustBadges";
import { pluralize } from "@/lib/pluralize";

const GENDER_LABELS: Record<string, string> = {
  male: "Чоловічі",
  female: "Жіночі",
  unisex: "Унісекс",
};

export default async function Home() {
  const [popular, newArrivals, filters] = await Promise.all([
    getProducts({ sort: "newest", page: 1, page_size: 4 }),
    getProducts({ sort: "newest", page: 2, page_size: 4 }),
    getFilters(),
  ]);

  const genderGroup = filters.categorical.find((group) => group.key === "gender");

  return (
    <main>
      <section className="grid grid-cols-1 gap-10 bg-racing px-6 py-14 md:min-h-[520px] md:grid-cols-2 md:items-center md:px-14 md:py-0">
        <div className="flex flex-col gap-5">
          <h1 className="font-serif text-4xl font-medium text-cream md:text-[48px]">
            Годинники, що переживуть моду
          </h1>
          <p className="max-w-md font-sans text-[17px] text-[#CFE0D2]">
            Ми обираємо моделі, які залишаються актуальними десятиліттями. Класика, що
            передається у спадок.
          </p>
          <Link
            href="/catalog"
            className="w-fit rounded-[3px] bg-brass px-7 py-4 font-sans text-[15px] font-medium text-white"
          >
            Перейти до каталогу
          </Link>
        </div>
        <div className="hidden border border-white/10 md:block">
          <div className="flex aspect-4/3 items-center justify-center text-sm text-[#CFE0D2]">
            фото годинника — hero
          </div>
        </div>
      </section>

      <TrustBadges />

      <section className="px-6 py-20 md:px-14">
        <h2 className="mb-7 font-serif text-[28px] font-medium text-ink">Оберіть свій стиль</h2>
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-3">
          {(genderGroup?.options ?? []).map((option) => (
            <Link
              key={option.value}
              href={`/catalog?gender=${option.value}`}
              className="group border border-edge bg-white transition-colors hover:border-brass"
            >
              <PlaceholderImage />
              <div className="p-4">
                <h3 className="font-serif text-xl font-medium text-ink">
                  {GENDER_LABELS[option.value] ?? option.label}
                </h3>
                <p className="font-sans text-[13px] text-brass">
                  {option.count} {pluralize(option.count, ["модель", "моделі", "моделей"])}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 md:px-14">
        <div className="mb-7 flex items-center justify-between">
          <h2 className="font-serif text-[28px] font-medium text-ink">Популярні моделі</h2>
          <Link href="/catalog" className="font-sans text-sm text-brass">
            Дивитись усі →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-7 md:grid-cols-4">
          {popular.items.map((product) => (
            <ProductCard
              key={product.id}
              slug={product.slug}
              name={product.name}
              description={product.description}
              price={product.price}
              oldPrice={product.old_price}
              brand={product.brand}
            />
          ))}
        </div>
      </section>

      <section className="bg-white px-6 py-20 md:px-14">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-2">
          <PlaceholderImage />
          <div className="flex flex-col gap-4">
            <h2 className="font-serif text-[28px] font-medium text-ink">
              Класика без зайвого галасу
            </h2>
            <p className="font-sans text-[15px] leading-relaxed text-leather">
              LEROM обирає моделі, які не женуться за трендами. Ми віримо, що добрий
              годинник — це річ на десятиліття, а не на сезон. Кожна модель у каталозі
              пройшла відбір за якістю механізму, матеріалів і довговічністю дизайну.
            </p>
            <Link
              href="/about"
              className="w-fit rounded-[3px] border border-edge px-6 py-3 font-sans text-sm font-medium text-ink"
            >
              Дізнатись більше
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-14">
        <h2 className="mb-7 font-serif text-[28px] font-medium text-ink">Нові надходження</h2>
        <div className="grid grid-cols-2 gap-7 md:grid-cols-4">
          {newArrivals.items.map((product) => (
            <ProductCard
              key={product.id}
              slug={product.slug}
              name={product.name}
              description={product.description}
              price={product.price}
              oldPrice={product.old_price}
              brand={product.brand}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

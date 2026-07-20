import type { Metadata } from "next";

import { getCategories, getFilters, getProducts } from "@/lib/api";
import { ActiveFilters } from "@/components/catalog/ActiveFilters";
import { FilterPanel } from "@/components/catalog/FilterPanel";
import { MobileFilterSheet } from "@/components/catalog/MobileFilterSheet";
import { Pagination } from "@/components/catalog/Pagination";
import { ProductCard } from "@/components/catalog/ProductCard";
import { SortDropdown } from "@/components/catalog/SortDropdown";
import type { CatalogSearchParams } from "@/lib/catalog-query";
import { getParam, getParamList } from "@/lib/catalog-query";
import { pluralize } from "@/lib/pluralize";
import type { CategoryNode, Gender, SortOption } from "@/types/catalog";

const SORT_VALUES: SortOption[] = ["newest", "price_asc", "price_desc"];

// Параметри каталогу, які НЕ вважаються «фільтром» для правила noindex —
// категорія, сортування й сторінка не створюють дублікатів контенту такою
// самою мірою, як комбінації брендів/атрибутів/ціни, тому лишаються
// індексованими. Усе решта (бренд, стать, механізм, ціна, розміри,
// атрибути, знижка, пошук) — noindex, щоб не роздувати індекс тисячами
// комбінацій на 1000+ товарів.
const SIGNIFICANT_FILTER_KEYS = [
  "brand",
  "gender",
  "mechanism",
  "price_min",
  "price_max",
  "diameter_min",
  "diameter_max",
  "thickness_min",
  "thickness_max",
  "attribute_value_ids",
  "on_sale",
  "search",
];

function hasSignificantFilters(params: CatalogSearchParams): boolean {
  return SIGNIFICANT_FILTER_KEYS.some((key) => {
    const value = params[key];
    return value !== undefined && value !== "" && !(Array.isArray(value) && value.length === 0);
  });
}

function findCategoryName(nodes: CategoryNode[], id: number): string | undefined {
  for (const node of nodes) {
    if (node.id === id) return node.name;
    const found = findCategoryName(node.children, id);
    if (found) return found;
  }
  return undefined;
}

function toNumber(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const categoryId = toNumber(getParam(params, "category"));
  const page = toNumber(getParam(params, "page"));

  let categoryName: string | undefined;
  if (categoryId !== undefined) {
    const categories = await getCategories();
    categoryName = findCategoryName(categories, categoryId);
  }

  const title = categoryName
    ? `${categoryName} — каталог наручних годинників — LEROM Watch Co.`
    : "Каталог наручних годинників — LEROM Watch Co.";
  const description = categoryName
    ? `Наручні годинники в категорії «${categoryName}»: широкий вибір, гарантія 24 місяці, доставка Новою Поштою.`
    : "Каталог наручних годинників з фільтрами за брендом, ціною, механізмом і стилем.";

  if (hasSignificantFilters(params)) {
    // Директива, не підказка: гарантовано виключає комбінації фільтрів з індексу,
    // при цьому дозволяє Google переходити за посиланнями на сторінці (усі товари
    // однаково знаходяться через чистий /catalog і категорії).
    return { title, description, robots: { index: false, follow: true } };
  }

  const canonicalParams = new URLSearchParams();
  if (categoryId !== undefined) canonicalParams.set("category", String(categoryId));
  if (page !== undefined && page > 1) canonicalParams.set("page", String(page));
  const canonicalQuery = canonicalParams.toString();

  return {
    title,
    description,
    alternates: { canonical: `/catalog${canonicalQuery ? `?${canonicalQuery}` : ""}` },
  };
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const params = await searchParams;

  const category = toNumber(getParam(params, "category"));
  const brand = toNumber(getParam(params, "brand"));
  const genderParam = getParam(params, "gender");
  const gender = genderParam as Gender | undefined;
  const mechanism = toNumber(getParam(params, "mechanism"));
  const priceMin = toNumber(getParam(params, "price_min"));
  const priceMax = toNumber(getParam(params, "price_max"));
  const attributeValueIds = getParamList(params, "attribute_value_ids")
    .map(Number)
    .filter(Number.isFinite);
  const search = getParam(params, "search");
  const onSale = getParam(params, "on_sale") === "true";
  const sortParam = getParam(params, "sort");
  const sort = SORT_VALUES.includes(sortParam as SortOption) ? (sortParam as SortOption) : "newest";
  const page = toNumber(getParam(params, "page")) ?? 1;

  const [productsResponse, filters] = await Promise.all([
    getProducts({
      category,
      brand,
      gender,
      mechanism,
      price_min: priceMin,
      price_max: priceMax,
      attribute_value_ids: attributeValueIds,
      search,
      on_sale: onSale || undefined,
      sort,
      page,
    }),
    getFilters(),
  ]);

  return (
    <main className="w-full px-6 py-10 md:px-14">
      <div className="mb-8 flex items-baseline gap-3">
        <h1 className="font-serif text-[34px] font-medium text-ink">Наручні годинники</h1>
        <span className="font-sans text-[15px] text-brass">
          {productsResponse.total}{" "}
          {pluralize(productsResponse.total, ["модель", "моделі", "моделей"])}
        </span>
      </div>

      <MobileFilterSheet>
        <FilterPanel filters={filters} searchParams={params} />
      </MobileFilterSheet>

      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="hidden lg:block">
          <FilterPanel filters={filters} searchParams={params} />
        </div>

        <div className="flex-1">
          <ActiveFilters filters={filters} searchParams={params} />

          <div className="mb-6 flex justify-end">
            <SortDropdown />
          </div>

          {productsResponse.items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 border border-edge bg-white py-20 text-center">
              <p className="font-serif text-xl text-ink">Нічого не знайдено</p>
              <p className="font-sans text-sm text-leather">
                Спробуйте змінити фільтри або скинути їх.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-4 lg:gap-10">
              {productsResponse.items.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                  oldPrice={product.old_price}
                  brand={product.brand}
                  mainImage={product.main_image}
                />
              ))}
            </div>
          )}

          <Pagination page={productsResponse.page} pages={productsResponse.pages} searchParams={params} />
        </div>
      </div>
    </main>
  );
}

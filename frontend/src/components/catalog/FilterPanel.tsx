import Link from "next/link";

import type { CategoryNode, FiltersResponse } from "@/types/catalog";
import type { CatalogSearchParams } from "@/lib/catalog-query";
import { getParam, getParamList, toggleMultiHref, toggleSingleHref } from "@/lib/catalog-query";

import { FilterTag } from "./FilterTag";
import { MoreFilters } from "./MoreFilters";
import { PriceFilter } from "./PriceFilter";

interface FilterPanelProps {
  categories: CategoryNode[];
  filters: FiltersResponse;
  searchParams: CatalogSearchParams;
}

const MAIN_GROUP_KEYS = ["gender", "brand", "mechanism"];

function FilterGroupBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-serif text-[15px] font-medium text-ink">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function FilterPanel({ categories, filters, searchParams }: FilterPanelProps) {
  const activeCategory = getParam(searchParams, "category");
  const activeAttributeValues = getParamList(searchParams, "attribute_value_ids");

  const mainGroups = filters.categorical.filter((group) => MAIN_GROUP_KEYS.includes(group.key));
  const extraGroups = filters.categorical.filter((group) => !MAIN_GROUP_KEYS.includes(group.key));

  return (
    <aside className="flex w-full flex-col gap-8 md:w-[260px] md:shrink-0">
      <FilterGroupBlock title="Категорія">
        {categories.map((category) => (
          <FilterTag
            key={category.id}
            href={toggleSingleHref(searchParams, "category", String(category.id))}
            label={category.name}
            active={activeCategory === String(category.id)}
          />
        ))}
      </FilterGroupBlock>

      {mainGroups
        .filter((group) => group.key === "gender")
        .map((group) => (
          <FilterGroupBlock key={group.key} title={group.label}>
            {group.options.map((option) => (
              <FilterTag
                key={option.value}
                href={toggleSingleHref(searchParams, group.key, option.value)}
                label={option.label}
                count={option.count}
                active={getParam(searchParams, group.key) === option.value}
              />
            ))}
          </FilterGroupBlock>
        ))}

      {mainGroups
        .filter((group) => group.key === "brand")
        .map((group) => (
          <FilterGroupBlock key={group.key} title={group.label}>
            {group.options.map((option) => (
              <FilterTag
                key={option.value}
                href={toggleSingleHref(searchParams, group.key, option.value)}
                label={option.label}
                count={option.count}
                active={getParam(searchParams, group.key) === option.value}
              />
            ))}
          </FilterGroupBlock>
        ))}

      <div className="flex flex-col gap-3">
        <h3 className="font-serif text-[15px] font-medium text-ink">Ціна</h3>
        <PriceFilter
          key={`${getParam(searchParams, "price_min") ?? ""}-${getParam(searchParams, "price_max") ?? ""}`}
          min={filters.price.min}
          max={filters.price.max}
        />
      </div>

      {mainGroups
        .filter((group) => group.key === "mechanism")
        .map((group) => (
          <FilterGroupBlock key={group.key} title={group.label}>
            {group.options.map((option) => (
              <FilterTag
                key={option.value}
                href={toggleSingleHref(searchParams, group.key, option.value)}
                label={option.label}
                count={option.count}
                active={getParam(searchParams, group.key) === option.value}
              />
            ))}
          </FilterGroupBlock>
        ))}

      {extraGroups.length > 0 ? (
        <MoreFilters>
          <div className="flex flex-col gap-8">
            {extraGroups.map((group) => (
              <FilterGroupBlock key={group.key} title={group.label}>
                {group.options.map((option) => (
                  <FilterTag
                    key={option.value}
                    href={toggleMultiHref(searchParams, "attribute_value_ids", option.value)}
                    label={option.label}
                    count={option.count}
                    active={activeAttributeValues.includes(option.value)}
                  />
                ))}
              </FilterGroupBlock>
            ))}
          </div>
        </MoreFilters>
      ) : null}

      <Link href="/catalog" className="w-fit font-sans text-sm text-brass">
        Скинути
      </Link>
    </aside>
  );
}

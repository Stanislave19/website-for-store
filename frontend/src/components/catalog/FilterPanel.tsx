import Link from "next/link";

import type { FiltersResponse } from "@/types/catalog";
import type { CatalogSearchParams } from "@/lib/catalog-query";
import { getParam, getParamList, toggleMultiHref, toggleSingleHref } from "@/lib/catalog-query";

import { FilterTag } from "./FilterTag";
import { MoreFilters } from "./MoreFilters";
import { PriceFilter } from "./PriceFilter";

interface FilterPanelProps {
  filters: FiltersResponse;
  searchParams: CatalogSearchParams;
}

const ORDERED_MAIN_KEYS = ["category", "gender", "brand"];

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

export function FilterPanel({ filters, searchParams }: FilterPanelProps) {
  const activeAttributeValues = getParamList(searchParams, "attribute_value_ids");

  const groupByKey = (key: string) => filters.categorical.find((group) => group.key === key);
  const extraGroups = filters.categorical.filter(
    (group) => !ORDERED_MAIN_KEYS.includes(group.key) && group.key !== "mechanism",
  );

  return (
    <aside className="flex w-full flex-col gap-8 lg:w-[260px] lg:shrink-0">
      {ORDERED_MAIN_KEYS.map((key) => {
        const group = groupByKey(key);
        if (!group) return null;
        return (
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
        );
      })}

      <div className="flex flex-col gap-3">
        <h3 className="font-serif text-[15px] font-medium text-ink">Ціна</h3>
        <PriceFilter
          key={`${getParam(searchParams, "price_min") ?? ""}-${getParam(searchParams, "price_max") ?? ""}`}
          min={filters.price.min}
          max={filters.price.max}
        />
      </div>

      {(() => {
        const group = groupByKey("mechanism");
        if (!group) return null;
        return (
          <FilterGroupBlock title={group.label}>
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
        );
      })()}

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

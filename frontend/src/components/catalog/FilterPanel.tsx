"use client";

import { Minus, Plus, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { FiltersResponse } from "@/types/catalog";
import type { CatalogSearchParams } from "@/lib/catalog-query";
import { getParam, getParamList, hrefWithParam, toggleMultiHref, toggleSingleHref } from "@/lib/catalog-query";

import { FilterTag } from "./FilterTag";
import { MoreFilters } from "./MoreFilters";
import { OnSaleFilter } from "./OnSaleFilter";
import { PriceFilter } from "./PriceFilter";

interface FilterPanelProps {
  filters: FiltersResponse;
  searchParams: CatalogSearchParams;
}

const ORDERED_MAIN_KEYS = ["category", "gender", "brand"];
const DEFAULT_OPEN_KEYS = ["category", "gender"];

function FilterGroupBlock({
  title,
  children,
  defaultOpen = false,
  contentClassName = "flex flex-wrap gap-2",
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  contentClassName?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="flex flex-col gap-3 border-b border-edge pb-6 last:border-b-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between font-sans text-[15px] font-semibold text-ink"
      >
        <span>{title}</span>
        {open ? (
          <Minus size={16} className="shrink-0 text-brass" />
        ) : (
          <Plus size={16} className="shrink-0 text-brass" />
        )}
      </button>
      {open ? <div className={contentClassName}>{children}</div> : null}
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
          <FilterGroupBlock
            key={group.key}
            title={group.label}
            defaultOpen={DEFAULT_OPEN_KEYS.includes(key)}
          >
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

      <FilterGroupBlock title="Ціна" defaultOpen contentClassName="flex flex-col gap-3">
        <PriceFilter
          key={`${getParam(searchParams, "price_min") ?? ""}-${getParam(searchParams, "price_max") ?? ""}`}
          min={filters.price.min}
          max={filters.price.max}
        />
        <OnSaleFilter
          href={hrefWithParam(
            searchParams,
            "on_sale",
            getParam(searchParams, "on_sale") === "true" ? undefined : "true",
          )}
          active={getParam(searchParams, "on_sale") === "true"}
          count={filters.on_sale_count}
        />
      </FilterGroupBlock>

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

      <Link
        href="/catalog"
        className="flex w-fit items-center gap-1.5 font-sans text-sm font-medium text-sale"
      >
        <RotateCcw size={14} />
        Скинути
      </Link>
    </aside>
  );
}

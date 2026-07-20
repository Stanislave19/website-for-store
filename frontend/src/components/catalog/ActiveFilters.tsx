import Link from "next/link";

import type { FiltersResponse } from "@/types/catalog";
import type { CatalogSearchParams } from "@/lib/catalog-query";
import {
  getParam,
  getParamList,
  hrefWithoutParams,
  hrefWithParam,
  toggleMultiHref,
  toggleSingleHref,
} from "@/lib/catalog-query";

import { FilterTag } from "./FilterTag";

interface ActiveFiltersProps {
  filters: FiltersResponse;
  searchParams: CatalogSearchParams;
}

interface ActiveChip {
  key: string;
  label: string;
  href: string;
}

const SINGLE_KEYS = ["category", "gender", "brand", "mechanism"];

function findOptionLabel(filters: FiltersResponse, value: string): string | undefined {
  for (const group of filters.categorical) {
    const option = group.options.find((item) => item.value === value);
    if (option) return option.label;
  }
  return undefined;
}

export function ActiveFilters({ filters, searchParams }: ActiveFiltersProps) {
  const chips: ActiveChip[] = [];

  for (const key of SINGLE_KEYS) {
    const value = getParam(searchParams, key);
    if (!value) continue;
    const group = filters.categorical.find((item) => item.key === key);
    const label = group?.options.find((option) => option.value === value)?.label;
    if (!label) continue;
    chips.push({ key: `${key}:${value}`, label, href: toggleSingleHref(searchParams, key, value) });
  }

  for (const value of getParamList(searchParams, "attribute_value_ids")) {
    const label = findOptionLabel(filters, value);
    if (!label) continue;
    chips.push({
      key: `attribute_value_ids:${value}`,
      label,
      href: toggleMultiHref(searchParams, "attribute_value_ids", value),
    });
  }

  const priceMin = getParam(searchParams, "price_min");
  const priceMax = getParam(searchParams, "price_max");
  if (priceMin || priceMax) {
    const from = priceMin ?? String(filters.price.min);
    const to = priceMax ?? String(filters.price.max);
    chips.push({
      key: "price",
      label: `Ціна: ${Number(from).toLocaleString("uk-UA")}–${Number(to).toLocaleString("uk-UA")} грн`,
      href: hrefWithoutParams(searchParams, ["price_min", "price_max"]),
    });
  }

  if (getParam(searchParams, "on_sale") === "true") {
    chips.push({
      key: "on_sale",
      label: "Тільки зі знижками",
      href: hrefWithParam(searchParams, "on_sale", undefined),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-edge pb-6">
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <FilterTag key={chip.key} href={chip.href} label={chip.label} active />
        ))}
      </div>
      <Link href="/catalog" className="shrink-0 font-sans text-sm text-brass">
        Скинути все
      </Link>
    </div>
  );
}

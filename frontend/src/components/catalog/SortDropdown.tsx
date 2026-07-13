"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Новинки" },
  { value: "price_asc", label: "Спочатку дешевші" },
  { value: "price_desc", label: "Спочатку дорожчі" },
];

export function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "newest";

  return (
    <div className="flex items-center gap-2">
      <span className="font-sans text-sm text-leather">Сортування:</span>
      <select
        value={current}
        onChange={(event) => {
          const query = new URLSearchParams(searchParams.toString());
          query.set("sort", event.target.value);
          query.delete("page");
          router.push(`/catalog?${query.toString()}`);
        }}
        className="border-none bg-transparent font-sans text-sm text-ink"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

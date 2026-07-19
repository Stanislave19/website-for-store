"use client";

import { useEffect, useState } from "react";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getWarehouses } from "@/lib/api";
import type { Warehouse } from "@/types/delivery";

interface WarehouseAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectWarehouse: (warehouse: Warehouse) => void;
  cityRef: string | undefined;
  error?: boolean;
}

export function WarehouseAutocomplete({
  value,
  onChange,
  onSelectWarehouse,
  cityRef,
  error,
}: WarehouseAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const debouncedValue = useDebouncedValue(value, 300);

  useEffect(() => {
    const query = debouncedValue.trim();
    if (!cityRef || query.length < 1) {
      setWarehouses([]);
      return;
    }

    let cancelled = false;
    getWarehouses(cityRef, query).then((result) => {
      if (!cancelled) setWarehouses(result);
    });
    return () => {
      cancelled = true;
    };
  }, [cityRef, debouncedValue]);

  const disabled = !cityRef;

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={disabled ? "Спочатку оберіть місто зі списку" : "Номер або адреса відділення"}
        autoComplete="off"
        className={`h-11 w-full rounded-[3px] border px-3 font-sans text-[15px] text-ink outline-none placeholder:text-leather disabled:cursor-not-allowed disabled:bg-cream ${
          error ? "border-error" : "border-edge focus:border-racing"
        }`}
      />
      {open && warehouses.length > 0 ? (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-[3px] border border-edge bg-white shadow-sm">
          {warehouses.map((warehouse) => (
            <li key={warehouse.ref}>
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onSelectWarehouse(warehouse);
                  setOpen(false);
                }}
                className="w-full px-3 py-2 text-left font-sans text-[15px] text-ink hover:bg-cream"
              >
                {warehouse.description}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

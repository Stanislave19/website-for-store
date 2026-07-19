"use client";

import { useEffect, useState } from "react";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getCities } from "@/lib/api";
import type { City } from "@/types/delivery";

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectCity: (city: City) => void;
  error?: boolean;
}

export function CityAutocomplete({ value, onChange, onSelectCity, error }: CityAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const debouncedValue = useDebouncedValue(value, 300);

  useEffect(() => {
    const query = debouncedValue.trim();
    if (query.length < 2) {
      setCities([]);
      return;
    }

    let cancelled = false;
    getCities(query).then((result) => {
      if (!cancelled) setCities(result);
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedValue]);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Почніть вводити назву міста"
        autoComplete="off"
        className={`h-11 w-full rounded-[3px] border px-3 font-sans text-[15px] text-ink outline-none placeholder:text-leather ${
          error ? "border-error" : "border-edge focus:border-racing"
        }`}
      />
      {open && cities.length > 0 ? (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-[3px] border border-edge bg-white shadow-sm">
          {cities.map((city) => (
            <li key={city.ref}>
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onSelectCity(city);
                  setOpen(false);
                }}
                className="w-full px-3 py-2 text-left font-sans text-[15px] text-ink hover:bg-cream"
              >
                {city.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface PriceFilterProps {
  min: number;
  max: number;
}

export function PriceFilter({ min, max }: PriceFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialMin = Number(searchParams.get("price_min") ?? min);
  const initialMax = Number(searchParams.get("price_max") ?? max);

  const [localMin, setLocalMin] = useState(initialMin);
  const [localMax, setLocalMax] = useState(initialMax);

  function commit(nextMin: number, nextMax: number) {
    const query = new URLSearchParams(searchParams.toString());
    query.delete("page");
    if (nextMin <= min) query.delete("price_min");
    else query.set("price_min", String(nextMin));
    if (nextMax >= max) query.delete("price_max");
    else query.set("price_max", String(nextMax));
    router.push(`/catalog?${query.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={localMin}
          min={min}
          max={localMax}
          onChange={(event) => setLocalMin(Number(event.target.value))}
          onBlur={() => commit(localMin, localMax)}
          className="w-full rounded-[3px] border border-edge bg-white px-2 py-1.5 text-center font-sans text-sm text-ink"
        />
        <span className="text-leather">—</span>
        <input
          type="number"
          value={localMax}
          min={localMin}
          max={max}
          onChange={(event) => setLocalMax(Number(event.target.value))}
          onBlur={() => commit(localMin, localMax)}
          className="w-full rounded-[3px] border border-edge bg-white px-2 py-1.5 text-center font-sans text-sm text-ink"
        />
      </div>

      <div className="relative h-[3px] rounded-full bg-racing/20">
        <div
          className="absolute h-[3px] rounded-full bg-racing"
          style={{
            left: `${((localMin - min) / (max - min || 1)) * 100}%`,
            right: `${100 - ((localMax - min) / (max - min || 1)) * 100}%`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={localMin}
          onChange={(event) => setLocalMin(Math.min(Number(event.target.value), localMax))}
          onMouseUp={() => commit(localMin, localMax)}
          onTouchEnd={() => commit(localMin, localMax)}
          className="range-thumb pointer-events-none absolute -top-2.5 h-6 w-full appearance-none bg-transparent"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={localMax}
          onChange={(event) => setLocalMax(Math.max(Number(event.target.value), localMin))}
          onMouseUp={() => commit(localMin, localMax)}
          onTouchEnd={() => commit(localMin, localMax)}
          className="range-thumb pointer-events-none absolute -top-2.5 h-6 w-full appearance-none bg-transparent"
        />
      </div>

      <div className="flex justify-between font-sans text-xs text-leather">
        <span>{min.toLocaleString("uk-UA")} грн</span>
        <span>{max.toLocaleString("uk-UA")} грн</span>
      </div>
    </div>
  );
}

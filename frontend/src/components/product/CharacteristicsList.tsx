"use client";

import { useState } from "react";

interface CharacteristicRow {
  label: string;
  value: string;
}

const MOBILE_COLLAPSED_COUNT = 6;

export function CharacteristicsList({ characteristics }: { characteristics: CharacteristicRow[] }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = characteristics.length > MOBILE_COLLAPSED_COUNT;
  const mobileRows = expanded ? characteristics : characteristics.slice(0, MOBILE_COLLAPSED_COUNT);

  const half = Math.ceil(characteristics.length / 2);
  const leftColumn = characteristics.slice(0, half);
  const rightColumn = characteristics.slice(half);

  function Row({ row }: { row: CharacteristicRow }) {
    return (
      <div className="flex justify-between border-b border-edge py-3 font-sans text-sm">
        <span className="text-leather">{row.label}</span>
        <span className="text-ink">{row.value}</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:hidden">
        {mobileRows.map((row) => (
          <Row key={row.label} row={row} />
        ))}
        {hasMore ? (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="mt-3 w-fit font-sans text-sm font-medium text-brass"
          >
            {expanded ? "Згорнути" : "Показати всі характеристики"}
          </button>
        ) : null}
      </div>

      <div className="hidden grid-cols-1 gap-x-12 md:grid md:grid-cols-2">
        {[leftColumn, rightColumn].map((column, columnIndex) => (
          <div key={columnIndex} className="flex flex-col">
            {column.map((row) => (
              <Row key={row.label} row={row} />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

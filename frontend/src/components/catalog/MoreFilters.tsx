"use client";

import { useState } from "react";

export function MoreFilters({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {open ? children : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="w-full rounded-[3px] border border-edge py-2.5 font-sans text-sm text-ink"
      >
        {open ? "Сховати фільтри" : "Більше фільтрів"}
      </button>
    </div>
  );
}

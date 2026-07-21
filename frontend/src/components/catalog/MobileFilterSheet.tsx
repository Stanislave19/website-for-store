"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";

import { pluralize } from "@/lib/pluralize";

interface MobileFilterSheetProps {
  children: React.ReactNode;
  resultCount: number;
}

export function MobileFilterSheet({ children, resultCount }: MobileFilterSheetProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 rounded-full border border-racing px-5 py-2.5 font-sans text-sm text-racing"
      >
        <SlidersHorizontal size={16} />
        Фільтри
      </button>

      {open ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Фільтри">
          <button
            type="button"
            aria-label="Закрити фільтри"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-[3px] border-t border-edge bg-cream">
            <div className="flex shrink-0 items-center justify-between border-b border-edge bg-cream px-6 py-5">
              <h2 className="font-serif text-lg font-medium text-ink">Фільтри</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Закрити"
                className="text-ink"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

            <div className="shrink-0 border-t border-edge bg-cream px-6 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-[3px] bg-racing py-3.5 font-sans text-sm font-medium text-cream"
              >
                Показати {resultCount} {pluralize(resultCount, ["модель", "моделі", "моделей"])}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";

interface MobileFilterSheetProps {
  children: React.ReactNode;
}

export function MobileFilterSheet({ children }: MobileFilterSheetProps) {
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
    <div className="mb-6 lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-[3px] border border-edge px-4 py-3 font-sans text-sm text-ink"
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
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[3px] border-t border-edge bg-cream p-6 pt-5">
            <div className="mb-5 flex items-center justify-between">
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
            {children}
          </div>
        </div>
      ) : null}
    </div>
  );
}

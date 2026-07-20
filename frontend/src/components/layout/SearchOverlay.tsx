"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

interface SearchOverlayContextValue {
  openSearch: () => void;
}

const SearchOverlayContext = createContext<SearchOverlayContextValue | null>(null);

export function useSearchOverlay(): SearchOverlayContextValue {
  const context = useContext(SearchOverlayContext);
  if (!context) {
    throw new Error("useSearchOverlay must be used within SearchOverlayProvider");
  }
  return context;
}

export function SearchOverlayProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  function submit() {
    const query = value.trim();
    setOpen(false);
    router.push(query ? `/catalog?search=${encodeURIComponent(query)}` : "/catalog");
  }

  return (
    <SearchOverlayContext.Provider value={{ openSearch: () => setOpen(true) }}>
      {children}
      {open ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="mx-auto mt-24 w-full max-w-xl px-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 rounded-[3px] border border-edge bg-white px-4 py-3">
              <Search size={20} className="shrink-0 text-leather" />
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submit();
                }}
                placeholder="Пошук за назвою або брендом"
                className="w-full font-sans text-sm text-ink outline-none"
              />
              <button
                type="button"
                aria-label="Закрити пошук"
                onClick={() => setOpen(false)}
                className="shrink-0 text-leather"
              >
                <X size={20} />
              </button>
            </div>
            <button
              type="button"
              onClick={submit}
              className="mt-3 w-full rounded-[3px] bg-racing px-4 py-3 font-sans text-sm font-medium text-cream"
            >
              Знайти
            </button>
          </div>
        </div>
      ) : null}
    </SearchOverlayContext.Provider>
  );
}

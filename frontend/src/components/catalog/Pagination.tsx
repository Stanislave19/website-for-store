import Link from "next/link";

import type { CatalogSearchParams } from "@/lib/catalog-query";
import { hrefWithPage } from "@/lib/catalog-query";

interface PaginationProps {
  page: number;
  pages: number;
  searchParams: CatalogSearchParams;
}

function pageList(page: number, pages: number): (number | "...")[] {
  const items = new Set<number>([1, pages, page - 1, page, page + 1]);
  const sorted = [...items].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);

  const result: (number | "...")[] = [];
  let previous = 0;
  for (const p of sorted) {
    if (previous && p - previous > 1) result.push("...");
    result.push(p);
    previous = p;
  }
  return result;
}

export function Pagination({ page, pages, searchParams }: PaginationProps) {
  if (pages <= 1) return null;

  return (
    <nav className="mt-10 flex items-center justify-center gap-2">
      <Link
        href={hrefWithPage(searchParams, Math.max(1, page - 1))}
        className={`flex h-9 w-9 items-center justify-center rounded-[3px] border border-edge font-sans text-sm text-ink hover:border-brass ${
          page === 1 ? "pointer-events-none opacity-40" : ""
        }`}
        aria-disabled={page === 1}
      >
        ‹
      </Link>

      {pageList(page, pages).map((item, index) =>
        item === "..." ? (
          <span key={`dots-${index}`} className="px-1 font-sans text-sm text-leather">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefWithPage(searchParams, item)}
            className={`flex h-9 w-9 items-center justify-center rounded-[3px] font-sans text-sm ${
              item === page
                ? "bg-racing text-cream"
                : "border border-edge text-ink hover:border-brass"
            }`}
          >
            {item}
          </Link>
        ),
      )}

      <Link
        href={hrefWithPage(searchParams, Math.min(pages, page + 1))}
        className={`flex h-9 w-9 items-center justify-center rounded-[3px] border border-edge font-sans text-sm text-ink hover:border-brass ${
          page === pages ? "pointer-events-none opacity-40" : ""
        }`}
        aria-disabled={page === pages}
      >
        ›
      </Link>
    </nav>
  );
}

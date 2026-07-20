"use client";

import { LayoutList, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { CategoryNode } from "@/types/catalog";

interface MobileCategorySheetProps {
  categories: CategoryNode[];
}

function CategoryList({
  nodes,
  depth = 0,
  onNavigate,
}: {
  nodes: CategoryNode[];
  depth?: number;
  onNavigate: () => void;
}) {
  return (
    <ul className="flex flex-col">
      {nodes.map((node) => (
        <li key={node.id}>
          <Link
            href={`/catalog?category=${node.id}`}
            onClick={onNavigate}
            style={{ paddingLeft: `${depth * 16}px` }}
            className="block border-b border-edge py-3 font-sans text-sm text-ink"
          >
            {node.name}
          </Link>
          {node.children.length > 0 ? (
            <CategoryList nodes={node.children} depth={depth + 1} onNavigate={onNavigate} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function MobileCategorySheet({ categories }: MobileCategorySheetProps) {
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
        <LayoutList size={16} />
        Категорії
      </button>

      {open ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Категорії">
          <button
            type="button"
            aria-label="Закрити категорії"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[3px] border-t border-edge bg-cream p-6 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif text-lg font-medium text-ink">Категорії</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Закрити"
                className="text-ink"
              >
                <X size={22} />
              </button>
            </div>
            <CategoryList nodes={categories} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

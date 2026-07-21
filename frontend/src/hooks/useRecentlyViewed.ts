"use client";

import { usePersistentStore } from "@/lib/persistent-store";

const RECENTLY_VIEWED_KEY = "lerom_recently_viewed";
const MAX_ITEMS = 8;

export function useRecentlyViewed() {
  const [slugs, setSlugs] = usePersistentStore<string[]>(RECENTLY_VIEWED_KEY, []);

  function record(slug: string) {
    setSlugs((current) => [slug, ...current.filter((item) => item !== slug)].slice(0, MAX_ITEMS));
  }

  return { slugs, record };
}

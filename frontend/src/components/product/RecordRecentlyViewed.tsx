"use client";

import { useEffect } from "react";

import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

export function RecordRecentlyViewed({ slug }: { slug: string }) {
  const { record } = useRecentlyViewed();

  useEffect(() => {
    record(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return null;
}

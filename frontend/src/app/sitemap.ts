import type { MetadataRoute } from "next";

import { getProductSlugs } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost";

// Свідомо НЕ включаємо відфільтровані /catalog?... (навіть індексовані ?category=X) —
// це вторинний вміст, який Google знаходить сканувавши посилання з /catalog;
// sitemap лишається мінімальним переліком основних сторінок.
const STATIC_PATHS = ["/", "/catalog", "/about", "/warranty", "/contacts"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProductSlugs().catch(() => []);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "/catalog" ? "daily" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map(({ slug }) => ({
    url: `${SITE_URL}/product/${slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}

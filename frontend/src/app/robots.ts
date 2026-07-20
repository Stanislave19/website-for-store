import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /catalog НЕ заборонено навмисно — сторінки з фільтрами мають власний
      // noindex у мета-тегах (див. app/catalog/page.tsx), а щоб Google міг
      // побачити цей тег, йому спершу треба дозволити відкрити сторінку.
      // Заборона тут зробила б протилежне: Google не зміг би прочитати noindex.
      disallow: ["/admin", "/cart", "/checkout", "/order-success"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

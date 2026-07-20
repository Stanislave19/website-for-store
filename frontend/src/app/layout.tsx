import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";

import { SearchOverlayProvider } from "@/components/layout/SearchOverlay";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { ToastProvider } from "@/components/ui/ToastProvider";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin", "latin-ext"],
  // 600 — виняток лише для заголовків груп фільтрів (службовий UI, не контент)
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "LEROM Watch Co. — Наручні годинники",
  description:
    "Інтернет-магазин наручних годинників LEROM. Класика, що переживе моду.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={`${fraunces.variable} ${workSans.variable}`}>
      <body suppressHydrationWarning>
        <ToastProvider>
          <SearchOverlayProvider>
            <SiteChrome>{children}</SiteChrome>
          </SearchOverlayProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

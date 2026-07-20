import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Список бажань — LEROM Watch Co.",
  robots: { index: false, follow: true },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}

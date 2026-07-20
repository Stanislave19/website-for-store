import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Оформлення замовлення — LEROM Watch Co.",
  robots: { index: false, follow: true },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}

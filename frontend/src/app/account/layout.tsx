import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Кабінет — LEROM Watch Co.",
  robots: { index: false, follow: true },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}

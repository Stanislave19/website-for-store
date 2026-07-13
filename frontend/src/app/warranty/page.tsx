import type { Metadata } from "next";
import { Package, RefreshCw, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Гарантія — LEROM Watch Co.",
  description: "Умови гарантії, повернення й обміну товарів у LEROM Watch Co.",
};

const SECTIONS = [
  {
    icon: Shield,
    title: "Гарантія 24 місяці",
    text: "Офіційна гарантія виробника покриває механізм, корпус і скло за умов належної експлуатації. Гарантійний талон видається разом із товаром.",
  },
  {
    icon: RefreshCw,
    title: "Повернення та обмін",
    text: "Товар можна повернути або обміняти протягом 14 днів з моменту отримання, якщо він не був у використанні та зберіг товарний вигляд, упаковку й комплектацію.",
  },
  {
    icon: Package,
    title: "Комплектація",
    text: "Кожен годинник постачається у фірмовій коробці з гарантійним талоном та інструкцією з експлуатації.",
  },
];

export default function WarrantyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 md:px-14">
      <h1 className="mb-8 font-serif text-4xl font-medium text-ink">Гарантія</h1>
      <div className="flex flex-col gap-6">
        {SECTIONS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-[3px] border border-edge bg-white p-6">
            <Icon size={24} className="mb-3 text-brass" />
            <h2 className="mb-2 font-serif text-lg font-medium text-ink">{title}</h2>
            <p className="font-sans text-[15px] leading-relaxed text-leather">{text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

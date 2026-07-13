import { CheckCircle, MessageSquare, Shield, Truck } from "lucide-react";

const BADGES = [
  { icon: CheckCircle, text: "Оригінальний товар" },
  { icon: Shield, text: "Гарантія 24 місяці" },
  { icon: Truck, text: "Доставка Новою Поштою" },
  { icon: MessageSquare, text: "Консультація менеджера" },
];

export function TrustBadges() {
  return (
    <div className="flex flex-col flex-wrap items-start gap-6 border-t border-edge bg-cream px-6 py-6 sm:flex-row sm:items-center sm:justify-between md:px-14">
      {BADGES.map(({ icon: Icon, text }, index) => (
        <div
          key={text}
          className={`flex items-center gap-2 sm:pl-6 ${
            index > 0 ? "sm:border-l sm:border-edge" : ""
          }`}
        >
          <Icon size={20} className="text-brass" />
          <span className="font-sans text-sm text-ink">{text}</span>
        </div>
      ))}
    </div>
  );
}

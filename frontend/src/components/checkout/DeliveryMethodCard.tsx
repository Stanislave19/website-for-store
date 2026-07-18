import type { LucideIcon } from "lucide-react";

interface DeliveryMethodCardProps {
  label: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: () => void;
}

export function DeliveryMethodCard({ label, icon: Icon, selected, onSelect }: DeliveryMethodCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-center gap-3 rounded-[3px] border px-4 py-3.5 text-left transition-colors ${
        selected ? "border-2 border-racing bg-racing/5" : "border-edge bg-white hover:border-brass"
      }`}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
          selected ? "border-racing" : "border-edge"
        }`}
      >
        {selected ? <span className="h-2 w-2 rounded-full bg-racing" /> : null}
      </span>
      <Icon size={18} className="shrink-0 text-leather" />
      <span className="font-sans text-[15px] text-ink">{label}</span>
    </button>
  );
}

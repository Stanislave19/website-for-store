import { Check } from "lucide-react";
import Link from "next/link";

interface OnSaleFilterProps {
  href: string;
  active: boolean;
  count: number;
}

export function OnSaleFilter({ href, active, count }: OnSaleFilterProps) {
  return (
    <Link href={href} className="flex w-fit items-center gap-2 font-sans text-[13px] text-ink">
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border ${
          active ? "border-racing bg-racing" : "border-edge bg-white"
        }`}
      >
        {active ? <Check size={12} className="text-cream" /> : null}
      </span>
      Тільки зі знижками
      <span className="text-brass">({count})</span>
    </Link>
  );
}

import { X } from "lucide-react";
import Link from "next/link";

interface FilterTagProps {
  href: string;
  label: string;
  count?: number;
  active: boolean;
}

export function FilterTag({ href, label, count, active }: FilterTagProps) {
  if (active) {
    return (
      <Link
        href={href}
        className="flex items-center gap-1.5 rounded-[3px] bg-racing px-3.5 py-[7px] font-sans text-[13px] text-cream"
      >
        {label}
        <X size={13} />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="rounded-[3px] border border-edge bg-white px-3.5 py-[7px] font-sans text-[13px] text-ink transition-colors hover:border-brass"
    >
      {label}
      {count !== undefined ? <span className="text-brass"> ({count})</span> : null}
    </Link>
  );
}

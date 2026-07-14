import { HOUR_TICK_ANGLES, MINOR_TICK_ANGLES, polar } from "@/lib/dial";

export function HeroDial() {
  return (
    <div className="relative flex aspect-4/3 items-center justify-center border border-white/10">
      <svg viewBox="0 0 200 200" className="h-[62%] w-[62%] text-white/25" fill="none">
        <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="1" />
        <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1" opacity="0.6" />

        {HOUR_TICK_ANGLES.map((angle) => {
          const outer = polar(92, angle);
          const inner = polar(79, angle);
          return (
            <line
              key={`hour-${angle}`}
              x1={outer.x}
              y1={outer.y}
              x2={inner.x}
              y2={inner.y}
              stroke="currentColor"
              strokeWidth="1.5"
            />
          );
        })}
        {MINOR_TICK_ANGLES.map((angle) => {
          const outer = polar(92, angle);
          const inner = polar(87, angle);
          return (
            <line
              key={`minor-${angle}`}
              x1={outer.x}
              y1={outer.y}
              x2={inner.x}
              y2={inner.y}
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.6"
            />
          );
        })}

        <line
          x1="100"
          y1="100"
          x2="100"
          y2="26"
          stroke="var(--color-brass)"
          strokeWidth="2"
          strokeLinecap="round"
          className="animate-hero-sweep origin-[100px_100px]"
        />
        <circle cx="100" cy="100" r="3.5" fill="var(--color-brass)" />
      </svg>
    </div>
  );
}

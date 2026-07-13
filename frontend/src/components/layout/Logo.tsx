interface LogoProps {
  variant?: "cream" | "racing";
}

export function Logo({ variant = "cream" }: LogoProps) {
  const textColor = variant === "cream" ? "text-ink" : "text-cream";
  const circleBorder = variant === "racing" ? "border border-brass" : "";

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full bg-racing text-cream ${circleBorder}`}
      >
        <span className="font-serif text-[9px] tracking-wide">LEROM</span>
        <span className="my-0.5 h-px w-5 bg-cream/50" />
        <span className="text-[5px] tracking-wider">WATCH CO.</span>
      </div>
      <span className={`font-serif text-[22px] font-medium ${textColor}`}>LEROM</span>
    </div>
  );
}

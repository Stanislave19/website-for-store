export function PlaceholderImage({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative flex aspect-square items-center justify-center bg-[repeating-linear-gradient(45deg,var(--color-edge)_0,var(--color-edge)_1px,transparent_1px,transparent_10px)] ${className}`}
    >
      <span className="rounded-sm border border-edge bg-cream px-3 py-1 font-sans text-xs text-brass">
        фото годинника
      </span>
    </div>
  );
}

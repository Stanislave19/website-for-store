export default function CatalogLoading() {
  return (
    <main className="w-full px-6 py-10 md:px-14">
      <div className="mb-6 h-4 w-32 animate-pulse rounded-sm bg-edge/40" />
      <div className="mb-8 h-9 w-64 animate-pulse rounded-sm bg-edge/40" />

      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="hidden w-[260px] shrink-0 flex-col gap-6 lg:flex">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-sm bg-edge/40" />
          ))}
        </div>

        <div className="flex-1">
          <div className="mb-6 flex justify-end">
            <div className="h-11 w-40 animate-pulse rounded-[3px] bg-edge/40" />
          </div>
          <div className="grid grid-cols-2 border-t border-l border-edge lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="flex flex-col gap-3 border-r border-b border-edge p-3 sm:p-5">
                <div className="aspect-square animate-pulse bg-edge/40" />
                <div className="h-4 w-3/4 animate-pulse rounded-sm bg-edge/40" />
                <div className="h-5 w-1/2 animate-pulse rounded-sm bg-edge/40" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

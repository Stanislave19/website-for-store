export default function ProductLoading() {
  return (
    <main className="w-full px-6 py-8 md:px-14">
      <div className="mb-6 h-4 w-56 animate-pulse rounded-sm bg-edge/40" />

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="aspect-square animate-pulse border border-edge bg-edge/40" />

        <div className="flex flex-col gap-4">
          <div className="h-4 w-24 animate-pulse rounded-sm bg-edge/40" />
          <div className="h-9 w-3/4 animate-pulse rounded-sm bg-edge/40" />
          <div className="h-4 w-32 animate-pulse rounded-sm bg-edge/40" />
          <div className="h-8 w-40 animate-pulse rounded-sm bg-edge/40" />
          <div className="h-24 animate-pulse rounded-sm bg-edge/40" />
          <div className="h-14 w-full animate-pulse rounded-[3px] bg-edge/40" />
        </div>
      </div>
    </main>
  );
}

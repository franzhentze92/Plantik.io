export default function PlantDetailLoading() {
  return (
    <div className="container-app py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="h-[420px] w-full animate-pulse rounded-xl2 bg-brand-beige/50" />

        <div className="space-y-4">
          <div className="h-3 w-20 animate-pulse rounded bg-brand-beige/60" />
          <div className="h-8 w-2/3 animate-pulse rounded bg-brand-beige/60" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-brand-beige/40" />
          <div className="h-4 w-full animate-pulse rounded bg-brand-beige/40" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-brand-beige/40" />
          <div className="h-7 w-24 animate-pulse rounded bg-brand-beige/60" />

          <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl2 bg-brand-beige/40"
              />
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <div className="h-11 w-40 animate-pulse rounded-full bg-brand-beige/60" />
            <div className="h-11 w-48 animate-pulse rounded-full bg-brand-beige/40" />
          </div>
        </div>
      </div>
    </div>
  );
}

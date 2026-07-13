export default function CatalogLoading() {
  return (
    <div className="container-app py-10">
      <div className="h-3 w-24 animate-pulse rounded bg-brand-beige/60" />
      <div className="mt-3 h-9 w-64 animate-pulse rounded bg-brand-beige/60" />
      <div className="mt-3 h-4 w-72 animate-pulse rounded bg-brand-beige/40" />

      <div className="mt-6 flex gap-2 border-b border-brand-beige pb-2">
        <div className="h-6 w-20 animate-pulse rounded bg-brand-beige/50" />
        <div className="h-6 w-20 animate-pulse rounded bg-brand-beige/40" />
      </div>

      <div className="mt-6 h-14 w-full animate-pulse rounded-xl2 bg-brand-beige/40" />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card-surface overflow-hidden">
            <div className="h-44 w-full animate-pulse bg-brand-beige/50" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-brand-beige/50" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-brand-beige/40" />
              <div className="mt-3 flex justify-between">
                <div className="h-4 w-12 animate-pulse rounded bg-brand-beige/50" />
                <div className="h-3 w-16 animate-pulse rounded bg-brand-beige/40" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

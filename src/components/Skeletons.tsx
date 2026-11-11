export function MenuCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-sand-border overflow-hidden animate-pulse">
      <div className="h-44 bg-cream-warm" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-24 bg-cream-warm rounded" />
        <div className="h-5 w-3/4 bg-cream-warm rounded" />
        <div className="h-3.5 w-full bg-cream-warm rounded" />
        <div className="h-3.5 w-2/3 bg-cream-warm rounded" />
        <div className="pt-2 flex items-center justify-between">
          <div className="h-6 w-16 bg-cream-warm rounded" />
          <div className="h-9 w-24 bg-cream-warm rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function OutletCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-sand-border overflow-hidden animate-pulse">
      <div className="h-48 bg-cream-warm" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 bg-cream-warm rounded" />
        <div className="h-4 w-full bg-cream-warm rounded" />
        <div className="h-4 w-1/2 bg-cream-warm rounded" />
        <div className="pt-2 flex gap-2">
          <div className="h-9 flex-1 bg-cream-warm rounded-xl" />
          <div className="h-9 flex-1 bg-cream-warm rounded-xl" />
        </div>
      </div>
    </div>
  );
}


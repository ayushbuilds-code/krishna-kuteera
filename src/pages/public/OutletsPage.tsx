import { useMemo, useState } from 'react';
import { LocateFixed, Search } from 'lucide-react';
import { BRAND } from '@/config/brand';
import { useOutlet } from '@/context/OutletContext';
import { SeoHead } from '@/components/SeoHead';
import { OutletCard } from '@/components/OutletCard';
import { OutletCardSkeleton } from '@/components/Skeletons';

export function OutletsPage() {
  const {
    outlets,
    selectedOutlet,
    loadingOutlets,
    selectOutletBySlug,
    distancesByOutletId,
    geoLoading,
    geoError,
    locateNearestOutlet,
  } = useOutlet();

  const [query, setQuery] = useState('');
  const [amenityFilter, setAmenityFilter] = useState<'all' | 'ac' | 'outdoor' | 'bakery'>('all');

  const filteredOutlets = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = outlets.filter((o) => {
      const matchesText =
        !q ||
        o.name.toLowerCase().includes(q) ||
        o.locality.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q) ||
        o.pincode.includes(q);

      const matchesAmenity =
        amenityFilter === 'all' ||
        (amenityFilter === 'ac' && o.seating_ac) ||
        (amenityFilter === 'outdoor' && o.seating_outdoor) ||
        (amenityFilter === 'bakery' && o.has_bakery_counter);

      return matchesText && matchesAmenity;
    });

    if (Object.keys(distancesByOutletId).length > 0) {
      return [...list].sort(
        (a, b) =>
          (distancesByOutletId[a.id] ?? Number.POSITIVE_INFINITY) -
          (distancesByOutletId[b.id] ?? Number.POSITIVE_INFINITY)
      );
    }
    return list;
  }, [amenityFilter, distancesByOutletId, outlets, query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <SeoHead
        title="Bengaluru Outlets & Timings"
        description="Find Krishna Kuteera outlets in Hulimavu (Bannerghatta Road), JP Nagar 7th Phase, and Jayanagar 4th Block with Google Maps, seating & parking info."
        canonicalPath="/outlets"
      />
      <header className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-banana">
          Bengaluru Locations
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ink">
          {BRAND.name} Outlets
        </h1>
        <p className="text-ink-muted max-w-2xl text-sm sm:text-base leading-relaxed">
          Each outlet maintains its own opening hours, seating zones, and local kitchen menu.
          Pick your nearest branch for live availability and pickup/delivery pricing.
        </p>
      </header>

      {/* Search & Nearest Outlet Bar */}
      <div className="rounded-3xl card-surface p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by locality, Bannerghatta, JP Nagar, pincode…"
            aria-label="Search outlets by locality or pincode"
            className="w-full rounded-full border border-ink/10 bg-cream pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/25 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'all', label: 'All Outlets' },
              { id: 'ac', label: 'AC Dining' },
              { id: 'outdoor', label: 'Outdoor Seating' },
              ...(BRAND.features.enableBakerySection
                ? [{ id: 'bakery', label: 'KK Bakers' } as const]
                : []),
            ] as const
          ).map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setAmenityFilter(chip.id)}
              className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                amenityFilter === chip.id
                  ? 'bg-ink text-white'
                  : 'bg-cream text-ink-muted hover:text-ink hover:bg-cream-warm'
              }`}
            >
              {chip.label}
            </button>
          ))}

          <button
            type="button"
            onClick={locateNearestOutlet}
            disabled={geoLoading}
            className="inline-flex items-center gap-1.5 rounded-full bg-banana hover:bg-banana-dark text-white px-4 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            {geoLoading ? 'Locating…' : 'Nearest to Me'}
          </button>
        </div>
      </div>

      {geoError && (
        <div className="rounded-xl bg-turmeric-soft border border-turmeric/40 px-4 py-3 text-xs sm:text-sm text-ink">
          {geoError}
        </div>
      )}

      {loadingOutlets ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <OutletCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredOutlets.length === 0 ? (
        <div className="rounded-2xl bg-white border border-sand-border p-10 text-center space-y-3">
          <p className="font-serif text-xl font-bold text-ink">No matching outlets found</p>
          <p className="text-sm text-ink-muted">
            Try clearing your search or amenity filter to see all Bengaluru branches.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setAmenityFilter('all');
            }}
            className="rounded-xl bg-kumkum text-white px-4 py-2 text-xs font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOutlets.map((outlet) => (
            <OutletCard
              key={outlet.id}
              outlet={outlet}
              distanceKm={distancesByOutletId[outlet.id]}
              isSelected={selectedOutlet?.id === outlet.id}
              onSelect={(o) => selectOutletBySlug(o.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}


import { Link } from 'react-router-dom';
import {
  Car,
  Clock,
  MapPin,
  Navigation,
  Phone,
  Utensils,
} from 'lucide-react';
import { BRAND, formatTime12h } from '@/config/brand';
import { isOutletOpenNow } from '@/services/restaurantData';
import type { Outlet } from '@/types/database';

interface OutletCardProps {
  outlet: Outlet;
  distanceKm?: number;
  isSelected?: boolean;
  onSelect?: (outlet: Outlet) => void;
}

export function OutletCard({
  outlet,
  distanceKm,
  isSelected = false,
  onSelect,
}: OutletCardProps) {
  const openNow = isOutletOpenNow(outlet);

  return (
    <article
      className={`group rounded-3xl card-surface card-surface-hover overflow-hidden flex flex-col ${
        isSelected ? 'ring-2 ring-kumkum/35 border-kumkum/40' : ''
      }`}
    >
      <div className="relative h-48 w-full overflow-hidden bg-cream-warm">
        <img
          src={outlet.image_url || BRAND.placeholders.defaultOutletImage}
          alt={outlet.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold backdrop-blur-md shadow-xs ${
              openNow
                ? 'bg-white/95 text-banana-dark'
                : 'bg-ink/85 text-white'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                openNow ? 'bg-banana animate-pulse' : 'bg-white/60'
              }`}
            />
            {openNow ? 'Open Now' : 'Closed'}
          </span>
          {distanceKm !== undefined && (
            <span className="rounded-full bg-turmeric text-ink px-3 py-1 text-[11px] font-bold shadow-xs tabular-nums">
              {distanceKm} km away
            </span>
          )}
        </div>

        {outlet.has_bakery_counter && BRAND.features.enableBakerySection && (
          <span className="absolute bottom-3 right-3 rounded-full bg-white/95 backdrop-blur-md text-wood px-3 py-1 text-[11px] font-semibold shadow-xs">
            KK Bakers Counter
          </span>
        )}
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-banana">
              {outlet.locality}
            </p>
            <h3 className="font-serif text-xl font-bold text-ink mt-0.5">
              {outlet.name}
            </h3>
          </div>

          <p className="text-sm text-ink-muted flex items-start gap-2 leading-snug">
            <MapPin className="w-4 h-4 text-kumkum shrink-0 mt-0.5" />
            <span>
              {outlet.address} — {outlet.pincode}
            </span>
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1.5 font-medium text-ink">
              <Clock className="w-3.5 h-3.5 text-turmeric-dark" />
              {formatTime12h(outlet.opening_time)} – {formatTime12h(outlet.closing_time)}
            </span>
            <a
              href={`tel:${outlet.phone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-1.5 font-medium text-kumkum hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              {outlet.phone}
            </a>
          </div>

          {/* Seating & Parking Pills */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {outlet.seating_ac && (
              <span className="rounded-full bg-cream-warm px-2.5 py-0.5 text-[11px] font-medium text-ink">
                AC Dining
              </span>
            )}
            {outlet.seating_non_ac && (
              <span className="rounded-full bg-cream-warm px-2.5 py-0.5 text-[11px] font-medium text-ink">
                Non-AC Hall
              </span>
            )}
            {outlet.seating_outdoor && (
              <span className="rounded-full bg-banana-soft px-2.5 py-0.5 text-[11px] font-medium text-banana-dark">
                Outdoor Seating
              </span>
            )}
            {outlet.parking_info && (
              <span className="inline-flex items-center gap-1 rounded-full bg-cream-warm px-2.5 py-0.5 text-[11px] font-medium text-ink-muted">
                <Car className="w-3 h-3" />
                Parking
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3.5 border-t border-ink/6 flex items-center gap-2">
          <Link
            to={`/menu?outlet=${outlet.slug}`}
            onClick={() => onSelect?.(outlet)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-kumkum text-white px-4 py-2.5 text-xs sm:text-[13px] font-semibold hover:bg-kumkum-dark transition-colors shadow-xs"
          >
            <Utensils className="w-3.5 h-3.5" />
            View Menu
          </Link>
          {outlet.maps_directions_url && (
            <a
              href={outlet.maps_directions_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 rounded-full border border-ink/12 bg-cream px-3.5 py-2.5 text-xs font-semibold text-ink hover:bg-cream-warm transition-colors"
              title="Get Google Maps directions"
            >
              <Navigation className="w-3.5 h-3.5 text-banana" />
              Map
            </a>
          )}
          <Link
            to={`/outlets/${outlet.slug}`}
            className="inline-flex items-center justify-center rounded-full border border-ink/12 bg-white px-3.5 py-2.5 text-xs font-semibold text-kumkum hover:bg-kumkum-soft transition-colors"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}

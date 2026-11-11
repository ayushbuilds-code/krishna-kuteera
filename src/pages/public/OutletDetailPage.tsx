import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarCheck,
  Car,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Phone,
  Utensils,
} from 'lucide-react';
import { BRAND, formatTime12h } from '@/config/brand';
import { useOutlet } from '@/context/OutletContext';
import { fetchOutletBySlug, isOutletOpenNow } from '@/services/restaurantData';
import { PureVegBadge } from '@/components/PureVegBadge';
import type { Outlet } from '@/types/database';

export function OutletDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { outlets, selectOutletBySlug } = useOutlet();
  const [outlet, setOutlet] = useState<Outlet | null>(() =>
    outlets.find((o) => o.slug === slug) ?? null
  );
  const [loading, setLoading] = useState(!outlet);

  useEffect(() => {
    let active = true;
    if (!slug) return;
    (async () => {
      setLoading(true);
      const found = await fetchOutletBySlug(slug);
      if (!active) return;
      setOutlet(found);
      if (found) selectOutletBySlug(found.slug);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [slug, selectOutletBySlug]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-cream-warm rounded" />
        <div className="h-72 bg-cream-warm rounded-2xl" />
      </div>
    );
  }

  if (!outlet) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center space-y-4">
        <h1 className="font-serif text-3xl font-bold text-kumkum">Outlet Not Found</h1>
        <p className="text-ink-muted">
          We couldn&apos;t find that Krishna Kuteera location. Please browse our active Bengaluru outlets.
        </p>
        <Link
          to="/outlets"
          className="inline-flex items-center gap-2 rounded-xl bg-kumkum text-white px-5 py-2.5 text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Outlets
        </Link>
      </div>
    );
  }

  const openNow = isOutletOpenNow(outlet);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: outlet.name,
    servesCuisine: ['South Indian', 'Vegetarian', 'Udupi', 'Karnataka Tiffin'],
    priceRange: '₹',
    telephone: outlet.phone,
    email: outlet.email || BRAND.contact.email,
    image: outlet.image_url || BRAND.placeholders.defaultOutletImage,
    address: {
      '@type': 'PostalAddress',
      streetAddress: outlet.address,
      addressLocality: outlet.city,
      addressRegion: 'KA',
      postalCode: outlet.pincode,
      addressCountry: 'IN',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: outlet.opening_time.slice(0, 5),
        closes: outlet.closing_time.slice(0, 5),
      },
    ],
    hasMenu: `${import.meta.env.VITE_SITE_URL || ''}/menu?outlet=${outlet.slug}`,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        to="/outlets"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-kumkum hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        All Bengaluru Outlets
      </Link>

      {/* Outlet Hero Banner */}
      <section className="rounded-3xl bg-white border border-sand-border overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 h-64 lg:h-auto bg-cream-warm relative">
          <img
            src={outlet.image_url || BRAND.placeholders.defaultOutletImage}
            alt={outlet.name}
            className="h-full w-full object-cover"
          />
          <span
            className={`absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-bold shadow ${
              openNow ? 'bg-banana text-white' : 'bg-ink/85 text-white'
            }`}
          >
            {openNow ? 'Open Now' : 'Currently Closed'}
          </span>
        </div>

        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-banana">
                {outlet.locality}
              </span>
              <PureVegBadge label="100% Pure Veg" />
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-ink">
              {outlet.name}
            </h1>

            <div className="space-y-2.5 text-sm text-ink-muted">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-kumkum shrink-0 mt-0.5" />
                <span>
                  {outlet.address}, {outlet.city} — {outlet.pincode}
                </span>
              </p>
              <p className="flex items-center gap-2.5 text-ink font-medium">
                <Clock className="w-4 h-4 text-turmeric-dark shrink-0" />
                Daily Hours: {formatTime12h(outlet.opening_time)} –{' '}
                {formatTime12h(outlet.closing_time)}
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-banana shrink-0" />
                <a
                  href={`tel:${outlet.phone.replace(/\s+/g, '')}`}
                  className="font-semibold text-kumkum hover:underline"
                >
                  {outlet.phone}
                </a>
              </p>
              {outlet.parking_info && (
                <p className="flex items-start gap-2.5">
                  <Car className="w-4 h-4 text-wood shrink-0 mt-0.5" />
                  <span>{outlet.parking_info}</span>
                </p>
              )}
            </div>

            {/* Seating Info */}
            <div className="pt-2 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Seating &amp; Amenities ({outlet.total_tables} tables)
              </p>
              <div className="flex flex-wrap gap-2">
                {outlet.seating_ac && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-cream-warm px-3 py-1.5 text-xs font-semibold text-ink">
                    <CheckCircle2 className="w-3.5 h-3.5 text-banana" />
                    AC Family Dining
                  </span>
                )}
                {outlet.seating_non_ac && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-cream-warm px-3 py-1.5 text-xs font-semibold text-ink">
                    <CheckCircle2 className="w-3.5 h-3.5 text-banana" />
                    Non-AC Quick Tiffin Hall
                  </span>
                )}
                {outlet.seating_outdoor && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-banana-soft px-3 py-1.5 text-xs font-semibold text-banana-dark">
                    <CheckCircle2 className="w-3.5 h-3.5 text-banana" />
                    Outdoor Garden Seating
                  </span>
                )}
                {outlet.has_bakery_counter && BRAND.features.enableBakerySection && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-turmeric-soft px-3 py-1.5 text-xs font-semibold text-wood">
                    <CheckCircle2 className="w-3.5 h-3.5 text-turmeric-dark" />
                    KK Bakers Counter
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-sand-border">
            <Link
              to={`/menu?outlet=${outlet.slug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-kumkum hover:bg-kumkum-dark text-white px-5 py-3 text-sm font-bold shadow-xs transition-colors"
            >
              <Utensils className="w-4 h-4" />
              View Outlet Menu &amp; Order
            </Link>
            <Link
              to={`/reserve?outlet=${outlet.slug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-turmeric hover:bg-turmeric-dark text-ink px-5 py-3 text-sm font-bold transition-colors"
            >
              <CalendarCheck className="w-4 h-4" />
              Book a Table
            </Link>
            {outlet.maps_directions_url && (
              <a
                href={outlet.maps_directions_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-sand-border bg-cream hover:bg-cream-warm text-ink px-4 py-3 text-sm font-semibold transition-colors"
              >
                <Navigation className="w-4 h-4 text-banana" />
                Get Directions
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Google Maps Embed */}
      {outlet.maps_embed_url && (
        <section className="rounded-3xl bg-white border border-sand-border overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-sand-border flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-ink">
              Location Map — {outlet.locality}
            </h2>
            {outlet.maps_directions_url && (
              <a
                href={outlet.maps_directions_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-bold text-kumkum hover:underline"
              >
                Open in Google Maps →
              </a>
            )}
          </div>
          <div className="h-80 w-full bg-cream-warm">
            <iframe
              title={`Google Map for ${outlet.name}`}
              src={outlet.maps_embed_url}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>
      )}
    </div>
  );
}


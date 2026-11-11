import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CalendarCheck,
  Coffee,
  Flame,
  Leaf,
  LocateFixed,
  MapPin,
  ShoppingBag,
  Sparkles,
  Star,
  UtensilsCrossed,
} from 'lucide-react';
import { BRAND } from '@/config/brand';
import { useOutlet } from '@/context/OutletContext';
import { useCart } from '@/context/CartContext';
import {
  fetchFeaturedReviews,
  fetchOutletMenu,
} from '@/services/restaurantData';
import { MOCK_GALLERY_PHOTOS } from '@/data/mockSeed';
import { PureVegBadge } from '@/components/PureVegBadge';
import { SeoHead } from '@/components/SeoHead';
import { MenuItemCard } from '@/components/MenuItemCard';
import { OutletCard } from '@/components/OutletCard';
import { MenuCardSkeleton, OutletCardSkeleton } from '@/components/Skeletons';
import type { OutletMenuItem, Review } from '@/types/database';

const QUICK_CATEGORIES = [
  { slug: 'breakfast', label: 'Breakfast & Dosas', tag: '7:30 AM+' },
  { slug: 'meals', label: 'Banana-Leaf Meals', tag: 'Lunch' },
  { slug: 'tiffins', label: 'Evening Tiffins', tag: '4:00 PM+' },
  { slug: 'chaats', label: 'Fresh Chaats', tag: 'Popular' },
  { slug: 'beverages', label: 'Filter Coffee', tag: 'Brass Davara' },
  { slug: 'sweets', label: 'Pure Ghee Sweets', tag: 'Festive' },
  ...(BRAND.features.enableBakerySection
    ? [{ slug: 'bakery', label: 'KK Bakers', tag: 'Eggless' }]
    : []),
];

const CRAFT_PILLARS = [
  {
    icon: Leaf,
    title: '100% Pure Vegetarian',
    detail: 'Zero cross-contamination kitchens with Jain & no-onion-garlic choices.',
  },
  {
    icon: Flame,
    title: 'Stone-Ground Daily',
    detail: 'Naturally fermented idli & crispy benne dosa batters prepared fresh every morning.',
  },
  {
    icon: Coffee,
    title: 'Chikmagalur Peaberry',
    detail: 'Slow-dripped decoction poured frothy in traditional brass davara-tumblers.',
  },
  {
    icon: Award,
    title: 'Pure Nandini Ghee',
    detail: 'Authentic Karnataka flavour in every roast, kesari bath, and festive sweet.',
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const {
    outlets,
    selectedOutlet,
    loadingOutlets,
    selectOutletBySlug,
    distancesByOutletId,
    nearestOutlet,
    geoLoading,
    geoError,
    locateNearestOutlet,
    siteContent,
  } = useOutlet();

  const {
    items: cartItems,
    addItem,
    updateQuantity,
    getItemQuantity,
  } = useCart();

  const [menuItems, setMenuItems] = useState<OutletMenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingMenu(true);
      const outletId = selectedOutlet?.id || outlets[0]?.id;
      if (!outletId) {
        setLoadingMenu(false);
        return;
      }
      const [{ items }, reviewRows] = await Promise.all([
        fetchOutletMenu(outletId),
        fetchFeaturedReviews(),
      ]);
      if (!active) return;
      setMenuItems(items);
      setReviews(reviewRows);
      setLoadingMenu(false);
    })();
    return () => {
      active = false;
    };
  }, [selectedOutlet?.id, outlets]);

  const heroContent = siteContent['hero_banner'];
  const specialContent = siteContent['todays_special_note'];

  const todaysSpecials = menuItems
    .filter((i) => i.is_todays_special && i.is_available)
    .slice(0, 3);
  const popularDishes = menuItems
    .filter((i) => i.is_bestseller && i.is_available)
    .slice(0, 6);

  const handleFindNearestBreakfast = async () => {
    const closest = await locateNearestOutlet();
    if (closest) {
      navigate(`/menu?outlet=${closest.slug}&category=breakfast`);
    }
  };

  const handleQuickAdd = (item: OutletMenuItem) => {
    const activeOutlet = selectedOutlet || outlets[0];
    if (!activeOutlet) return;
    addItem(item, {
      id: activeOutlet.id,
      slug: activeOutlet.slug,
      name: activeOutlet.name,
    });
  };

  const handleDecrease = (item: OutletMenuItem) => {
    const line = cartItems.find((l) => l.item.id === item.id);
    if (line) updateQuantity(line.key, line.quantity - 1);
  };

  const orgJsonLd = outlets.map((o) => ({
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: o.name,
    servesCuisine: ['South Indian', 'Pure Vegetarian', 'Karnataka Tiffin'],
    telephone: o.phone,
    priceRange: '₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: o.address,
      addressLocality: o.city,
      addressRegion: 'KA',
      postalCode: o.pincode,
      addressCountry: 'IN',
    },
  }));

  return (
    <div className="space-y-16 sm:space-y-24">
      <SeoHead
        title={`${BRAND.name} — Pure Vegetarian South Indian Restaurant in Bengaluru`}
        description="Crispy benne dosas, steaming idlis, brass-davara filter coffee & banana-leaf meals across Hulimavu (Bannerghatta Rd), JP Nagar & Jayanagar."
        canonicalPath="/"
        jsonLd={orgJsonLd}
      />

      {/* 1. MODERN EDITORIAL SPLIT HERO */}
      <section className="relative overflow-hidden bg-cream pt-8 pb-12 sm:pt-14 sm:pb-18">
        {/* Soft ambient warm radial wash */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 w-[620px] h-[620px] rounded-full bg-turmeric/12 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 -left-24 w-[420px] h-[420px] rounded-full bg-kumkum/6 blur-3xl"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Copy Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white border border-ink/8 px-3.5 py-1.5 shadow-2xs">
                <PureVegBadge label="100% Pure Vegetarian" />
              </div>
              <span
                className="text-xs sm:text-sm font-semibold text-kumkum tracking-wide"
                style={{ fontFamily: BRAND.fonts.kannada }}
              >
                {BRAND.kannadaName} • Namma Bengaluru
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.4rem] font-bold leading-[1.08] tracking-tight text-ink">
              {heroContent?.title || BRAND.tagline}
            </h1>

            <p className="text-ink-muted text-base sm:text-lg max-w-xl leading-relaxed">
              {heroContent?.body || BRAND.subTagline}
            </p>

            {/* Primary Pill CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to={`/menu${selectedOutlet ? `?outlet=${selectedOutlet.slug}` : ''}`}
                className="group inline-flex items-center gap-2.5 rounded-full bg-kumkum hover:bg-kumkum-dark text-white px-6 py-3.5 text-sm sm:text-base font-semibold shadow-md shadow-kumkum/15 transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-turmeric" />
                Order Now
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to={`/reserve${selectedOutlet ? `?outlet=${selectedOutlet.slug}` : ''}`}
                className="inline-flex items-center gap-2 rounded-full bg-white hover:bg-cream-warm border border-ink/12 text-ink px-6 py-3.5 text-sm sm:text-base font-semibold shadow-2xs transition-colors"
              >
                <CalendarCheck className="w-4 h-4 text-banana" />
                Book a Table
              </Link>
            </div>

            {/* Sleek Unified 2-Tap "Dosa Near Me" Quick Bar */}
            <div className="pt-2">
              <div className="rounded-2xl bg-white border border-ink/8 p-3.5 shadow-[0_8px_30px_rgba(29,21,18,0.05)] space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    <Coffee className="w-3.5 h-3.5 text-kumkum" />
                    2-Tap Breakfast Shortcut
                  </span>
                  <button
                    type="button"
                    onClick={handleFindNearestBreakfast}
                    disabled={geoLoading}
                    className="inline-flex items-center gap-1.5 rounded-full bg-banana hover:bg-banana-dark text-white px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <LocateFixed className="w-3.5 h-3.5" />
                    {geoLoading ? 'Locating…' : 'Nearest Breakfast'}
                  </button>
                </div>

                {geoError && (
                  <p className="text-xs text-kumkum">{geoError}</p>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {outlets.map((outlet) => (
                    <Link
                      key={outlet.id}
                      to={`/menu?outlet=${outlet.slug}&category=breakfast`}
                      onClick={() => selectOutletBySlug(outlet.slug)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-cream hover:bg-turmeric-soft border border-ink/8 text-ink px-3 py-1.5 text-xs font-semibold transition-colors"
                    >
                      <MapPin className="w-3 h-3 text-kumkum" />
                      {outlet.locality}
                      <ArrowRight className="w-3 h-3 text-ink-muted" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Editorial Photography */}
          <div className="lg:col-span-6">
            <div className="relative">
              <div className="relative rounded-3xl sm:rounded-[2rem] overflow-hidden shadow-[0_24px_60px_-15px_rgba(29,21,18,0.22)] bg-cream-warm aspect-[16/11] sm:aspect-[4/3] lg:aspect-[5/4]">
                {/* TODO: Replace with authentic hero photo of Krishna Kuteera Benne Masala Dosa & Filter Coffee */}
                <img
                  src={BRAND.placeholders.heroImage}
                  alt="Crispy South Indian Masala Dosa with coconut chutney and sambar at Krishna Kuteera"
                  className="w-full h-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                {/* Floating Rating Pill */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 rounded-full bg-white/95 backdrop-blur-md px-3 py-1 sm:px-3.5 sm:py-1.5 shadow-sm flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-ink">
                  <Star className="w-3.5 h-3.5 fill-turmeric text-turmeric" />
                  <span>4.8 Rated</span>
                  <span className="hidden xs:inline text-ink-muted">• Fresh from 7:30 AM</span>
                </div>

                {/* Bottom Frosted Featured Card */}
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 rounded-2xl bg-white/94 backdrop-blur-md text-ink p-3 sm:p-4 shadow-lg flex items-center justify-between gap-3 sm:gap-4 border border-white/60">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] text-kumkum">
                      Morning Signature
                    </p>
                    <p className="font-serif text-sm sm:text-lg font-bold text-ink truncate">
                      Benne Masala Dosa &amp; Filter Coffee
                    </p>
                  </div>
                  <Link
                    to="/menu?category=breakfast"
                    className="shrink-0 rounded-full bg-kumkum hover:bg-kumkum-dark text-white px-4 py-2 text-xs font-semibold transition-colors shadow-xs"
                  >
                    Order
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1B. QUICK CATEGORY STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-10">
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-2">
          {QUICK_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/menu?category=${cat.slug}${
                selectedOutlet ? `&outlet=${selectedOutlet.slug}` : ''
              }`}
              className="shrink-0 group rounded-2xl bg-white border border-ink/8 hover:border-kumkum/30 px-4 py-3 shadow-2xs hover:shadow-sm transition-all flex items-center gap-3"
            >
              <span className="w-8 h-8 rounded-full bg-cream-warm group-hover:bg-kumkum-soft flex items-center justify-center text-kumkum transition-colors">
                <UtensilsCrossed className="w-4 h-4" />
              </span>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-semibold text-ink whitespace-nowrap">
                  {cat.label}
                </p>
                <p className="text-[11px] text-ink-muted">{cat.tag}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. TODAY'S SPECIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-kumkum">
              <Sparkles className="w-3.5 h-3.5 text-turmeric-dark" />
              Fresh From The Tawa
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
              Today&apos;s Kitchen Specials
            </h2>
            {specialContent?.title && (
              <p className="text-sm text-ink-muted">{specialContent.title}</p>
            )}
          </div>
          <Link
            to="/menu?filter=specials"
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/12 bg-white hover:bg-cream-warm px-4 py-2 text-xs sm:text-sm font-semibold text-ink transition-colors self-start sm:self-auto"
          >
            View all specials <ArrowRight className="w-4 h-4 text-kumkum" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingMenu
            ? Array.from({ length: 3 }).map((_, idx) => <MenuCardSkeleton key={idx} />)
            : todaysSpecials.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  cartQuantity={getItemQuantity(item.id)}
                  onAddToOrder={handleQuickAdd}
                  onDecreaseQuantity={handleDecrease}
                />
              ))}
        </div>
      </section>

      {/* 2B. HERITAGE & CRAFT BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-white border border-ink/8 p-6 sm:p-8 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:divide-x lg:divide-ink/8">
          {CRAFT_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className={`space-y-2 ${idx > 0 ? 'lg:pl-6' : ''}`}
              >
                <div className="w-9 h-9 rounded-full bg-cream-warm text-kumkum flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  {pillar.detail}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. OUTLET FINDER */}
      <section className="bg-cream-warm/70 border-y border-ink/6 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-banana">
                Namma Bengaluru Locations
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
                Your Neighbourhood {BRAND.name}
              </h2>
              <p className="text-sm text-ink-muted">
                {nearestOutlet
                  ? `Closest to you: ${nearestOutlet.locality} (${distancesByOutletId[nearestOutlet.id]} km away)`
                  : 'Timings, dining seating, and menu availability vary by branch — pick yours below.'}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={locateNearestOutlet}
                disabled={geoLoading}
                className="inline-flex items-center gap-1.5 rounded-full bg-banana hover:bg-banana-dark text-white px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <LocateFixed className="w-4 h-4" />
                {geoLoading ? 'Finding…' : 'Find Nearest'}
              </button>
              <Link
                to="/outlets"
                className="inline-flex items-center gap-1 rounded-full border border-ink/12 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-ink hover:bg-cream transition-colors"
              >
                All Outlets
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingOutlets
              ? Array.from({ length: 3 }).map((_, idx) => <OutletCardSkeleton key={idx} />)
              : outlets.map((outlet) => (
                  <OutletCard
                    key={outlet.id}
                    outlet={outlet}
                    distanceKm={distancesByOutletId[outlet.id]}
                    isSelected={selectedOutlet?.id === outlet.id}
                    onSelect={(o) => selectOutletBySlug(o.slug)}
                  />
                ))}
          </div>
        </div>
      </section>

      {/* 4. POPULAR DISHES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-banana">
              Guest Favourites
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
              Popular Dishes {selectedOutlet ? `in ${selectedOutlet.locality}` : ''}
            </h2>
          </div>
          <Link
            to={`/menu${selectedOutlet ? `?outlet=${selectedOutlet.slug}` : ''}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/12 bg-white hover:bg-cream-warm px-4 py-2 text-xs sm:text-sm font-semibold text-ink transition-colors self-start sm:self-auto"
          >
            Explore Full Menu <ArrowRight className="w-4 h-4 text-kumkum" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingMenu
            ? Array.from({ length: 6 }).map((_, idx) => <MenuCardSkeleton key={idx} />)
            : popularDishes.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  cartQuantity={getItemQuantity(item.id)}
                  onAddToOrder={handleQuickAdd}
                  onDecreaseQuantity={handleDecrease}
                />
              ))}
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-kumkum">
              Guest Stories
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
              Loved by Bengaluru Families
            </h2>
          </div>
          <a
            href={BRAND.links.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/12 bg-white hover:bg-cream-warm px-4 py-2 text-xs sm:text-sm font-semibold text-banana-dark transition-colors self-start sm:self-auto"
          >
            Leave a Google Review <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <blockquote
              key={review.id}
              className="rounded-3xl card-surface p-6 sm:p-7 flex flex-col justify-between gap-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-1 text-turmeric"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-turmeric text-turmeric" />
                    ))}
                  </div>
                  <span className="font-serif text-3xl leading-none text-kumkum/20 select-none">
                    &ldquo;
                  </span>
                </div>
                <p className="text-sm sm:text-[15px] text-ink leading-relaxed">
                  &ldquo;{review.comment}&rdquo;
                </p>
              </div>
              <footer className="pt-4 border-t border-ink/6 flex items-center justify-between text-xs">
                <span className="font-semibold text-ink">{review.customer_name}</span>
                {review.posted_to_google && (
                  <span className="rounded-full bg-banana-soft px-2.5 py-0.5 text-banana-dark font-semibold">
                    Verified Guest
                  </span>
                )}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* 6. BENTO PHOTO GALLERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-banana">
            Inside {BRAND.name}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
            From Our Tawa &amp; Dining Hall
          </h2>
          {/* TODO: Replace MOCK_GALLERY_PHOTOS with authentic restaurant & kitchen shots */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[190px] sm:auto-rows-[220px]">
          {MOCK_GALLERY_PHOTOS.map((photo, idx) => (
            <figure
              key={photo.title}
              className={`relative rounded-3xl overflow-hidden bg-cream-warm group shadow-sm ${
                idx === 0 ? 'sm:col-span-2 lg:col-span-2 lg:row-span-2' : ''
              }`}
            >
              <img
                src={photo.url}
                alt={photo.title}
                loading="lazy"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <figcaption className="absolute bottom-4 left-4 right-4 text-white">
                <p className="font-serif text-base sm:text-lg font-bold">
                  {photo.title}
                </p>
                <p className="text-xs text-white/80 mt-0.5 line-clamp-1">
                  {photo.caption}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}

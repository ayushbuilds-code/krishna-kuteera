import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Clock,
  Filter,
  Flame,
  MapPin,
  Phone,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import { BRAND, formatCurrency, formatTime12h } from '@/config/brand';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useOutlet } from '@/context/OutletContext';
import { useCart } from '@/context/CartContext';
import { fetchOutletMenu, isOutletOpenNow } from '@/services/restaurantData';
import { PureVegBadge } from '@/components/PureVegBadge';
import { SeoHead } from '@/components/SeoHead';
import { MenuItemCard } from '@/components/MenuItemCard';
import { MenuCardSkeleton } from '@/components/Skeletons';
import type { MenuCategory, OutletMenuItem, SpiceLevel } from '@/types/database';

export function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { outlets, selectedOutlet, selectOutletBySlug } = useOutlet();
  const {
    items: cartItems,
    totalItems,
    subtotal,
    setIsCartOpen,
    addItem,
    updateQuantity,
    getItemQuantity,
  } = useCart();

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<OutletMenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const activeCategorySlug = searchParams.get('category') || 'all';
  const [searchQuery, setSearchQuery] = useState('');
  const [jainOnly, setJainOnly] = useState(false);
  const [noOnionGarlicOnly, setNoOnionGarlicOnly] = useState(false);
  const [bestsellerOnly, setBestsellerOnly] = useState(false);
  const [specialsOnly, setSpecialsOnly] = useState(
    searchParams.get('filter') === 'specials'
  );
  const [hideSoldOut, setHideSoldOut] = useState(false);
  const [spiceFilter, setSpiceFilter] = useState<'all' | SpiceLevel>('all');

  // Sync ?outlet=<slug> query param into OutletContext
  useEffect(() => {
    const outletParam = searchParams.get('outlet');
    if (outletParam && selectedOutlet?.slug !== outletParam) {
      selectOutletBySlug(outletParam);
    }
  }, [searchParams, selectedOutlet?.slug, selectOutletBySlug]);

  const loadMenu = useCallback(async (outletId: string) => {
    setLoading(true);
    const { categories: catRows, items: itemRows } = await fetchOutletMenu(outletId);
    setCategories(
      BRAND.features.enableBakerySection
        ? catRows
        : catRows.filter((c) => c.slug !== 'bakery')
    );
    setItems(
      BRAND.features.enableBakerySection
        ? itemRows
        : itemRows.filter((i) => !i.is_bakery_item)
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!selectedOutlet) return;
    loadMenu(selectedOutlet.id);

    // Real-time instant availability & price updates when manager toggles sold-out
    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel(`outlet-menu-${selectedOutlet.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'outlet_menu_prices',
          filter: `outlet_id=eq.${selectedOutlet.id}`,
        },
        () => {
          loadMenu(selectedOutlet.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedOutlet, loadMenu]);

  const handleCategoryChange = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug === 'all') {
      next.delete('category');
    } else {
      next.set('category', slug);
    }
    setSearchParams(next, { replace: true });
  };

  const handleOutletSwitch = (slug: string) => {
    selectOutletBySlug(slug);
    const next = new URLSearchParams(searchParams);
    next.set('outlet', slug);
    setSearchParams(next, { replace: true });
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (activeCategorySlug !== 'all' && item.category_slug !== activeCategorySlug) {
        return false;
      }
      if (
        q &&
        !item.name.toLowerCase().includes(q) &&
        !(item.description || '').toLowerCase().includes(q)
      ) {
        return false;
      }
      if (jainOnly && !item.is_jain_available) return false;
      if (noOnionGarlicOnly && !item.is_no_onion_garlic) return false;
      if (bestsellerOnly && !item.is_bestseller) return false;
      if (specialsOnly && !item.is_todays_special) return false;
      if (hideSoldOut && !item.is_available) return false;
      if (spiceFilter !== 'all' && item.spice_level !== spiceFilter) return false;
      return true;
    });
  }, [
    activeCategorySlug,
    bestsellerOnly,
    hideSoldOut,
    items,
    jainOnly,
    noOnionGarlicOnly,
    searchQuery,
    specialsOnly,
    spiceFilter,
  ]);

  const hasActiveFilters =
    activeCategorySlug !== 'all' ||
    searchQuery.trim().length > 0 ||
    jainOnly ||
    noOnionGarlicOnly ||
    bestsellerOnly ||
    specialsOnly ||
    hideSoldOut ||
    spiceFilter !== 'all';

  const resetAllFilters = () => {
    setSearchQuery('');
    setJainOnly(false);
    setNoOnionGarlicOnly(false);
    setBestsellerOnly(false);
    setSpecialsOnly(false);
    setHideSoldOut(false);
    setSpiceFilter('all');
    const next = new URLSearchParams(searchParams);
    next.delete('category');
    next.delete('filter');
    setSearchParams(next, { replace: true });
  };

  const handleAdd = (item: OutletMenuItem) => {
    if (!selectedOutlet) return;
    addItem(item, {
      id: selectedOutlet.id,
      slug: selectedOutlet.slug,
      name: selectedOutlet.name,
    });
  };

  const handleDecrease = (item: OutletMenuItem) => {
    const line = cartItems.find((l) => l.item.id === item.id);
    if (line) updateQuantity(line.key, line.quantity - 1);
  };

  const openNow = selectedOutlet ? isOutletOpenNow(selectedOutlet) : true;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <SeoHead
        title={`Menu${selectedOutlet ? ` — ${selectedOutlet.locality}` : ''}`}
        description="Order pure-veg South Indian breakfast, masala dosas, idli vada, banana-leaf meals, chaats, filter coffee & sweets online for pickup or delivery."
        canonicalPath="/menu"
      />

      {/* Outlet Context Banner */}
      <section className="rounded-3xl card-surface p-5 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <PureVegBadge label="100% Pure Vegetarian Menu" />
            {selectedOutlet && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[11px] font-semibold ${
                  openNow
                    ? 'bg-banana-soft text-banana-dark'
                    : 'bg-kumkum-soft text-kumkum'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    openNow ? 'bg-banana animate-pulse' : 'bg-kumkum'
                  }`}
                />
                {openNow ? 'Kitchen Open' : 'Currently Closed'}
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
            {selectedOutlet ? selectedOutlet.name : `${BRAND.name} Menu`}
          </h1>
          {selectedOutlet && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-turmeric-dark" />
                {formatTime12h(selectedOutlet.opening_time)} –{' '}
                {formatTime12h(selectedOutlet.closing_time)}
              </span>
              <a
                href={`tel:${selectedOutlet.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-1 text-kumkum font-semibold hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                {selectedOutlet.phone}
              </a>
              <Link
                to={`/outlets/${selectedOutlet.slug}`}
                className="underline hover:text-kumkum"
              >
                Outlet details &amp; map
              </Link>
            </div>
          )}
        </div>

        {/* Outlet Switcher Pills */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-kumkum" />
            Switch Kitchen Outlet
          </p>
          <div className="inline-flex flex-wrap gap-1.5 rounded-2xl bg-cream p-1.5 border border-ink/8">
            {outlets.map((outlet) => (
              <button
                key={outlet.id}
                type="button"
                onClick={() => handleOutletSwitch(outlet.slug)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  selectedOutlet?.id === outlet.id
                    ? 'bg-kumkum text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-white'
                }`}
              >
                {outlet.locality}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <nav
        aria-label="Menu categories"
        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
      >
        <button
          type="button"
          onClick={() => handleCategoryChange('all')}
          className={`shrink-0 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeCategorySlug === 'all'
              ? 'bg-ink text-white shadow-xs'
              : 'bg-white border border-ink/10 text-ink-muted hover:text-ink hover:bg-cream-warm'
          }`}
        >
          All Dishes
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategoryChange(cat.slug)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeCategorySlug === cat.slug
                ? 'bg-ink text-white shadow-xs'
                : 'bg-white border border-ink/10 text-ink-muted hover:text-ink hover:bg-cream-warm'
            }`}
          >
            {cat.slug === 'bakery' ? 'KK Bakers' : cat.name}
          </button>
        ))}
      </nav>

      {/* Search & Dietary / Spice Filters */}
      <section className="rounded-3xl card-surface p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dosa, idli, filter coffee, meals, mysore pak…"
              aria-label="Search menu dishes"
              className="w-full rounded-full border border-ink/10 bg-cream pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-kumkum/25 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-ink-muted shrink-0" />
            <select
              aria-label="Filter by spice level"
              value={spiceFilter}
              onChange={(e) => setSpiceFilter(e.target.value as 'all' | SpiceLevel)}
              className="rounded-full border border-ink/10 bg-cream px-4 py-2.5 text-xs sm:text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-kumkum/25"
            >
              <option value="all">All Spice Levels</option>
              <option value="mild">Mild</option>
              <option value="medium">Medium</option>
              <option value="spicy">Spicy</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setJainOnly((v) => !v)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${
              jainOnly
                ? 'bg-banana text-white border-banana'
                : 'bg-cream text-ink-muted border-ink/10 hover:text-ink hover:bg-cream-warm'
            }`}
          >
            Jain Option
          </button>
          <button
            type="button"
            onClick={() => setNoOnionGarlicOnly((v) => !v)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${
              noOnionGarlicOnly
                ? 'bg-banana text-white border-banana'
                : 'bg-cream text-ink-muted border-ink/10 hover:text-ink hover:bg-cream-warm'
            }`}
          >
            No Onion / No Garlic
          </button>
          <button
            type="button"
            onClick={() => setBestsellerOnly((v) => !v)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${
              bestsellerOnly
                ? 'bg-turmeric text-ink border-turmeric-dark'
                : 'bg-cream text-ink-muted border-ink/10 hover:text-ink hover:bg-cream-warm'
            }`}
          >
            Bestsellers
          </button>
          <button
            type="button"
            onClick={() => setSpecialsOnly((v) => !v)}
            className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${
              specialsOnly
                ? 'bg-kumkum text-white border-kumkum'
                : 'bg-cream text-ink-muted border-ink/10 hover:text-ink hover:bg-cream-warm'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Today&apos;s Specials
          </button>
          <button
            type="button"
            onClick={() => setHideSoldOut((v) => !v)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${
              hideSoldOut
                ? 'bg-ink text-white border-ink'
                : 'bg-cream text-ink-muted border-ink/10 hover:text-ink hover:bg-cream-warm'
            }`}
          >
            Available Only
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-kumkum hover:underline cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </section>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-kumkum" />
          Showing <strong className="text-ink">{filteredItems.length}</strong> pure-veg dishes
          {selectedOutlet ? ` for ${selectedOutlet.locality}` : ''}
        </span>
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <MenuCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl bg-white border border-sand-border p-10 text-center space-y-3">
          <p className="font-serif text-xl font-bold text-ink">
            No dishes match those filters
          </p>
          <p className="text-sm text-ink-muted">
            Try switching categories or clearing your dietary/spice filters.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="rounded-xl bg-kumkum text-white px-4 py-2 text-xs font-bold cursor-pointer"
          >
            Show All Dishes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              cartQuantity={getItemQuantity(item.id)}
              onAddToOrder={handleAdd}
              onDecreaseQuantity={handleDecrease}
            />
          ))}
        </div>
      )}

      {/* Floating Cart Summary Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-[70px] md:bottom-6 inset-x-3 sm:inset-x-4 z-30 flex justify-center pointer-events-none">
          <div className="pointer-events-auto w-full max-w-xl rounded-full bg-ink/95 backdrop-blur-md text-white pl-6 pr-3 py-2.5 shadow-2xl border border-white/15 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-turmeric text-ink text-xs font-bold tabular-nums">
                {totalItems}
              </span>
              <div>
                <p className="text-xs text-cream/70">
                  {totalItems === 1 ? '1 item selected' : `${totalItems} items selected`}
                </p>
                <p className="text-sm sm:text-base font-bold tabular-nums">
                  {formatCurrency(subtotal)} <span className="text-xs font-normal text-cream/65">+ GST</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-turmeric hover:bg-turmeric-dark text-ink px-5 py-2.5 text-xs sm:text-sm font-bold cursor-pointer transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                View Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


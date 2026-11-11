import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CakeSlice, MapPin, ShoppingBag } from 'lucide-react';
import { BRAND } from '@/config/brand';
import { useOutlet } from '@/context/OutletContext';
import { useCart } from '@/context/CartContext';
import { fetchOutletMenu } from '@/services/restaurantData';
import { PureVegBadge } from '@/components/PureVegBadge';
import { MenuItemCard } from '@/components/MenuItemCard';
import { MenuCardSkeleton } from '@/components/Skeletons';
import type { OutletMenuItem } from '@/types/database';

export function BakeryPage() {
  const { outlets, selectedOutlet, selectOutletBySlug } = useOutlet();
  const { items: cartItems, addItem, updateQuantity, getItemQuantity, setIsCartOpen } =
    useCart();

  const [bakeryItems, setBakeryItems] = useState<OutletMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [preorderDate, setPreorderDate] = useState('');

  // Bakery counters are available at Hulimavu & Jayanagar
  const bakeryOutlets = outlets.filter((o) => o.has_bakery_counter);
  const activeBakeryOutlet =
    selectedOutlet?.has_bakery_counter
      ? selectedOutlet
      : bakeryOutlets[0] ?? selectedOutlet;

  useEffect(() => {
    if (!activeBakeryOutlet) return;
    let active = true;
    (async () => {
      setLoading(true);
      const { items } = await fetchOutletMenu(activeBakeryOutlet.id);
      if (active) {
        setBakeryItems(items.filter((i) => i.is_bakery_item));
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [activeBakeryOutlet]);

  if (!BRAND.features.enableBakerySection) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-serif text-3xl font-bold text-kumkum">
          KK Bakers Section Disabled
        </h1>
        <p className="text-ink-muted">
          Enable <code>BRAND.features.enableBakerySection</code> in <code>src/config/brand.ts</code> once confirmed by the client.
        </p>
        <Link to="/menu" className="inline-block rounded-xl bg-kumkum text-white px-5 py-2.5 text-sm font-bold">
          Browse Restaurant Menu
        </Link>
      </div>
    );
  }

  const handleAddBakery = (item: OutletMenuItem) => {
    if (!activeBakeryOutlet) return;
    addItem(
      item,
      {
        id: activeBakeryOutlet.id,
        slug: activeBakeryOutlet.slug,
        name: activeBakeryOutlet.name,
      },
      {
        specialInstructions:
          item.requires_preorder && preorderDate
            ? `Pre-order for: ${preorderDate}`
            : undefined,
      }
    );
  };

  const handleDecrease = (item: OutletMenuItem) => {
    const line = cartItems.find((l) => l.item.id === item.id);
    if (line) updateQuantity(line.key, line.quantity - 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <header className="rounded-3xl card-surface p-7 sm:p-10 space-y-5 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-turmeric/12 blur-3xl"
        />
        <div className="relative space-y-4">
          <div className="inline-flex items-center rounded-full bg-cream border border-ink/8 px-3.5 py-1.5">
            <PureVegBadge label="KK Bakers • 100% Eggless" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ink flex items-center gap-3">
            <CakeSlice className="w-8 h-8 text-kumkum shrink-0" />
            KK Bakers — Fresh Eggless Bakes &amp; Cakes
          </h1>
          <p className="text-ink-muted max-w-2xl text-sm sm:text-base leading-relaxed">
            Nostalgic Bengaluru honey cake, flaky hot veg puffs, and custom 100% eggless
            celebration cakes baked daily at our Hulimavu and Jayanagar bakery counters.
          </p>

          {/* Outlet & Pre-Order Date Bar */}
          <div className="pt-2 flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-kumkum" />
                KK Bakers Outlets
              </span>
              <div className="inline-flex flex-wrap gap-1.5 rounded-2xl bg-cream p-1.5 border border-ink/8">
                {bakeryOutlets.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => selectOutletBySlug(o.slug)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-semibold cursor-pointer transition-all ${
                      activeBakeryOutlet?.id === o.id
                        ? 'bg-kumkum text-white shadow-xs'
                        : 'text-ink-muted hover:text-ink hover:bg-white'
                    }`}
                  >
                    {o.locality}
                  </button>
                ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="bakery-preorder-date"
              className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5 text-kumkum" />
              Cake Pre-Order Pickup Date
            </label>
            <input
              id="bakery-preorder-date"
              type="date"
              value={preorderDate}
              onChange={(e) => setPreorderDate(e.target.value)}
              className="rounded-xl bg-cream border border-ink/10 text-ink px-3.5 py-2 text-xs sm:text-sm font-semibold"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-kumkum hover:bg-kumkum-dark text-white px-5 py-2.5 text-xs sm:text-sm font-semibold cursor-pointer shadow-xs transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-turmeric" />
            Open Cart
          </button>
        </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <MenuCardSkeleton key={i} />)
          : bakeryItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                cartQuantity={getItemQuantity(item.id)}
                onAddToOrder={handleAddBakery}
                onDecreaseQuantity={handleDecrease}
              />
            ))}
      </div>
    </div>
  );
}


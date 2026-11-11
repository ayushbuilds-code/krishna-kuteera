import { Clock, Flame, Minus, Plus, Sparkles } from 'lucide-react';
import { BRAND, formatCurrency } from '@/config/brand';
import { PureVegBadge } from '@/components/PureVegBadge';
import type { OutletMenuItem } from '@/types/database';

interface MenuItemCardProps {
  item: OutletMenuItem;
  cartQuantity?: number;
  onAddToOrder?: (item: OutletMenuItem) => void;
  onDecreaseQuantity?: (item: OutletMenuItem) => void;
}

const SPICE_META = {
  mild: { label: 'Mild', color: 'text-banana-dark bg-banana-soft/80' },
  medium: { label: 'Medium', color: 'text-turmeric-dark bg-turmeric-soft' },
  spicy: { label: 'Spicy', color: 'text-kumkum bg-kumkum-soft' },
} as const;

export function MenuItemCard({
  item,
  cartQuantity = 0,
  onAddToOrder,
  onDecreaseQuantity,
}: MenuItemCardProps) {
  const spice = SPICE_META[item.spice_level];
  const soldOut = !item.is_available;

  return (
    <article
      className={`group rounded-3xl card-surface overflow-hidden flex flex-col ${
        soldOut ? 'opacity-75' : 'card-surface-hover'
      }`}
    >
      {/* Dish Photography */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream-warm">
        <img
          src={item.image_url || BRAND.placeholders.defaultDishImage}
          alt={`${item.name} — pure vegetarian dish at ${BRAND.name}`}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-500 ease-out ${
            soldOut ? 'grayscale-[45%]' : 'group-hover:scale-105'
          }`}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/25 to-transparent" />

        {/* Frosted Top Pills */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          {item.is_todays_special && (
            <span className="inline-flex items-center gap-1 rounded-full bg-kumkum/90 backdrop-blur-md text-white px-2.5 py-1 text-[11px] font-semibold shadow-xs">
              <Sparkles className="w-3 h-3 text-turmeric" />
              Chef&apos;s Special
            </span>
          )}
          {item.is_bestseller && (
            <span className="inline-flex items-center rounded-full bg-white/92 backdrop-blur-md text-ink px-2.5 py-1 text-[11px] font-semibold shadow-xs">
              Bestseller
            </span>
          )}
          {item.requires_preorder && (
            <span className="inline-flex items-center rounded-full bg-ink/85 backdrop-blur-md text-white px-2.5 py-1 text-[11px] font-semibold shadow-xs">
              24h Pre-order
            </span>
          )}
        </div>

        {soldOut && (
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px] flex items-center justify-center p-4">
            <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-kumkum shadow-md">
              Sold Out Today
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <PureVegBadge />
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${spice.color}`}
              title={`Spice level: ${spice.label}`}
            >
              <Flame className="w-3 h-3" />
              {spice.label}
            </span>
          </div>

          <h3 className="font-serif text-[19px] font-bold text-ink leading-snug">
            {item.name}
          </h3>

          {item.description && (
            <p className="text-xs sm:text-[13px] text-ink-muted line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Dietary & Prep Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {item.is_jain_available && (
              <span className="rounded-full bg-banana-soft/80 px-2.5 py-0.5 text-[11px] font-medium text-banana-dark">
                Jain Option
              </span>
            )}
            {item.is_no_onion_garlic && (
              <span className="rounded-full bg-cream-warm px-2.5 py-0.5 text-[11px] font-medium text-wood">
                No Onion/Garlic
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted ml-auto">
              <Clock className="w-3 h-3" />
              {item.prep_time_mins} mins
            </span>
          </div>

          {soldOut && item.unavailable_reason && (
            <p className="text-[11px] font-medium text-kumkum bg-kumkum-soft rounded-xl px-3 py-1.5">
              {item.unavailable_reason}
            </p>
          )}
        </div>

        {/* Footer Price & CTA */}
        <div className="pt-3.5 border-t border-ink/6 flex items-center justify-between gap-3">
          <div>
            <span className="text-lg font-bold text-ink tabular-nums">
              {formatCurrency(item.outlet_price)}
            </span>
            {item.outlet_price !== item.base_price && (
              <span className="ml-1.5 text-[11px] text-ink-muted">outlet price</span>
            )}
          </div>

          {soldOut ? (
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold bg-cream-warm text-ink-muted cursor-not-allowed"
            >
              Unavailable
            </button>
          ) : cartQuantity > 0 ? (
            <div className="inline-flex items-center rounded-full bg-kumkum text-white shadow-sm">
              <button
                type="button"
                onClick={() => onDecreaseQuantity?.(item)}
                aria-label={`Remove one ${item.name}`}
                className="p-2 hover:bg-kumkum-dark rounded-l-full cursor-pointer transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2.5 text-xs sm:text-sm font-bold tabular-nums">
                {cartQuantity}
              </span>
              <button
                type="button"
                onClick={() => onAddToOrder?.(item)}
                aria-label={`Add one more ${item.name}`}
                className="p-2 hover:bg-kumkum-dark rounded-r-full cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onAddToOrder?.(item)}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-[13px] font-semibold transition-all border border-kumkum/20 bg-kumkum-soft/70 text-kumkum hover:bg-kumkum hover:text-white active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

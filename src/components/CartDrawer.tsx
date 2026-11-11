import { Link } from 'react-router-dom';
import {
  ArrowRight,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { BRAND, formatCurrency } from '@/config/brand';
import { useCart } from '@/context/CartContext';
import { PureVegBadge } from '@/components/PureVegBadge';
import type { SpiceLevel } from '@/types/database';

export function CartDrawer() {
  const {
    cartOutletName,
    items,
    totalItems,
    subtotal,
    gstAmount,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    updateItemOptions,
    removeItem,
    clearCart,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-ink/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Your Order Cart"
    >
      {/* Backdrop close */}
      <div
        className="flex-1"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside className="w-full sm:max-w-md bg-cream h-full flex flex-col shadow-2xl border-l border-ink/10">
        {/* Header */}
        <div className="bg-ink text-white px-5 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShoppingBag className="w-5 h-5 text-turmeric shrink-0" />
            <div className="min-w-0">
              <h2 className="font-serif text-lg font-bold leading-tight truncate">
                Your Tiffin Cart ({totalItems})
              </h2>
              {cartOutletName && (
                <p className="text-[11px] text-cream/70 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3 h-3 text-turmeric shrink-0" />
                  <span className="truncate">{cartOutletName}</span>
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
            className="rounded-full p-2 bg-white/10 hover:bg-white/20 text-white cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-turmeric-soft flex items-center justify-center text-kumkum">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="font-serif text-xl font-bold text-ink">
                  Your cart is empty
                </p>
                <p className="text-sm text-ink-muted">
                  Add crisp dosas, hot idlis, or brass filter coffee to start your order.
                </p>
              </div>
              <Link
                to="/menu"
                onClick={() => setIsCartOpen(false)}
                className="rounded-xl bg-kumkum text-white px-5 py-2.5 text-sm font-bold"
              >
                Explore Menu
              </Link>
            </div>
          ) : (
            <>
              {items.map((line) => (
                <div
                  key={line.key}
                  className="rounded-2xl bg-white border border-sand-border p-3.5 space-y-2.5 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <PureVegBadge compact />
                      <h3 className="font-serif text-base font-bold text-ink leading-snug">
                        {line.item.name}
                      </h3>
                      <p className="text-xs font-semibold text-ink-muted">
                        {formatCurrency(line.item.outlet_price)} each
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="inline-flex items-center rounded-full border border-ink/10 bg-cream">
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.key, line.quantity - 1)}
                          aria-label={`Decrease quantity of ${line.item.name}`}
                          className="p-2.5 text-kumkum hover:bg-cream-warm rounded-l-full cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-ink tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(line.key, line.quantity + 1)}
                          aria-label={`Increase quantity of ${line.item.name}`}
                          className="p-2.5 text-kumkum hover:bg-cream-warm rounded-r-full cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(line.key)}
                        aria-label={`Remove ${line.item.name}`}
                        className="p-2 text-ink-muted hover:text-kumkum cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Customization row */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-sand-border/60">
                    {line.item.is_jain_available && (
                      <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-banana-dark cursor-pointer">
                        <input
                          type="checkbox"
                          checked={line.isJain}
                          onChange={(e) =>
                            updateItemOptions(line.key, { isJain: e.target.checked })
                          }
                          className="rounded accent-banana"
                        />
                        Make Jain
                      </label>
                    )}

                    <select
                      aria-label={`Spice level for ${line.item.name}`}
                      value={line.spicePreference}
                      onChange={(e) =>
                        updateItemOptions(line.key, {
                          spicePreference: e.target.value as SpiceLevel,
                        })
                      }
                      className="rounded-lg border border-sand-border bg-cream px-2 py-1 text-[11px] font-medium text-ink"
                    >
                      <option value="mild">Mild</option>
                      <option value="medium">Medium</option>
                      <option value="spicy">Spicy</option>
                    </select>

                    <input
                      type="text"
                      value={line.specialInstructions}
                      onChange={(e) =>
                        updateItemOptions(line.key, {
                          specialInstructions: e.target.value,
                        })
                      }
                      placeholder="Note (e.g. less oil, extra chutney)"
                      className="flex-1 min-w-[140px] rounded-lg border border-sand-border bg-cream px-2.5 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-kumkum/40"
                    />
                  </div>

                  <div className="flex justify-end text-sm font-bold text-ink">
                    {formatCurrency(line.item.outlet_price * line.quantity)}
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-semibold text-ink-muted hover:text-kumkum cursor-pointer"
                >
                  Clear Cart
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer Totals & Checkout */}
        {items.length > 0 && (
          <div className="bg-white border-t border-ink/8 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-3">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-ink-muted">
                <span>Item Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>GST ({BRAND.operations.gstRatePercent}%)</span>
                <span>{formatCurrency(gstAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-ink pt-1 border-t border-ink/8">
                <span>Estimated Total</span>
                <span>{formatCurrency(subtotal + gstAmount)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-kumkum hover:bg-kumkum-dark text-white px-5 py-3.5 text-sm font-bold shadow-sm transition-colors"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}


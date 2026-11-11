import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  ChefHat,
  Clock,
  ExternalLink,
  PackageCheck,
  Search,
  Star,
  Truck,
} from 'lucide-react';
import { BRAND, formatCurrency } from '@/config/brand';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import {
  fetchOrderByIdForTracking,
  getRecentLocalOrders,
  lookupOrderForTracking,
  submitOrderReview,
  subscribeToDemoOrderSync,
  type DemoOrderRecord,
} from '@/services/orderService';
import type { OrderStatus } from '@/types/database';

const STATUS_STEPS: {
  key: OrderStatus;
  label: string;
  desc: string;
  icon: typeof Clock;
}[] = [
  {
    key: 'received',
    label: 'Order Received',
    desc: 'Sent to the outlet kitchen',
    icon: Clock,
  },
  {
    key: 'preparing',
    label: 'Preparing',
    desc: 'Fresh on the tawa & steamer',
    icon: ChefHat,
  },
  {
    key: 'ready',
    label: 'Ready',
    desc: 'Packed & waiting for pickup / rider',
    icon: PackageCheck,
  },
  {
    key: 'out_for_delivery',
    label: 'Out for Delivery',
    desc: 'On the way to your doorstep',
    icon: Truck,
  },
];

export function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId?: string }>();
  const navigate = useNavigate();

  const [record, setRecord] = useState<DemoOrderRecord | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [recentOrders, setRecentOrders] = useState<DemoOrderRecord[]>([]);

  // Lookup form
  const [lookupNumber, setLookupNumber] = useState('');
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Post-order feedback form (Part A #9)
  const [rating, setRating] = useState(5);
  const [foodRating, setFoodRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    setRecentOrders(getRecentLocalOrders());
    const unsub = subscribeToDemoOrderSync(() => {
      setRecentOrders(getRecentLocalOrders());
    });
    return unsub;
  }, []);

  const refreshActiveOrder = useCallback(async (id: string, silent = false) => {
    if (!silent) setLoading(true);
    const found = await fetchOrderByIdForTracking(id);
    setRecord(found);
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    if (!orderId) {
      setRecord(null);
      setLoading(false);
      return;
    }

    let active = true;
    (async () => {
      setLoading(true);
      const found = await fetchOrderByIdForTracking(orderId);
      if (active) {
        setRecord(found);
        setLoading(false);
      }
    })();

    // Cross-tab instant sync + background poll so kitchen staff updates reflect automatically
    const unsubDemoSync = subscribeToDemoOrderSync((evt) => {
      if (
        evt.type === 'ORDER_STATUS_UPDATED' &&
        (!evt.orderId || evt.orderId === orderId)
      ) {
        void refreshActiveOrder(orderId, true);
      }
    });

    const handleFocus = () => {
      void refreshActiveOrder(orderId, true);
    };
    window.addEventListener('focus', handleFocus);

    const pollInterval = window.setInterval(() => {
      void refreshActiveOrder(orderId, true);
    }, 2500);

    if (!isSupabaseConfigured || orderId.startsWith('demo-ord-')) {
      return () => {
        active = false;
        unsubDemoSync();
        window.removeEventListener('focus', handleFocus);
        window.clearInterval(pollInterval);
      };
    }

    const channel = supabase
      .channel(`track-order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setRecord((prev) =>
            prev
              ? { ...prev, order: { ...prev.order, ...(payload.new as DemoOrderRecord['order']) } }
              : prev
          );
        }
      )
      .subscribe();

    return () => {
      active = false;
      unsubDemoSync();
      window.removeEventListener('focus', handleFocus);
      window.clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [orderId, refreshActiveOrder]);

  const handleLookup = async (e: FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    const found = await lookupOrderForTracking(lookupNumber, lookupPhone);
    if (!found) {
      setLookupError('No matching order found. Check your order number & last 4 digits of your phone.');
      return;
    }
    navigate(`/track-order/${found.order.id}`);
  };

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!record) return;
    await submitOrderReview({
      outletId: record.order.outlet_id,
      orderId: record.order.id,
      customerName: record.order.customer_name,
      rating,
      foodRating,
      serviceRating,
      comment,
      postedToGoogle: false,
    });
    setReviewSubmitted(true);
  };

  const visibleSteps =
    record?.order.order_type === 'pickup'
      ? STATUS_STEPS.filter((s) => s.key !== 'out_for_delivery')
      : STATUS_STEPS;

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'completed') return visibleSteps.length;
    const idx = visibleSteps.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-widest text-banana">
          Live Kitchen Updates
        </span>
        <h1 className="font-serif text-3xl font-bold text-kumkum">
          Track Your Order
        </h1>
      </div>

      {/* Order Lookup Form (when no orderId or wanting to search another) */}
      {!record && !loading && (
        <div className="space-y-6">
          <form
            onSubmit={handleLookup}
            className="rounded-2xl bg-white border border-sand-border p-6 space-y-4 shadow-xs"
          >
            <h2 className="font-serif text-xl font-bold text-ink">
              Find Your Order
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
                  Order Number
                </label>
                <input
                  type="text"
                  required
                  value={lookupNumber}
                  onChange={(e) => setLookupNumber(e.target.value)}
                  placeholder="e.g. KK-HUL-1234"
                  className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
                  Phone Number (or last 4 digits)
                </label>
                <input
                  type="tel"
                  required
                  value={lookupPhone}
                  onChange={(e) => setLookupPhone(e.target.value)}
                  placeholder="e.g. 2345"
                  className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
            {lookupError && (
              <p className="text-xs font-semibold text-kumkum">{lookupError}</p>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-kumkum hover:bg-kumkum-dark text-white px-5 py-2.5 text-sm font-bold cursor-pointer"
            >
              <Search className="w-4 h-4" />
              Track Status
            </button>
          </form>

          {recentOrders.length > 0 && (
            <div className="rounded-2xl bg-white border border-sand-border p-5 space-y-3">
              <h3 className="font-serif text-lg font-bold text-ink">
                Recent Orders on This Device
              </h3>
              <div className="space-y-2">
                {recentOrders.map((r) => (
                  <Link
                    key={r.order.id}
                    to={`/track-order/${r.order.id}`}
                    className="flex items-center justify-between rounded-xl bg-cream hover:bg-cream-warm px-4 py-3 border border-sand-border transition-colors"
                  >
                    <div>
                      <p className="font-bold text-sm text-kumkum">
                        {r.order.order_number}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {r.outletName} • {formatCurrency(r.order.total_amount)}
                      </p>
                    </div>
                    <span className="rounded-full bg-turmeric-soft px-3 py-1 text-xs font-bold uppercase text-wood">
                      {r.order.status.replace(/_/g, ' ')}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl bg-white border border-sand-border p-8 animate-pulse space-y-4">
          <div className="h-6 w-48 bg-cream-warm rounded" />
          <div className="h-24 bg-cream-warm rounded-xl" />
        </div>
      )}

      {/* Active Order Live Tracker */}
      {record && (
        <div className="space-y-6">
          <section className="rounded-3xl bg-white border border-sand-border p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-sand-border pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-banana">
                  {record.order.order_type === 'delivery' ? 'Delivery Order' : 'Pickup Order'} •{' '}
                  {record.outletName}
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink mt-1">
                  Order #{record.order.order_number}
                </h2>
                <p className="text-xs text-ink-muted mt-1">
                  Placed by {record.order.customer_name} • Total:{' '}
                  <strong className="text-ink">
                    {formatCurrency(record.order.total_amount)}
                  </strong>{' '}
                  ({record.order.payment_status === 'paid' ? 'Paid via Razorpay' : 'Pay at Counter'})
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                  record.order.status === 'completed'
                    ? 'bg-banana-soft text-banana-dark'
                    : 'bg-turmeric-soft text-wood'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    record.order.status === 'completed'
                      ? 'bg-banana'
                      : 'bg-turmeric-dark animate-pulse'
                  }`}
                />
                {record.order.status === 'completed'
                  ? 'Order Completed'
                  : 'Live Kitchen Sync Active'}
              </span>
            </div>

            {/* Progress Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {visibleSteps.map((step, idx) => {
                const currentIdx = getStepIndex(record.order.status);
                const done = idx <= currentIdx;
                const Icon = step.icon;
                return (
                  <div
                    key={step.key}
                    className={`rounded-2xl border p-4 space-y-1.5 transition-all ${
                      done
                        ? 'bg-banana-soft border-banana/40'
                        : 'bg-cream border-sand-border opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon
                        className={`w-5 h-5 ${
                          done ? 'text-banana-dark' : 'text-ink-muted'
                        }`}
                      />
                      {done && <CheckCircle2 className="w-4 h-4 text-banana" />}
                    </div>
                    <p className="font-serif text-sm font-bold text-ink">
                      {step.label}
                    </p>
                    <p className="text-[11px] text-ink-muted">{step.desc}</p>
                  </div>
                );
              })}
            </div>

            {record.order.status === 'completed' && (
              <div className="rounded-xl bg-banana text-white px-4 py-3 text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Order completed — thank you for dining with {BRAND.name}!
              </div>
            )}

            {/* Item Summary */}
            {record.items.length > 0 && (
              <div className="pt-2 border-t border-sand-border">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                  Items Ordered
                </p>
                <ul className="space-y-1.5 text-sm">
                  {record.items.map((it) => (
                    <li key={it.id} className="flex justify-between">
                      <span>
                        {it.quantity} × {it.item_name}
                        {it.is_jain ? ' (Jain)' : ''}
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(it.total_price)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Post-Order Feedback & Google Review Card (Part A #9) */}
          <section className="rounded-3xl bg-white border border-sand-border p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-kumkum">
                  How Was Your Experience?
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted">
                  Share quick feedback with our kitchen team or leave a public Google review.
                </p>
              </div>
              <a
                href={BRAND.links.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-turmeric hover:bg-turmeric-dark text-ink px-4 py-2 text-xs font-bold shrink-0"
              >
                Leave a Google Review
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {reviewSubmitted ? (
              <div className="rounded-xl bg-banana-soft border border-banana/30 p-4 text-sm font-semibold text-banana-dark flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Dhanyavaada! Your review has been saved.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Overall', val: rating, set: setRating },
                    { label: 'Food Taste', val: foodRating, set: setFoodRating },
                    { label: 'Service', val: serviceRating, set: setServiceRating },
                  ].map((row) => (
                    <div key={row.label} className="space-y-1">
                      <span className="text-xs font-bold text-ink-muted">{row.label}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => row.set(star)}
                            aria-label={`${row.label} ${star} stars`}
                            className="cursor-pointer"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= row.val
                                  ? 'fill-turmeric text-turmeric'
                                  : 'text-sand-border'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about the dosa crispness, filter coffee, or packaging…"
                  className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm"
                />

                <button
                  type="submit"
                  className="rounded-xl bg-kumkum hover:bg-kumkum-dark text-white px-5 py-2.5 text-sm font-bold cursor-pointer"
                >
                  Submit Feedback
                </button>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}


import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bell,
  BellOff,
  CheckCircle2,
  Printer,
  RefreshCw,
  Volume2,
  X,
} from 'lucide-react';
import { BRAND, formatCurrency } from '@/config/brand';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { subscribeToDemoOrderSync } from '@/services/orderService';
import {
  fetchAdminOrders,
  playNewOrderChime,
  updateAdminOrderStatus,
  type AdminOrderWithItems,
} from '@/services/adminService';
import type { OrderStatus } from '@/types/database';

const KANBAN_COLUMNS: {
  key: OrderStatus;
  title: string;
  badgeClass: string;
  nextStatus?: OrderStatus;
  nextLabel?: string;
}[] = [
  {
    key: 'received',
    title: 'New Orders',
    badgeClass: 'bg-kumkum text-white',
    nextStatus: 'preparing',
    nextLabel: 'Accept & Prepare →',
  },
  {
    key: 'preparing',
    title: 'Preparing',
    badgeClass: 'bg-turmeric text-ink',
    nextStatus: 'ready',
    nextLabel: 'Mark Ready →',
  },
  {
    key: 'ready',
    title: 'Ready',
    badgeClass: 'bg-banana text-white',
    nextStatus: 'completed',
    nextLabel: 'Complete Order ✓',
  },
  {
    key: 'completed',
    title: 'Completed',
    badgeClass: 'bg-wood text-white',
  },
];

export function AdminOrdersPage() {
  const { activeOutletId } = useAdminAuth();
  const [orders, setOrders] = useState<AdminOrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mobileStage, setMobileStage] = useState<'all' | OrderStatus>('all');
  const [printTarget, setPrintTarget] = useState<{
    entry: AdminOrderWithItems;
    mode: 'kot' | 'bill';
  } | null>(null);

  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const loadOrders = useCallback(
    async (opts?: { silent?: boolean; chimeOnNew?: boolean }) => {
      if (!opts?.silent) setLoading(true);
      const rows = await fetchAdminOrders(activeOutletId);

      const prevKnown = knownOrderIdsRef.current;
      if (opts?.chimeOnNew && prevKnown.size > 0) {
        const hasNewIncoming = rows.some(
          (r) => !prevKnown.has(r.order.id) && r.order.status === 'received'
        );
        if (hasNewIncoming && soundEnabledRef.current) {
          playNewOrderChime();
        }
      }
      knownOrderIdsRef.current = new Set(rows.map((r) => r.order.id));

      setOrders(rows);
      if (!opts?.silent) setLoading(false);
    },
    [activeOutletId]
  );

  useEffect(() => {
    loadOrders();

    // Cross-tab instant sync for local/demo mode + fallback polling
    const unsubDemoSync = subscribeToDemoOrderSync((evt) => {
      if (evt.type === 'NEW_ORDER') {
        if (soundEnabledRef.current) playNewOrderChime();
        loadOrders({ silent: true, chimeOnNew: false });
      } else {
        loadOrders({ silent: true });
      }
    });

    const interval = window.setInterval(() => {
      loadOrders({ silent: true, chimeOnNew: true });
    }, 3000);

    if (!isSupabaseConfigured) {
      return () => {
        unsubDemoSync();
        window.clearInterval(interval);
      };
    }

    const channel = supabase
      .channel(`admin-orders-${activeOutletId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        () => {
          if (soundEnabledRef.current) playNewOrderChime();
          loadOrders({ silent: true });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        () => {
          loadOrders({ silent: true });
        }
      )
      .subscribe();

    return () => {
      unsubDemoSync();
      window.clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [activeOutletId, loadOrders]);

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    await updateAdminOrderStatus(orderId, nextStatus);
    setOrders((prev) =>
      prev.map((e) =>
        e.order.id === orderId
          ? { ...e, order: { ...e.order, status: nextStatus } }
          : e
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-banana">
            Kitchen &amp; Counter Dispatch
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-kumkum">
            Live Order Board (Kanban)
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold border cursor-pointer ${
              soundEnabled
                ? 'bg-banana-soft border-banana/30 text-banana-dark'
                : 'bg-white border-sand-border text-ink-muted'
            }`}
          >
            {soundEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
            {soundEnabled ? 'Sound Alert On' : 'Muted'}
          </button>

          <button
            type="button"
            onClick={playNewOrderChime}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-sand-border px-3 py-2 text-xs font-semibold text-ink hover:bg-cream-warm cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-kumkum" />
            Test Chime
          </button>

          <button
            type="button"
            onClick={() => loadOrders()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-kumkum text-white px-3.5 py-2 text-xs font-bold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Mobile Stage Quick Filter Tabs */}
      <div className="md:hidden flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setMobileStage('all')}
          className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
            mobileStage === 'all'
              ? 'bg-ink text-white'
              : 'bg-white border border-sand-border text-ink-muted'
          }`}
        >
          All ({orders.length})
        </button>
        {KANBAN_COLUMNS.map((col) => {
          const count = orders.filter((e) =>
            col.key === 'ready'
              ? e.order.status === 'ready' || e.order.status === 'out_for_delivery'
              : e.order.status === col.key
          ).length;
          return (
            <button
              key={col.key}
              type="button"
              onClick={() => setMobileStage(col.key)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                mobileStage === col.key
                  ? 'bg-kumkum text-white'
                  : 'bg-white border border-sand-border text-ink-muted'
              }`}
            >
              {col.title} ({count})
            </button>
          );
        })}
      </div>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {KANBAN_COLUMNS.map((col) => {
          const colOrders = orders.filter((e) =>
            col.key === 'ready'
              ? e.order.status === 'ready' || e.order.status === 'out_for_delivery'
              : e.order.status === col.key
          );
          const hiddenOnMobile =
            mobileStage !== 'all' && mobileStage !== col.key;

          return (
            <section
              key={col.key}
              className={`rounded-2xl bg-cream-warm border border-sand-border p-3 space-y-3 min-h-[240px] md:min-h-[280px] ${
                hiddenOnMobile ? 'hidden md:block' : ''
              }`}
            >
              <header className="flex items-center justify-between px-1">
                <h2 className="font-serif text-base font-bold text-ink">
                  {col.title}
                </h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${col.badgeClass}`}
                >
                  {colOrders.length}
                </span>
              </header>

              {colOrders.length === 0 ? (
                <p className="text-xs text-ink-muted text-center py-8">
                  No orders in this stage
                </p>
              ) : (
                <div className="space-y-3">
                  {colOrders.map((entry) => {
                    const { order, items } = entry;
                    const nextAction =
                      order.status === 'ready' && order.order_type === 'delivery'
                        ? { status: 'out_for_delivery' as OrderStatus, label: 'Dispatch Rider →' }
                        : col.nextStatus
                          ? { status: col.nextStatus, label: col.nextLabel! }
                          : null;

                    return (
                      <article
                        key={order.id}
                        className="rounded-xl bg-white border border-sand-border p-3.5 space-y-2.5 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-kumkum">
                              {order.order_number}
                            </p>
                            <p className="text-xs font-semibold text-ink">
                              {order.customer_name} • {order.customer_phone}
                            </p>
                          </div>
                          <span className="rounded-md bg-cream-warm px-2 py-0.5 text-[10px] font-bold uppercase text-wood">
                            {order.order_type.replace('_', ' ')}
                          </span>
                        </div>

                        <ul className="text-xs text-ink space-y-1 border-y border-sand-border/70 py-2">
                          {items.map((it) => (
                            <li key={it.id} className="flex justify-between gap-2">
                              <span>
                                <strong>{it.quantity}×</strong> {it.item_name}
                                {it.is_jain && (
                                  <span className="ml-1 text-[10px] font-bold text-banana-dark">
                                    [JAIN]
                                  </span>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {order.order_notes && (
                          <p className="text-[11px] bg-turmeric-soft text-wood rounded-lg px-2 py-1">
                            Note: {order.order_notes}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs pt-0.5">
                          <span className="font-bold text-ink">
                            {formatCurrency(order.total_amount)}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setPrintTarget({ entry, mode: 'kot' })}
                              className="inline-flex items-center gap-1 rounded-lg border border-sand-border px-2 py-1 text-[11px] font-semibold hover:bg-cream-warm cursor-pointer"
                              title="Print Kitchen Order Ticket"
                            >
                              <Printer className="w-3 h-3" />
                              KOT
                            </button>
                            <button
                              type="button"
                              onClick={() => setPrintTarget({ entry, mode: 'bill' })}
                              className="inline-flex items-center gap-1 rounded-lg border border-sand-border px-2 py-1 text-[11px] font-semibold hover:bg-cream-warm cursor-pointer"
                              title="Print Customer Bill"
                            >
                              Bill
                            </button>
                          </div>
                        </div>

                        {nextAction && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(order.id, nextAction.status)}
                            className="w-full rounded-xl bg-kumkum hover:bg-kumkum-dark text-white py-2 text-xs font-bold cursor-pointer"
                          >
                            {nextAction.label}
                          </button>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Printable KOT / GST Bill Modal */}
      {printTarget && (
        <div
          className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-sand-border">
            <div className="flex items-center justify-between border-b border-sand-border pb-3 print:hidden">
              <h3 className="font-serif text-lg font-bold text-kumkum">
                {printTarget.mode === 'kot' ? 'Kitchen Order Ticket (KOT)' : 'GST Tax Invoice'}
              </h3>
              <button
                type="button"
                onClick={() => setPrintTarget(null)}
                className="p-1 text-ink-muted hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="font-mono text-xs space-y-2 text-ink">
              <div className="text-center border-b border-dashed border-ink/30 pb-2">
                <p className="font-bold text-sm uppercase">{BRAND.name}</p>
                {printTarget.mode === 'bill' && (
                  <p className="text-[10px]">
                    GSTIN: {BRAND.legal.gstin} • FSSAI: {BRAND.legal.fssaiNumber}
                  </p>
                )}
                <p className="font-bold mt-1">
                  {printTarget.mode === 'kot' ? 'KOT' : 'BILL'} #
                  {printTarget.entry.order.order_number}
                </p>
                <p className="text-[10px]">
                  {new Date(printTarget.entry.order.created_at).toLocaleString('en-IN')} •{' '}
                  {printTarget.entry.order.order_type.toUpperCase()}
                </p>
              </div>

              <p>
                Guest: {printTarget.entry.order.customer_name} (
                {printTarget.entry.order.customer_phone})
              </p>

              <div className="border-y border-dashed border-ink/30 py-2 space-y-1">
                {printTarget.entry.items.map((it) => (
                  <div key={it.id} className="flex justify-between">
                    <span>
                      {it.quantity} × {it.item_name}
                      {it.is_jain ? ' (JAIN)' : ''}
                    </span>
                    {printTarget.mode === 'bill' && (
                      <span>{formatCurrency(it.total_price)}</span>
                    )}
                  </div>
                ))}
              </div>

              {printTarget.mode === 'bill' && (
                <div className="space-y-0.5">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(printTarget.entry.order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST ({BRAND.operations.gstRatePercent}%)</span>
                    <span>{formatCurrency(printTarget.entry.order.gst_amount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm pt-1 border-t border-ink/20">
                    <span>TOTAL</span>
                    <span>{formatCurrency(printTarget.entry.order.total_amount)}</span>
                  </div>
                </div>
              )}

              {printTarget.entry.order.order_notes && (
                <p className="font-bold">NOTES: {printTarget.entry.order.order_notes}</p>
              )}
            </div>

            <div className="flex gap-2 pt-2 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-kumkum text-white py-2.5 text-xs font-bold cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Print Now
              </button>
              <button
                type="button"
                onClick={() => setPrintTarget(null)}
                className="rounded-xl border border-sand-border px-4 py-2.5 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


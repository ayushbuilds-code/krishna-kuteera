import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Utensils,
} from 'lucide-react';
import { formatCurrency } from '@/config/brand';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  fetchAllOutletsAdmin,
  fetchAdminDashboardMetrics,
  type DashboardMetrics,
} from '@/services/adminService';
import type { Outlet } from '@/types/database';

export function AdminDashboardPage() {
  const { activeOutletId, isOwner } = useAdminAuth();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const outletList = await fetchAllOutletsAdmin();
      const data = await fetchAdminDashboardMetrics(activeOutletId, outletList);
      if (active) {
        setOutlets(outletList);
        setMetrics(data);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [activeOutletId]);

  const scopeLabel =
    activeOutletId === 'all'
      ? 'All Bengaluru Outlets'
      : outlets.find((o) => o.id === activeOutletId)?.locality || 'Outlet';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-banana">
            Operations Overview • {scopeLabel}
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-kumkum">
            Dashboard
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 rounded-xl bg-kumkum text-white px-4 py-2 text-xs font-bold"
          >
            Live Order Board <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/admin/menu"
            className="inline-flex items-center gap-1.5 rounded-xl bg-turmeric text-ink px-4 py-2 text-xs font-bold"
          >
            1-Click Sold Out
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {loading || !metrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white border border-sand-border" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white border border-sand-border p-5 space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-ink-muted">
                <span>Today&apos;s Sales</span>
                <IndianRupee className="w-4 h-4 text-banana" />
              </div>
              <p className="text-2xl font-bold text-ink">
                {formatCurrency(metrics.todaySales)}
              </p>
              <p className="text-xs text-banana-dark font-medium">GST included</p>
            </div>

            <div className="rounded-2xl bg-white border border-sand-border p-5 space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-ink-muted">
                <span>Orders Today</span>
                <ShoppingBag className="w-4 h-4 text-kumkum" />
              </div>
              <p className="text-2xl font-bold text-ink">{metrics.todayOrderCount}</p>
              <p className="text-xs text-kumkum font-medium">
                {metrics.pendingOrdersCount} active in kitchen
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-sand-border p-5 space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-ink-muted">
                <span>Avg Order Value</span>
                <TrendingUp className="w-4 h-4 text-turmeric-dark" />
              </div>
              <p className="text-2xl font-bold text-ink">
                {formatCurrency(metrics.avgTicket)}
              </p>
              <p className="text-xs text-ink-muted">Per ticket</p>
            </div>

            <div className="rounded-2xl bg-white border border-sand-border p-5 space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-ink-muted">
                <span>Low-Stock Alerts</span>
                <AlertTriangle className="w-4 h-4 text-kumkum" />
              </div>
              <p className="text-2xl font-bold text-kumkum">
                {metrics.lowStockAlerts.length}
              </p>
              <p className="text-xs text-ink-muted">Items at/below reorder level</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Top Dishes */}
            <section className="lg:col-span-6 rounded-2xl bg-white border border-sand-border p-5 space-y-4 shadow-xs">
              <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
                <Utensils className="w-4 h-4 text-kumkum" />
                Top Selling Dishes
              </h2>
              {metrics.topDishes.length === 0 ? (
                <p className="text-sm text-ink-muted">No order items recorded yet.</p>
              ) : (
                <ul className="space-y-3">
                  {metrics.topDishes.map((dish) => (
                    <li key={dish.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-ink">{dish.name}</span>
                        <span className="text-xs font-bold text-ink-muted">
                          {dish.count} sold • {formatCurrency(dish.revenue)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-cream-warm overflow-hidden">
                        <div
                          className="h-full bg-banana rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (dish.count / (metrics.topDishes[0]?.count || 1)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Low Stock Alerts */}
            <section className="lg:col-span-6 rounded-2xl bg-white border border-sand-border p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-kumkum" />
                  Low-Stock Ingredients
                </h2>
                <Link
                  to="/admin/inventory"
                  className="text-xs font-bold text-kumkum hover:underline"
                >
                  Open Inventory →
                </Link>
              </div>
              {metrics.lowStockAlerts.length === 0 ? (
                <p className="text-sm text-banana-dark font-medium">
                  All kitchen ingredients are stocked above reorder levels.
                </p>
              ) : (
                <ul className="divide-y divide-sand-border">
                  {metrics.lowStockAlerts.map((item) => (
                    <li
                      key={item.id}
                      className="py-2.5 flex items-center justify-between text-sm"
                    >
                      <div>
                        <p className="font-semibold text-ink">{item.name}</p>
                        <p className="text-xs text-ink-muted">
                          Reorder at {item.reorder_level} {item.unit} • {item.supplier_name}
                        </p>
                      </div>
                      <span className="rounded-full bg-kumkum-soft text-kumkum px-3 py-1 text-xs font-bold">
                        {item.current_stock} {item.unit} left
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Multi-Outlet Comparison (Owner view) */}
          {isOwner && (
            <section className="rounded-2xl bg-white border border-sand-border p-5 space-y-4 shadow-xs">
              <h2 className="font-serif text-lg font-bold text-ink">
                Multi-Outlet Sales Comparison
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase text-ink-muted border-b border-sand-border">
                    <tr>
                      <th className="py-2.5 pr-4">Outlet</th>
                      <th className="py-2.5 px-4">Orders</th>
                      <th className="py-2.5 pl-4 text-right">Sales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-border">
                    {metrics.outletComparison.map((row) => (
                      <tr key={row.outletId}>
                        <td className="py-3 pr-4 font-semibold text-ink">
                          {row.outletName}
                        </td>
                        <td className="py-3 px-4 text-ink-muted">{row.orders}</td>
                        <td className="py-3 pl-4 text-right font-bold text-banana-dark">
                          {formatCurrency(row.sales)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}


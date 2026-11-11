import { useEffect, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { BRAND, formatCurrency } from '@/config/brand';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { type AdminOrderWithItems } from '@/services/adminService';
import {
  exportOrdersToCsv,
  fetchSalesReportAdmin,
  type ReportPeriod,
} from '@/services/phase6Service';

export function AdminReportsPage() {
  const { activeOutletId } = useAdminAuth();
  const [period, setPeriod] = useState<ReportPeriod>('daily');
  const [rows, setRows] = useState<AdminOrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const data = await fetchSalesReportAdmin(activeOutletId, period);
      if (active) {
        setRows(data);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [activeOutletId, period]);

  const totals = rows.reduce(
    (acc, { order }) => {
      acc.subtotal += order.subtotal;
      acc.gst += order.gst_amount;
      acc.discounts += order.discount_amount;
      acc.total += order.total_amount;
      return acc;
    },
    { subtotal: 0, gst: 0, discounts: 0, total: 0 }
  );

  const cgst = Math.round((totals.gst / 2) * 100) / 100;
  const sgst = Math.round((totals.gst / 2) * 100) / 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-banana">
            GSTIN: {BRAND.legal.gstin}
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-kumkum">
            Sales &amp; GST Reports
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {(['daily', 'weekly', 'monthly'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold capitalize cursor-pointer ${
                period === p
                  ? 'bg-kumkum text-white'
                  : 'bg-white border border-sand-border text-ink'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={() =>
              exportOrdersToCsv(
                rows,
                `krishna-kuteera-${period}-gst-report-${new Date()
                  .toISOString()
                  .slice(0, 10)}.csv`
              )
            }
            className="inline-flex items-center gap-1.5 rounded-xl bg-banana text-white px-4 py-2 text-xs font-bold cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-sand-border px-3.5 py-2 text-xs font-bold cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print GST Summary
          </button>
        </div>
      </div>

      {/* GST Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-sand-border p-4 space-y-1">
          <p className="text-xs font-bold uppercase text-ink-muted">Gross Revenue</p>
          <p className="text-2xl font-bold text-ink">{formatCurrency(totals.total)}</p>
          <p className="text-xs text-ink-muted">{rows.length} invoices</p>
        </div>
        <div className="rounded-2xl bg-white border border-sand-border p-4 space-y-1">
          <p className="text-xs font-bold uppercase text-ink-muted">Taxable Subtotal</p>
          <p className="text-2xl font-bold text-ink">{formatCurrency(totals.subtotal)}</p>
          <p className="text-xs text-ink-muted">Before 5% GST</p>
        </div>
        <div className="rounded-2xl bg-white border border-sand-border p-4 space-y-1">
          <p className="text-xs font-bold uppercase text-ink-muted">CGST (2.5%) + SGST (2.5%)</p>
          <p className="text-2xl font-bold text-banana-dark">{formatCurrency(totals.gst)}</p>
          <p className="text-xs text-ink-muted">
            {formatCurrency(cgst)} + {formatCurrency(sgst)}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-sand-border p-4 space-y-1">
          <p className="text-xs font-bold uppercase text-ink-muted">Discounts Given</p>
          <p className="text-2xl font-bold text-kumkum">{formatCurrency(totals.discounts)}</p>
          <p className="text-xs text-ink-muted">Coupons &amp; loyalty</p>
        </div>
      </div>

      {/* GST Invoice Table */}
      <div className="rounded-2xl bg-white border border-sand-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-cream-warm text-xs uppercase text-ink-muted border-b border-sand-border">
              <tr>
                <th className="py-3 px-4">Invoice / Order #</th>
                <th className="py-3 px-4">Date &amp; Guest</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Taxable ₹</th>
                <th className="py-3 px-4 text-right">CGST 2.5%</th>
                <th className="py-3 px-4 text-right">SGST 2.5%</th>
                <th className="py-3 px-4 text-right">Total ₹</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-ink-muted">
                    Loading report…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-ink-muted">
                    No invoices in this period.
                  </td>
                </tr>
              ) : (
                rows.map(({ order }) => {
                  const halfGst = Math.round((order.gst_amount / 2) * 100) / 100;
                  return (
                    <tr key={order.id}>
                      <td className="py-3 px-4 font-bold text-kumkum">
                        {order.order_number}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-ink">{order.customer_name}</p>
                        <p className="text-[11px] text-ink-muted">
                          {new Date(order.created_at).toLocaleString('en-IN')}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-xs uppercase font-semibold text-wood">
                        {order.order_type.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(order.subtotal)}
                      </td>
                      <td className="py-3 px-4 text-right text-ink-muted">
                        {formatCurrency(halfGst)}
                      </td>
                      <td className="py-3 px-4 text-right text-ink-muted">
                        {formatCurrency(halfGst)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-ink">
                        {formatCurrency(order.total_amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


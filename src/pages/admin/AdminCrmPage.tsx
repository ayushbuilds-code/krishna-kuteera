import { useCallback, useEffect, useMemo, useState } from 'react';
import { Award, Search, Star } from 'lucide-react';
import { formatCurrency } from '@/config/brand';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  fetchCrmDataAdmin,
  updateCateringEnquiryAdmin,
  updateReviewStatusAdmin,
  type CrmCustomerSummary,
} from '@/services/phase6Service';
import type { CateringEnquiry, EnquiryStatus, Review } from '@/types/database';

export function AdminCrmPage() {
  const { activeOutletId } = useAdminAuth();
  const [tab, setTab] = useState<'customers' | 'reviews' | 'catering'>('customers');
  const [customers, setCustomers] = useState<CrmCustomerSummary[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [enquiries, setEnquiries] = useState<CateringEnquiry[]>([]);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    const res = await fetchCrmDataAdmin(activeOutletId);
    setCustomers(res.customers);
    setReviews(res.reviews);
    setEnquiries(res.enquiries);
  }, [activeOutletId]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [customers, search]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-banana">
          Guest Relationships &amp; Feedback
        </p>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-kumkum">
          Customers (CRM), Reviews &amp; Catering
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'customers', label: `Customers (${customers.length})` },
          { id: 'reviews', label: `Reviews (${reviews.length})` },
          { id: 'catering', label: `Catering Quotes (${enquiries.length})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as typeof tab)}
            className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold cursor-pointer ${
              tab === t.id
                ? 'bg-kumkum text-white'
                : 'bg-white border border-sand-border text-ink hover:bg-cream-warm'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'customers' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guest by name or mobile…"
              className="w-full rounded-xl border border-sand-border bg-white pl-10 pr-4 py-2 text-sm"
            />
          </div>

          <div className="rounded-2xl bg-white border border-sand-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-cream-warm text-xs uppercase text-ink-muted border-b border-sand-border">
                  <tr>
                    <th className="py-3 px-4">Guest</th>
                    <th className="py-3 px-4">Orders</th>
                    <th className="py-3 px-4">Lifetime Spend</th>
                    <th className="py-3 px-4">Loyalty Points</th>
                    <th className="py-3 px-4">Recent Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-border">
                  {filteredCustomers.map((cust) => (
                    <tr key={cust.id}>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-ink">{cust.full_name}</p>
                        <p className="text-xs text-ink-muted">{cust.phone}</p>
                      </td>
                      <td className="py-3 px-4 font-bold">{cust.ordersCount}</td>
                      <td className="py-3 px-4 font-bold text-banana-dark">
                        {formatCurrency(cust.totalSpent)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-turmeric-soft px-2.5 py-0.5 text-xs font-bold text-wood">
                          <Award className="w-3.5 h-3.5 text-turmeric-dark" />
                          {cust.loyalty_points} pts
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-ink-muted">
                        {cust.orders[0]
                          ? `${cust.orders[0].order.order_number} (${new Date(
                              cust.orders[0].order.created_at
                            ).toLocaleDateString('en-IN')})`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <article
              key={rev.id}
              className="rounded-2xl bg-white border border-sand-border p-5 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-ink">{rev.customer_name}</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star
                        key={idx}
                        className="w-3.5 h-3.5 fill-turmeric text-turmeric"
                      />
                    ))}
                  </div>
                </div>
                <select
                  aria-label={`Moderation status for ${rev.customer_name}`}
                  value={rev.status}
                  onChange={async (e) => {
                    const next = e.target.value as Review['status'];
                    await updateReviewStatusAdmin(rev.id, next);
                    load();
                  }}
                  className="rounded-lg border border-sand-border bg-cream px-2.5 py-1 text-xs font-bold"
                >
                  <option value="published">Published</option>
                  <option value="pending">Pending</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
              <p className="text-sm text-ink-muted">{rev.comment}</p>
            </article>
          ))}
        </div>
      )}

      {tab === 'catering' && (
        <div className="space-y-4">
          {enquiries.length === 0 ? (
            <div className="rounded-2xl bg-white border border-sand-border p-8 text-center text-sm text-ink-muted">
              No catering enquiries yet. Submissions from <code>/catering</code> appear here.
            </div>
          ) : (
            enquiries.map((enq) => (
              <div
                key={enq.id}
                className="rounded-2xl bg-white border border-sand-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="space-y-1">
                  <p className="text-xs font-bold text-kumkum">
                    {enq.enquiry_code} • {enq.event_type} ({enq.event_date})
                  </p>
                  <p className="font-bold text-ink">
                    {enq.contact_name} • {enq.phone} • {enq.guest_count} guests
                  </p>
                  <p className="text-xs text-ink-muted">
                    {enq.preferred_menu_notes}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    placeholder="Quote ₹"
                    defaultValue={enq.quoted_amount ?? ''}
                    onBlur={async (e) => {
                      const val = Number(e.target.value);
                      if (!Number.isNaN(val) && val > 0) {
                        await updateCateringEnquiryAdmin(enq.id, 'quoted', val);
                        load();
                      }
                    }}
                    className="w-28 rounded-xl border border-sand-border bg-cream px-3 py-1.5 text-xs font-bold"
                  />
                  <select
                    value={enq.status}
                    onChange={async (e) => {
                      await updateCateringEnquiryAdmin(
                        enq.id,
                        e.target.value as EnquiryStatus
                      );
                      load();
                    }}
                    className="rounded-xl border border-sand-border bg-cream px-3 py-1.5 text-xs font-bold"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="quoted">Quoted</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}


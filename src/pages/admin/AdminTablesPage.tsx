import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Check, Plus, Users, X } from 'lucide-react';
import { MOCK_OUTLETS } from '@/data/mockSeed';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  addWalkInReservation,
  fetchTablesAndReservations,
  updateReservationStatusAdmin,
  updateTableStatusAdmin,
} from '@/services/adminService';
import type {
  Reservation,
  ReservationStatus,
  RestaurantTable,
  TableStatus,
} from '@/types/database';

const TABLE_STATUS_STYLE: Record<TableStatus, string> = {
  available: 'bg-banana-soft border-banana/40 text-banana-dark',
  occupied: 'bg-kumkum-soft border-kumkum/40 text-kumkum',
  reserved: 'bg-turmeric-soft border-turmeric/60 text-wood',
  maintenance: 'bg-cream-warm border-sand-border text-ink-muted',
};

export function AdminTablesPage() {
  const { activeOutletId } = useAdminAuth();
  const targetOutletId =
    activeOutletId === 'all' ? MOCK_OUTLETS[0].id : activeOutletId;

  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInParty, setWalkInParty] = useState(4);
  const [walkInTableId, setWalkInTableId] = useState('');

  const load = useCallback(async () => {
    const data = await fetchTablesAndReservations(targetOutletId);
    setTables(data.tables);
    setReservations(data.reservations);
  }, [targetOutletId]);

  useEffect(() => {
    load();
  }, [load]);

  const cycleTableStatus = async (tbl: RestaurantTable) => {
    const order: TableStatus[] = ['available', 'occupied', 'reserved'];
    const next = order[(order.indexOf(tbl.status) + 1) % order.length];
    setTables((prev) =>
      prev.map((t) => (t.id === tbl.id ? { ...t, status: next } : t))
    );
    await updateTableStatusAdmin(tbl.id, next);
  };

  const handleReservationStatus = async (
    id: string,
    status: ReservationStatus
  ) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    await updateReservationStatusAdmin(id, status);
  };

  const handleWalkInSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim()) return;
    await addWalkInReservation({
      outletId: targetOutletId,
      customerName: walkInName.trim(),
      customerPhone: walkInPhone.trim(),
      partySize: walkInParty,
      tableId: walkInTableId || undefined,
    });
    setWalkInName('');
    setWalkInPhone('');
    setWalkInOpen(false);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-banana">
            Dining Hall &amp; Bookings
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-kumkum">
            Tables &amp; Reservations
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setWalkInOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-kumkum text-white px-4 py-2.5 text-xs font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Walk-In Party
        </button>
      </div>

      {/* Floor View */}
      <section className="rounded-2xl bg-white border border-sand-border p-5 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif text-lg font-bold text-ink">
            Floor View (Tap a table to cycle status)
          </h2>
          <div className="flex gap-2 text-[11px] font-bold">
            <span className="rounded-full bg-banana-soft text-banana-dark px-2.5 py-0.5">
              Available
            </span>
            <span className="rounded-full bg-kumkum-soft text-kumkum px-2.5 py-0.5">
              Occupied
            </span>
            <span className="rounded-full bg-turmeric-soft text-wood px-2.5 py-0.5">
              Reserved
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {tables.map((tbl) => (
            <button
              key={tbl.id}
              type="button"
              onClick={() => cycleTableStatus(tbl)}
              className={`rounded-2xl border-2 p-4 text-left transition-transform active:scale-95 cursor-pointer ${TABLE_STATUS_STYLE[tbl.status]}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-serif text-lg font-bold">
                  {tbl.table_number}
                </span>
                <span className="text-[10px] font-bold uppercase">
                  {tbl.zone.replace('_', '-')}
                </span>
              </div>
              <p className="text-xs mt-1 flex items-center gap-1 font-medium">
                <Users className="w-3.5 h-3.5" />
                {tbl.capacity} seats
              </p>
              <p className="text-[11px] font-bold uppercase mt-2">
                {tbl.status}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Reservations List */}
      <section className="rounded-2xl bg-white border border-sand-border p-5 space-y-4 shadow-xs">
        <h2 className="font-serif text-lg font-bold text-ink">
          Reservations &amp; Walk-Ins
        </h2>

        {reservations.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No reservations recorded yet for this outlet. Bookings from /reserve or walk-ins appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-ink-muted border-b border-sand-border">
                <tr>
                  <th className="py-2.5 pr-4">Code / Guest</th>
                  <th className="py-2.5 px-4">Date &amp; Slot</th>
                  <th className="py-2.5 px-4">Party</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-border">
                {reservations.map((res) => (
                  <tr key={res.id}>
                    <td className="py-3 pr-4">
                      <p className="font-bold text-kumkum">{res.reservation_code}</p>
                      <p className="text-xs font-semibold text-ink">
                        {res.customer_name} • {res.customer_phone}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-xs text-ink-muted">
                      {res.reservation_date} • {res.time_slot}
                    </td>
                    <td className="py-3 px-4 text-xs font-bold">
                      {res.party_size} ({res.seating_preference.toUpperCase()})
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-full bg-cream-warm px-2.5 py-0.5 text-xs font-bold uppercase text-wood">
                        {res.status}
                      </span>
                    </td>
                    <td className="py-3 pl-4 text-right space-x-1.5">
                      {res.status !== 'seated' && res.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => handleReservationStatus(res.id, 'seated')}
                          className="inline-flex items-center gap-1 rounded-lg bg-banana text-white px-2.5 py-1 text-xs font-bold cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          Seat
                        </button>
                      )}
                      {res.status !== 'cancelled' && res.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => handleReservationStatus(res.id, 'cancelled')}
                          className="rounded-lg border border-sand-border px-2.5 py-1 text-xs font-semibold text-kumkum cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Walk-In Modal */}
      {walkInOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleWalkInSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-sand-border"
          >
            <div className="flex items-center justify-between border-b border-sand-border pb-3">
              <h3 className="font-serif text-xl font-bold text-kumkum">
                Seat Walk-In Guests
              </h3>
              <button
                type="button"
                onClick={() => setWalkInOpen(false)}
                className="p-1 text-ink-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-ink-muted mb-1">
                  Guest Name *
                </label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="e.g. Suresh & Family"
                  className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-ink-muted mb-1">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-ink-muted mb-1">
                    Party Size
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={walkInParty}
                    onChange={(e) => setWalkInParty(Number(e.target.value))}
                    className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-ink-muted mb-1">
                  Assign Table
                </label>
                <select
                  value={walkInTableId}
                  onChange={(e) => setWalkInTableId(e.target.value)}
                  className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2"
                >
                  <option value="">Assign later</option>
                  {tables
                    .filter((t) => t.status === 'available')
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.table_number} ({t.zone.toUpperCase()} • {t.capacity} seats)
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWalkInOpen(false)}
                className="rounded-xl border border-sand-border px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-kumkum text-white px-5 py-2 text-xs font-bold cursor-pointer"
              >
                Seat Party
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}


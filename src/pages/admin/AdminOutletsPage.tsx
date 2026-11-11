import { useEffect, useState, type FormEvent } from 'react';
import { Building2, Clock, Edit3, Plus, X } from 'lucide-react';
import { formatTime12h } from '@/config/brand';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { fetchAllOutletsAdmin, saveOutletAdmin } from '@/services/adminService';
import type { Outlet } from '@/types/database';

export function AdminOutletsPage() {
  const { isOwner, activeOutletId } = useAdminAuth();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [editing, setEditing] = useState<Partial<Outlet> | null>(null);
  const [holidayInput, setHolidayInput] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const all = await fetchAllOutletsAdmin();
    setOutlets(
      isOwner ? all : all.filter((o) => o.id === activeOutletId)
    );
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwner, activeOutletId]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing?.name || !editing.locality || !editing.address || !editing.phone) {
      return;
    }
    setSaving(true);
    try {
      await saveOutletAdmin({
        ...editing,
        name: editing.name,
        locality: editing.locality,
        address: editing.address,
        phone: editing.phone,
      });
      setEditing(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const addHoliday = () => {
    if (!holidayInput || !editing) return;
    const current = editing.holiday_dates || [];
    if (!current.includes(holidayInput)) {
      setEditing({ ...editing, holiday_dates: [...current, holidayInput] });
    }
    setHolidayInput('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-banana">
            Multi-Outlet Configuration
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-kumkum">
            Outlets, Hours &amp; Holidays
          </h1>
        </div>

        {isOwner && (
          <button
            type="button"
            onClick={() =>
              setEditing({
                name: 'Krishna Kuteera — ',
                locality: '',
                address: '',
                phone: '+91 80 ',
                opening_time: '07:30',
                closing_time: '22:30',
                seating_ac: true,
                seating_non_ac: true,
                is_active: true,
                holiday_dates: [],
              })
            }
            className="inline-flex items-center gap-1.5 rounded-xl bg-kumkum text-white px-4 py-2.5 text-xs font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Outlet
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {outlets.map((outlet) => (
          <article
            key={outlet.id}
            className="rounded-2xl bg-white border border-sand-border p-5 space-y-3 shadow-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-kumkum shrink-0" />
                <h2 className="font-serif text-lg font-bold text-ink leading-snug">
                  {outlet.locality}
                </h2>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  outlet.is_active
                    ? 'bg-banana-soft text-banana-dark'
                    : 'bg-kumkum-soft text-kumkum'
                }`}
              >
                {outlet.is_active ? 'Active' : 'Disabled'}
              </span>
            </div>

            <p className="text-xs text-ink-muted">{outlet.address}</p>

            <div className="text-xs space-y-1 text-ink">
              <p className="flex items-center gap-1.5 font-semibold">
                <Clock className="w-3.5 h-3.5 text-turmeric-dark" />
                {formatTime12h(outlet.opening_time)} –{' '}
                {formatTime12h(outlet.closing_time)}
              </p>
              <p>Phone: {outlet.phone}</p>
              <p>
                Holidays:{' '}
                {outlet.holiday_dates?.length
                  ? outlet.holiday_dates.join(', ')
                  : 'None scheduled'}
              </p>
            </div>

            <div className="pt-2 border-t border-sand-border flex justify-between items-center">
              <button
                type="button"
                onClick={() => setEditing(outlet)}
                className="inline-flex items-center gap-1 rounded-xl bg-cream-warm hover:bg-turmeric-soft px-3 py-1.5 text-xs font-bold text-ink cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Hours &amp; Info
              </button>

              {isOwner && (
                <button
                  type="button"
                  onClick={async () => {
                    await saveOutletAdmin({
                      ...outlet,
                      is_active: !outlet.is_active,
                    });
                    load();
                  }}
                  className="text-xs font-bold text-kumkum hover:underline cursor-pointer"
                >
                  {outlet.is_active ? 'Disable' : 'Enable'}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Edit Outlet Modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-sand-border max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-sand-border pb-3">
              <h2 className="font-serif text-xl font-bold text-kumkum">
                {editing.id ? 'Edit Outlet' : 'Add Outlet'}
              </h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="p-1 text-ink-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-ink-muted mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={editing.name || ''}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-ink-muted mb-1">
                    Locality *
                  </label>
                  <input
                    type="text"
                    required
                    value={editing.locality || ''}
                    onChange={(e) =>
                      setEditing({ ...editing, locality: e.target.value })
                    }
                    className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-ink-muted mb-1">
                    Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={editing.phone || ''}
                    onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                    className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-ink-muted mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={editing.address || ''}
                  onChange={(e) =>
                    setEditing({ ...editing, address: e.target.value })
                  }
                  className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-ink-muted mb-1">
                    Opening Time
                  </label>
                  <input
                    type="time"
                    value={(editing.opening_time || '07:30').slice(0, 5)}
                    onChange={(e) =>
                      setEditing({ ...editing, opening_time: e.target.value })
                    }
                    className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-ink-muted mb-1">
                    Closing Time
                  </label>
                  <input
                    type="time"
                    value={(editing.closing_time || '22:30').slice(0, 5)}
                    onChange={(e) =>
                      setEditing({ ...editing, closing_time: e.target.value })
                    }
                    className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2"
                  />
                </div>
              </div>

              {/* Holiday Dates */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase text-ink-muted">
                  Scheduled Holiday Dates
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={holidayInput}
                    onChange={(e) => setHolidayInput(e.target.value)}
                    className="rounded-xl border border-sand-border bg-cream px-3 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={addHoliday}
                    className="rounded-xl bg-banana text-white px-3 py-1.5 text-xs font-bold cursor-pointer"
                  >
                    Add Holiday
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(editing.holiday_dates || []).map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center gap-1 rounded-full bg-cream-warm px-2.5 py-0.5 text-xs font-semibold"
                    >
                      {d}
                      <button
                        type="button"
                        onClick={() =>
                          setEditing({
                            ...editing,
                            holiday_dates: (editing.holiday_dates || []).filter(
                              (x) => x !== d
                            ),
                          })
                        }
                        className="text-kumkum cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-sand-border">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-xl border border-sand-border px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-kumkum text-white px-5 py-2 text-xs font-bold cursor-pointer"
              >
                {saving ? 'Saving…' : 'Save Outlet'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}


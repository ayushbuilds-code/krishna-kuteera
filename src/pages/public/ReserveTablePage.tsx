import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  Users,
} from 'lucide-react';
import { BRAND, formatTime12h } from '@/config/brand';
import { useOutlet } from '@/context/OutletContext';
import {
  createReservation,
  fetchSlotAvailability,
  RESERVATION_TIME_SLOTS,
  type SlotAvailability,
} from '@/services/reservationService';
import type { Reservation, TableZone } from '@/types/database';

function todayIsoDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

export function ReserveTablePage() {
  const [searchParams] = useSearchParams();
  const { outlets, selectedOutlet, selectOutletBySlug } = useOutlet();

  const [outletId, setOutletId] = useState<string>('');
  const [date, setDate] = useState<string>(todayIsoDate);
  const [partySize, setPartySize] = useState<number>(4);
  const [timeSlot, setTimeSlot] = useState<string>('19:00');
  const [seatingPref, setSeatingPref] = useState<TableZone | 'any'>('any');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');

  const [slots, setSlots] = useState<SlotAvailability[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Reservation | null>(null);

  useEffect(() => {
    const paramSlug = searchParams.get('outlet');
    if (paramSlug) {
      selectOutletBySlug(paramSlug);
    }
  }, [searchParams, selectOutletBySlug]);

  useEffect(() => {
    if (!outletId && selectedOutlet) {
      setOutletId(selectedOutlet.id);
    }
  }, [outletId, selectedOutlet]);

  const activeOutlet = useMemo(
    () => outlets.find((o) => o.id === outletId) ?? selectedOutlet ?? outlets[0],
    [outlets, outletId, selectedOutlet]
  );

  const isHoliday = Boolean(activeOutlet?.holiday_dates?.includes(date));

  useEffect(() => {
    if (!activeOutlet || !date) return;
    let active = true;
    (async () => {
      setLoadingSlots(true);
      const data = await fetchSlotAvailability(
        activeOutlet.id,
        date,
        activeOutlet.max_guests_per_slot
      );
      if (active) {
        setSlots(data);
        setLoadingSlots(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [activeOutlet, date]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!activeOutlet) return;

    if (isHoliday) {
      setErrorMsg('This outlet is closed on the selected holiday date.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (customerName.trim().length < 2) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (channel === 'email' && !customerEmail.trim()) {
      setErrorMsg('Please provide your email address for email confirmation.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createReservation({
        outletId: activeOutlet.id,
        maxGuestsPerSlot: activeOutlet.max_guests_per_slot,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: customerEmail.trim() || undefined,
        reservationDate: date,
        timeSlot,
        partySize,
        seatingPreference: seatingPref,
        specialRequests: specialRequests.trim() || undefined,
        notificationChannel: channel,
      });
      setConfirmed(res);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to book table.');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed && activeOutlet) {
    const slotLabel =
      RESERVATION_TIME_SLOTS.find((s) => s.value === confirmed.time_slot)?.label ??
      confirmed.time_slot;
    const whatsappText = encodeURIComponent(
      `Namaskara! Table reservation confirmed at ${activeOutlet.name}.\nCode: ${confirmed.reservation_code}\nDate: ${confirmed.reservation_date} at ${slotLabel}\nGuests: ${confirmed.party_size}\nName: ${confirmed.customer_name}`
    );

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="rounded-3xl bg-white border border-sand-border p-8 space-y-6 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-banana-soft text-banana mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-banana">
              Table Reserved • {confirmed.reservation_code}
            </p>
            <h1 className="font-serif text-3xl font-bold text-kumkum">
              We Look Forward to Hosting You!
            </h1>
            <p className="text-sm text-ink-muted">
              Confirmation queued via{' '}
              <strong className="uppercase">{confirmed.notification_channel}</strong> to{' '}
              {confirmed.notification_channel === 'email'
                ? confirmed.customer_email
                : `+91 ${confirmed.customer_phone}`}
              .
            </p>
          </div>

          <div className="rounded-2xl bg-cream border border-sand-border p-5 text-left text-sm space-y-2">
            <p>
              <strong>Outlet:</strong> {activeOutlet.name}
            </p>
            <p>
              <strong>Date &amp; Time:</strong> {confirmed.reservation_date} at {slotLabel}
            </p>
            <p>
              <strong>Party Size:</strong> {confirmed.party_size} guests (
              {confirmed.seating_preference.toUpperCase()} seating)
            </p>
            {confirmed.special_requests && (
              <p>
                <strong>Notes:</strong> {confirmed.special_requests}
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={`https://wa.me/${BRAND.contact.whatsappNumber}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-banana hover:bg-banana-dark text-white px-5 py-2.5 text-sm font-bold"
            >
              <MessageSquare className="w-4 h-4" />
              Save / Share on WhatsApp
            </a>
            <Link
              to={`/menu?outlet=${activeOutlet.slug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-kumkum text-white px-5 py-2.5 text-sm font-bold"
            >
              Browse Outlet Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <header className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-banana">
          Family &amp; Group Dining
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-kumkum">
          Reserve a Table
        </h1>
        <p className="text-sm sm:text-base text-ink-muted max-w-2xl">
          Skip the weekend wait. Pick your outlet, date, and time slot — live seat capacity
          prevents overbooking automatically.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          {/* Outlet, Date & Party Size */}
          <section className="rounded-2xl bg-white border border-sand-border p-5 space-y-4 shadow-xs">
            <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
              <MapPin className="w-4 h-4 text-kumkum" />
              1. Select Outlet, Date &amp; Guests
            </h2>

            <div>
              <label
                htmlFor="res-outlet"
                className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1"
              >
                Bengaluru Outlet
              </label>
              <select
                id="res-outlet"
                value={activeOutlet?.id || ''}
                onChange={(e) => setOutletId(e.target.value)}
                className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm font-semibold"
              >
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({formatTime12h(o.opening_time)} – {formatTime12h(o.closing_time)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="res-date"
                  className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1"
                >
                  Reservation Date
                </label>
                <input
                  id="res-date"
                  type="date"
                  min={todayIsoDate()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm font-semibold"
                />
              </div>

              <div>
                <label
                  htmlFor="res-party"
                  className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1"
                >
                  Party Size
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    id="res-party"
                    value={partySize}
                    onChange={(e) => setPartySize(Number(e.target.value))}
                    className="w-full rounded-xl border border-sand-border bg-cream pl-9 pr-3.5 py-2.5 text-sm font-semibold"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Seating Preference */}
            {activeOutlet && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                  Seating Preference
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'any', label: 'Any Available', show: true },
                    { id: 'ac', label: 'AC Dining', show: activeOutlet.seating_ac },
                    { id: 'non_ac', label: 'Non-AC Hall', show: activeOutlet.seating_non_ac },
                    { id: 'outdoor', label: 'Outdoor Garden', show: activeOutlet.seating_outdoor },
                  ]
                    .filter((opt) => opt.show)
                    .map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSeatingPref(opt.id as TableZone | 'any')}
                        className={`rounded-xl px-3.5 py-2 text-xs font-bold border transition-colors cursor-pointer ${
                          seatingPref === opt.id
                            ? 'bg-kumkum text-white border-kumkum'
                            : 'bg-cream text-ink border-sand-border hover:bg-cream-warm'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </section>

          {/* Time Slots */}
          <section className="rounded-2xl bg-white border border-sand-border p-5 space-y-3 shadow-xs">
            <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
              <Clock className="w-4 h-4 text-turmeric-dark" />
              2. Pick Available Time Slot
            </h2>

            {isHoliday ? (
              <p className="rounded-xl bg-kumkum-soft text-kumkum p-3 text-xs font-semibold">
                Selected outlet has a scheduled holiday on {date}. Please choose another date.
              </p>
            ) : loadingSlots ? (
              <div className="grid grid-cols-3 gap-2.5 animate-pulse">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-14 bg-cream-warm rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {RESERVATION_TIME_SLOTS.map((slotMeta) => {
                  const avail = slots.find((s) => s.time_slot === slotMeta.value);
                  const remaining =
                    avail?.remaining_guests ?? activeOutlet?.max_guests_per_slot ?? 40;
                  const disabled = remaining < partySize;
                  const selected = timeSlot === slotMeta.value;

                  return (
                    <button
                      key={slotMeta.value}
                      type="button"
                      disabled={disabled}
                      onClick={() => setTimeSlot(slotMeta.value)}
                      className={`rounded-xl border p-2.5 text-left transition-all ${
                        disabled
                          ? 'bg-cream-warm/60 border-sand-border opacity-50 cursor-not-allowed'
                          : selected
                            ? 'bg-banana text-white border-banana shadow-xs cursor-pointer'
                            : 'bg-cream border-sand-border hover:bg-turmeric-soft cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">{slotMeta.label}</span>
                        <span
                          className={`text-[10px] font-semibold uppercase ${
                            selected ? 'text-turmeric-soft' : 'text-ink-muted'
                          }`}
                        >
                          {slotMeta.meal}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] mt-0.5 ${
                          selected ? 'text-white/90' : 'text-banana-dark font-medium'
                        }`}
                      >
                        {disabled ? 'Slot full' : `${remaining} seats left`}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Guest Contact & Confirmation Channel */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl bg-white border border-sand-border p-5 space-y-4 shadow-xs sticky top-24">
            <h2 className="font-serif text-lg font-bold text-ink">
              3. Guest Details &amp; Confirmation
            </h2>

            <div>
              <label
                htmlFor="res-name"
                className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1"
              >
                Full Name *
              </label>
              <input
                id="res-name"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="res-phone"
                className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1"
              >
                10-Digit Mobile *
              </label>
              <input
                id="res-phone"
                type="tel"
                required
                maxLength={13}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="98450 12345"
                className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="res-email"
                className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1"
              >
                Email {channel === 'email' ? '*' : '(optional)'}
              </label>
              <input
                id="res-email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                Confirm Via
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(['whatsapp', 'sms', 'email'] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChannel(ch)}
                    className={`rounded-xl py-2 text-xs font-bold uppercase border cursor-pointer ${
                      channel === ch
                        ? 'bg-kumkum text-white border-kumkum'
                        : 'bg-cream text-ink border-sand-border'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="res-notes"
                className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1"
              >
                Special Requests (optional)
              </label>
              <input
                id="res-notes"
                type="text"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. High chair for baby, senior citizen ground-floor seating"
                className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm"
              />
            </div>

            {errorMsg && (
              <p className="rounded-xl bg-kumkum-soft border border-kumkum/30 p-3 text-xs font-semibold text-kumkum">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || isHoliday}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-kumkum hover:bg-kumkum-dark disabled:opacity-60 text-white py-3.5 text-sm font-bold shadow-sm cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              {submitting ? 'Booking Table…' : `Confirm Table for ${partySize}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}


import { useState, type FormEvent } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  MessageSquare,
  Phone,
  Sparkles,
  Users,
} from 'lucide-react';
import { BRAND } from '@/config/brand';
import { useOutlet } from '@/context/OutletContext';
import { PureVegBadge } from '@/components/PureVegBadge';
import { submitCateringEnquiry } from '@/services/reservationService';
import type { CateringEnquiry } from '@/types/database';

const CATERING_PACKAGES = [
  'Live Dosa & Tiffin Counter',
  'Traditional Banana Leaf Meal (Bhojana)',
  'Corporate Breakfast / Packed Tiffin Boxes',
  'Festive Pure Ghee Sweet & Savoury Hampers',
  'Evening Chaat & Filter Coffee Station',
];

const EVENT_TYPES = [
  'Housewarming / Gruhapravesha',
  'Wedding / Engagement / Upanayanam',
  'Corporate Office Event',
  'Birthday / Naming Ceremony',
  'Temple / Community Pooja',
];

export function CateringPage() {
  const { outlets } = useOutlet();

  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState(50);
  const [outletId, setOutletId] = useState(outlets[0]?.id || '');
  const [venueAddress, setVenueAddress] = useState('');
  const [selectedPackages, setSelectedPackages] = useState<string[]>([
    CATERING_PACKAGES[0],
  ]);
  const [customNotes, setCustomNotes] = useState('');
  const [budget, setBudget] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<CateringEnquiry | null>(null);

  const togglePackage = (pkg: string) => {
    setSelectedPackages((prev) =>
      prev.includes(pkg) ? prev.filter((p) => p !== pkg) : [...prev, pkg]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleanPhone = phone.replace(/\D/g, '');
    if (contactName.trim().length < 2) {
      setErrorMsg('Please enter your contact name.');
      return;
    }
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!eventDate) {
      setErrorMsg('Please select an event date.');
      return;
    }
    if (guestCount < 15) {
      setErrorMsg('Minimum guest count for catering quote is 15.');
      return;
    }

    setSubmitting(true);
    try {
      const combinedNotes = [
        selectedPackages.length > 0
          ? `Requested Packages: ${selectedPackages.join(', ')}`
          : '',
        customNotes.trim(),
      ]
        .filter(Boolean)
        .join('\n');

      const record = await submitCateringEnquiry({
        outletId: outletId || undefined,
        contactName: contactName.trim(),
        phone: cleanPhone,
        email: email.trim() || undefined,
        eventType,
        eventDate,
        guestCount,
        venueAddress: venueAddress.trim(),
        preferredMenuNotes: combinedNotes,
        estimatedBudget: budget ? Number(budget) : undefined,
      });
      setSubmitted(record);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit enquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const whatsappMsg = encodeURIComponent(
      `Namaskara! Catering quote request ${submitted.enquiry_code} submitted.\nEvent: ${submitted.event_type} on ${submitted.event_date}\nGuests: ${submitted.guest_count}\nName: ${submitted.contact_name}`
    );

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="rounded-3xl bg-white border border-sand-border p-8 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-banana-soft text-banana mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-banana">
            Quote Request Logged • {submitted.enquiry_code}
          </p>
          <h1 className="font-serif text-3xl font-bold text-kumkum">
            Our Catering Manager Will Call You Within 2 Hours
          </h1>
          <p className="text-sm text-ink-muted">
            Workflow: <strong>1. Quote Requested</strong> → 2. Menu Tasting / Customization →
            3. Formal Per-Plate Quote → 4. Booking Confirmed.
          </p>
          <div className="rounded-2xl bg-cream border border-sand-border p-5 text-left text-sm space-y-1.5">
            <p><strong>Event:</strong> {submitted.event_type}</p>
            <p><strong>Date:</strong> {submitted.event_date}</p>
            <p><strong>Guests:</strong> {submitted.guest_count}</p>
            <p><strong>Menu Preferences:</strong> {submitted.preferred_menu_notes || 'To be discussed'}</p>
          </div>
          <a
            href={`https://wa.me/${BRAND.contact.whatsappNumber}?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-banana hover:bg-banana-dark text-white px-5 py-3 text-sm font-bold"
          >
            <MessageSquare className="w-4 h-4" />
            Chat Immediately on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <header className="rounded-3xl card-surface p-7 sm:p-10 space-y-4 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-kumkum/8 blur-3xl"
        />
        <div className="relative space-y-4">
          <div className="inline-flex items-center rounded-full bg-cream border border-ink/8 px-3.5 py-1.5">
            <PureVegBadge label="100% Pure Veg Event Catering" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ink">
            Bulk Orders &amp; Event Catering
          </h1>
          <p className="text-ink-muted max-w-2xl text-sm sm:text-base leading-relaxed">
            From 25-box office breakfasts to 1,000-guest Gruhapravesha &amp; wedding banana-leaf
            feasts across Bengaluru — request a custom quote tailored to your menu and budget.
          </p>
          <p className="text-xs sm:text-sm text-kumkum font-semibold flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Direct Catering Desk: {BRAND.contact.cateringPhone}
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 rounded-3xl card-surface p-6 sm:p-7 space-y-5">
          <h2 className="font-serif text-xl font-bold text-ink flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-kumkum" />
            Request a Custom Catering Quote
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
                Event Type *
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm font-semibold"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
                Event Date *
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
                Estimated Guests (min 15) *
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min={15}
                  max={5000}
                  required
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-sand-border bg-cream pl-9 pr-3.5 py-2.5 text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
                Nearest Kitchen Outlet
              </label>
              <select
                value={outletId}
                onChange={(e) => setOutletId(e.target.value)}
                className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm font-semibold"
              >
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>{o.locality}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
              Select Menu Formats Needed
            </p>
            <div className="flex flex-wrap gap-2">
              {CATERING_PACKAGES.map((pkg) => {
                const active = selectedPackages.includes(pkg);
                return (
                  <button
                    key={pkg}
                    type="button"
                    onClick={() => togglePackage(pkg)}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold border transition-colors cursor-pointer ${
                      active
                        ? 'bg-banana text-white border-banana'
                        : 'bg-cream text-ink border-sand-border hover:bg-cream-warm'
                    }`}
                  >
                    {pkg}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
              Venue Locality / Address in Bengaluru *
            </label>
            <input
              type="text"
              required
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="e.g. Bannerghatta Road Party Hall / Jayanagar"
              className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
              Dish Requests / Jain / No-Onion-Garlic Notes
            </label>
            <textarea
              rows={3}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Need 100% no-onion-no-garlic menu with Rava Idli, Chow Chow Bath, Bele Obbattu & Filter Coffee."
              className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl bg-white border border-sand-border p-6 space-y-4 shadow-xs sticky top-24">
            <h2 className="font-serif text-xl font-bold text-ink flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-turmeric-dark" />
              Your Contact Details
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
                Contact Name *
              </label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
                10-Digit Mobile *
              </label>
              <input
                type="tel"
                required
                maxLength={13}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98450 12345"
                className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
                Email (for PDF quote)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-sand-border bg-cream px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1">
                Approx. Total Budget ₹ (optional)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 25000"
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
              disabled={submitting}
              className="w-full rounded-xl bg-kumkum hover:bg-kumkum-dark disabled:opacity-60 text-white py-3.5 text-sm font-bold shadow-sm cursor-pointer"
            >
              {submitting ? 'Submitting Quote Request…' : 'Request Catering Quote'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}


import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { BRAND } from '@/config/brand';
import { PureVegBadge } from '@/components/PureVegBadge';
import { useOutlet } from '@/context/OutletContext';

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <PureVegBadge label="Our Heritage" />
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-kumkum">
        About {BRAND.name}
      </h1>
      <p className="text-ink-muted leading-relaxed">
        {BRAND.name} ({BRAND.kannadaName}) began as a warm neighbourhood pure-vegetarian South
        Indian tiffin and family dining house in Bengaluru. From crispy morning benne dosas and
        pillow-soft mallige idlis to traditional banana-leaf meals and freshly brewed
        Chikmagalur filter coffee, every dish is prepared fresh daily without artificial colours
        or preservatives.
      </p>
      <div className="rounded-2xl bg-white border border-sand-border p-6 space-y-2">
        <h2 className="font-serif text-xl font-bold text-ink">Our Promise</h2>
        <ul className="list-disc pl-5 text-sm text-ink-muted space-y-1.5">
          <li>100% Pure Vegetarian kitchen with dedicated Jain and No-Onion/No-Garlic options.</li>
          <li>Pure Nandini ghee and freshly stone-ground batters every morning.</li>
          <li>Consistent warmth across Hulimavu, JP Nagar 7th Phase, and Jayanagar 4th Block.</li>
        </ul>
      </div>
    </div>
  );
}

export function ContactPage() {
  const { outlets } = useOutlet();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-kumkum">
          Contact {BRAND.name}
        </h1>
        <p className="text-ink-muted mt-1">
          Reach out for feedback, bulk orders, table bookings, or outlet inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-sand-border p-5 space-y-2">
          <Phone className="w-5 h-5 text-kumkum" />
          <h2 className="font-serif font-bold text-lg">Central Guest Line</h2>
          <p className="text-sm text-ink-muted">{BRAND.contact.primaryPhone}</p>
        </div>
        <div className="rounded-2xl bg-white border border-sand-border p-5 space-y-2">
          <Mail className="w-5 h-5 text-banana" />
          <h2 className="font-serif font-bold text-lg">Email Support</h2>
          <p className="text-sm text-ink-muted">{BRAND.contact.email}</p>
        </div>
        <div className="rounded-2xl bg-white border border-sand-border p-5 space-y-2">
          <MapPin className="w-5 h-5 text-turmeric-dark" />
          <h2 className="font-serif font-bold text-lg">Headquarters</h2>
          <p className="text-sm text-ink-muted">{BRAND.contact.headquartersAddress}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {outlets.map((o) => (
          <div key={o.id} className="rounded-2xl bg-white border border-sand-border p-5 space-y-2">
            <h3 className="font-serif font-bold text-base text-kumkum">{o.locality}</h3>
            <p className="text-xs text-ink-muted">{o.address}</p>
            <p className="text-xs font-semibold text-ink">{o.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FaqPage() {
  const faqs = [
    {
      q: 'Is Krishna Kuteera 100% pure vegetarian?',
      a: 'Yes. Every dish across all outlets and KK Bakers counters is 100% pure vegetarian, with eggless baking and dedicated Jain / no-onion-no-garlic choices.',
    },
    {
      q: 'Do menu prices or items differ between outlets?',
      a: 'Yes, each outlet manages its own timings, specials, and live availability. Use the outlet switcher at the top of the Menu page to view exact pricing for your branch.',
    },
    {
      q: 'Can I pre-order celebration cakes from KK Bakers?',
      a: 'Yes! Hulimavu and Jayanagar outlets feature KK Bakers counters where 100% eggless celebration cakes can be pre-ordered at least 24 hours in advance.',
    },
    {
      q: 'How does table reservation work?',
      a: 'Choose your outlet, date, time slot, and party size on the Reserve Table page. Live slot capacity prevents overbooking.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-kumkum">
        Frequently Asked Questions
      </h1>
      <div className="space-y-4">
        {faqs.map((item) => (
          <div key={item.q} className="rounded-2xl bg-white border border-sand-border p-5 space-y-1.5">
            <h2 className="font-serif text-lg font-bold text-ink">{item.q}</h2>
            <p className="text-sm text-ink-muted leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LegalPage({ type }: { type: 'privacy' | 'terms' | 'refund' }) {
  const titles = {
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    refund: 'Cancellation & Refund Policy',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-5">
      <h1 className="font-serif text-3xl font-bold text-kumkum">{titles[type]}</h1>
      <div className="rounded-2xl bg-white border border-sand-border p-6 space-y-3 text-sm text-ink-muted leading-relaxed">
        <p>
          <strong className="text-ink">{BRAND.legal.legalEntityName}</strong> respects your
          privacy and collects only the contact and order details required to prepare your food,
          confirm table reservations, and award loyalty points.
        </p>
        {type === 'refund' && (
          <p>
            Online pickup and delivery orders may be cancelled for a full refund before the
            kitchen begins preparation. Approved refunds are processed back to the original
            Razorpay payment method within 5–7 business days.
          </p>
        )}
        {type === 'terms' && (
          <p>
            All menu items are subject to daily outlet availability. GST (5%) applies as per
            Government of India restaurant service regulations.
          </p>
        )}
        {type === 'privacy' && (
          <p>
            Payment details are processed securely via Razorpay; {BRAND.name} never stores
            raw card or UPI credentials on our servers.
          </p>
        )}
      </div>
    </div>
  );
}

export function UpcomingPhasePage({
  title,
  phaseNumber,
  description,
}: {
  title: string;
  phaseNumber: number;
  description: string;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <div className="rounded-3xl bg-white border border-sand-border p-8 text-center space-y-4 shadow-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-turmeric-soft px-3.5 py-1 text-xs font-bold text-turmeric-dark">
          {phaseNumber >= 5 ? (
            <ShieldCheck className="w-3.5 h-3.5" />
          ) : (
            <Clock className="w-3.5 h-3.5" />
          )}
          Scheduled for Phase {phaseNumber}
        </span>
        <h1 className="font-serif text-3xl font-bold text-kumkum">{title}</h1>
        <p className="text-sm sm:text-base text-ink-muted max-w-lg mx-auto">
          {description}
        </p>
        <div className="pt-2">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 rounded-xl bg-kumkum text-white px-5 py-2.5 text-sm font-bold"
          >
            Browse Menu Meanwhile <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}


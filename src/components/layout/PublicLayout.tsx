import { useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  CalendarCheck,
  ChevronDown,
  MapPin,
  Menu as MenuIcon,
  Phone,
  Shield,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { BRAND } from '@/config/brand';
import { BrandLogo } from '@/components/BrandLogo';
import { PureVegBadge } from '@/components/PureVegBadge';
import { CartDrawer } from '@/components/CartDrawer';
import { useOutlet } from '@/context/OutletContext';
import { useCart } from '@/context/CartContext';

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { outlets, selectedOutlet, selectOutletById, siteContent } = useOutlet();
  const { totalItems, setIsCartOpen } = useCart();
  const location = useLocation();

  const announcement = siteContent['announcement_bar'];

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/outlets', label: 'Outlets' },
    ...(BRAND.features.enableBakerySection
      ? [{ to: '/bakery', label: 'KK Bakers' }]
      : []),
    { to: '/reserve', label: 'Reserve' },
    { to: '/catering', label: 'Catering' },
    { to: '/track-order', label: 'Track Order' },
  ];

  const isNavActive = (to: string) => {
    if (to.includes('?')) {
      return `${location.pathname}${location.search}` === to;
    }
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink pb-28 md:pb-0 overflow-x-hidden">
      {/* Slim Editorial Announcement Strip */}
      <div className="bg-ink text-cream/90 text-[11px] sm:text-xs font-medium py-2 px-4 text-center border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-turmeric" />
            {announcement?.title ||
              `Fresh Tiffins & Filter Coffee from 7:30 AM • ${BRAND.pureVegLabel}`}
          </span>
          {announcement?.subtitle && (
            <span className="inline-flex items-center rounded-full bg-turmeric/15 border border-turmeric/30 text-turmeric px-2.5 py-0.5 text-[11px] font-semibold">
              {announcement.subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Modern Frosted Glass Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-xl border-b border-ink/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-[72px] flex items-center justify-between gap-4">
          <Link
            to="/"
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-kumkum rounded-xl"
            aria-label={`${BRAND.name} Home`}
          >
            <BrandLogo variant="dark" size="sm" />
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center gap-1 rounded-full bg-cream-warm/70 border border-ink/6 p-1"
            aria-label="Primary"
          >
            {navItems.map((item) => {
              const active = isNavActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
                    active
                      ? 'bg-white text-kumkum shadow-xs'
                      : 'text-ink-muted hover:text-ink hover:bg-white/60'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Outlet Selector + Cart + Mobile Menu */}
          <div className="flex items-center gap-2.5">
            {outlets.length > 0 && selectedOutlet && (
              <div className="relative hidden sm:block">
                <MapPin
                  className="w-3.5 h-3.5 text-banana absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <select
                  aria-label="Select Krishna Kuteera outlet"
                  value={selectedOutlet.id}
                  onChange={(e) => selectOutletById(e.target.value)}
                  className="appearance-none bg-white hover:bg-cream-warm/60 text-ink text-xs font-semibold rounded-full pl-8 pr-8 py-2 border border-ink/12 shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-kumkum cursor-pointer max-w-[190px] truncate transition-colors"
                >
                  {outlets.map((outlet) => (
                    <option key={outlet.id} value={outlet.id} className="text-ink bg-white">
                      {outlet.locality}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="w-3.5 h-3.5 text-ink-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open cart (${totalItems} items)`}
              className="relative inline-flex items-center gap-2 rounded-full bg-kumkum hover:bg-kumkum-dark text-white px-4 py-2 text-xs sm:text-[13px] font-semibold shadow-sm transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-turmeric" />
              <span className="hidden sm:inline">Order</span>
              {totalItems > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 rounded-full bg-turmeric text-ink px-1.5 text-[11px] font-bold tabular-nums">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-full bg-white border border-ink/10 text-ink hover:bg-cream-warm transition-colors"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile 1-Tap Outlet Strip (visible on < sm screens) */}
        {outlets.length > 0 && selectedOutlet && (
          <div className="sm:hidden border-t border-ink/6 bg-cream-warm/80 px-4 py-1.5 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted shrink-0">
              <MapPin className="w-3.5 h-3.5 text-banana" />
              Outlet:
            </span>
            <select
              aria-label="Mobile outlet selector"
              value={selectedOutlet.id}
              onChange={(e) => selectOutletById(e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-xs font-semibold text-ink focus:outline-none truncate text-right"
            >
              {outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.locality}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-ink/8 px-4 py-4 space-y-3 shadow-lg">
            {outlets.length > 0 && selectedOutlet && (
              <div className="space-y-1.5">
                <label
                  htmlFor="mobile-outlet-select"
                  className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted"
                >
                  Active Bengaluru Outlet
                </label>
                <select
                  id="mobile-outlet-select"
                  value={selectedOutlet.id}
                  onChange={(e) => selectOutletById(e.target.value)}
                  className="w-full rounded-xl bg-cream border border-ink/12 text-ink px-3 py-2.5 text-sm font-semibold"
                >
                  {outlets.map((outlet) => (
                    <option key={outlet.id} value={outlet.id}>
                      {outlet.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <nav className="grid grid-cols-2 gap-2" aria-label="Mobile Navigation">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                    isNavActive(item.to)
                      ? 'bg-kumkum text-white'
                      : 'bg-cream text-ink hover:bg-cream-warm'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Modern Minimal Dark Footer */}
      <footer className="bg-ink text-cream mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <BrandLogo variant="light" size="sm" />
            <p className="text-sm text-cream/70 leading-relaxed">
              {BRAND.subTagline}
            </p>
            <div className="inline-flex items-center rounded-full bg-white/10 border border-white/10 px-3 py-1">
              <PureVegBadge label="100% Pure Vegetarian" className="text-cream" />
            </div>
          </div>

          <div className="space-y-3.5">
            <h3 className="font-serif text-base font-semibold text-white">
              Bengaluru Kitchens
            </h3>
            <ul className="space-y-2.5 text-sm text-cream/75">
              {outlets.map((outlet) => (
                <li key={outlet.id}>
                  <Link
                    to={`/outlets/${outlet.slug}`}
                    className="hover:text-turmeric transition-colors block group"
                  >
                    <span className="font-medium text-cream group-hover:text-turmeric">
                      {outlet.locality}
                    </span>
                    <span className="block text-xs text-cream/55">{outlet.phone}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3.5">
            <h3 className="font-serif text-base font-semibold text-white">
              Explore
            </h3>
            <ul className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-sm text-cream/75">
              <li><Link to="/menu?category=breakfast" className="hover:text-turmeric transition-colors">Breakfast</Link></li>
              <li><Link to="/reserve" className="hover:text-turmeric transition-colors">Book a Table</Link></li>
              <li><Link to="/catering" className="hover:text-turmeric transition-colors">Catering</Link></li>
              <li><Link to="/track-order" className="hover:text-turmeric transition-colors">Track Order</Link></li>
              <li><Link to="/about" className="hover:text-turmeric transition-colors">Our Story</Link></li>
              <li><Link to="/contact" className="hover:text-turmeric transition-colors">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-turmeric transition-colors">FAQ</Link></li>
              <li><Link to="/privacy" className="hover:text-turmeric transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-turmeric transition-colors">Terms</Link></li>
              <li><Link to="/refund" className="hover:text-turmeric transition-colors">Refunds</Link></li>
            </ul>
          </div>

          <div className="space-y-3.5">
            <h3 className="font-serif text-base font-semibold text-white">
              Guest Care &amp; Team
            </h3>
            <p className="text-sm text-cream/80 flex items-center gap-2">
              <Phone className="w-4 h-4 text-turmeric" />
              <a
                href={`tel:${BRAND.contact.primaryPhone.replace(/\s+/g, '')}`}
                className="hover:text-turmeric transition-colors"
              >
                {BRAND.contact.primaryPhone}
              </a>
            </p>
            <p className="text-xs text-cream/55">{BRAND.contact.email}</p>
            <div className="pt-2">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/12 px-4 py-2 text-xs font-semibold text-white transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-turmeric" />
                Staff &amp; Admin Portal
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-5 px-4 sm:px-6 text-xs text-cream/50 text-center">
          © {new Date().getFullYear()} {BRAND.legal.legalEntityName} All rights reserved.
        </div>
      </footer>

      {/* Mobile Bottom 2-Tap Quick Navigation */}
      <CartDrawer />
      <nav
        aria-label="Mobile quick actions"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-ink/8 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] grid grid-cols-4"
      >
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-2.5 text-[11px] font-semibold transition-colors ${
              isActive ? 'text-kumkum' : 'text-ink-muted'
            }`
          }
        >
          <UtensilsCrossed className="w-4 h-4 mb-0.5" />
          Home
        </NavLink>
        <NavLink
          to="/menu?category=breakfast"
          className={() =>
            `flex flex-col items-center justify-center py-2.5 text-[11px] font-semibold transition-colors ${
              location.pathname === '/menu' ? 'text-kumkum' : 'text-ink-muted'
            }`
          }
        >
          <ShoppingBag className="w-4 h-4 mb-0.5" />
          Menu
        </NavLink>
        <NavLink
          to="/outlets"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-2.5 text-[11px] font-semibold transition-colors ${
              isActive ? 'text-kumkum' : 'text-ink-muted'
            }`
          }
        >
          <MapPin className="w-4 h-4 mb-0.5" />
          Outlets
        </NavLink>
        <NavLink
          to="/reserve"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-2.5 text-[11px] font-semibold transition-colors ${
              isActive ? 'text-kumkum' : 'text-ink-muted'
            }`
          }
        >
          <CalendarCheck className="w-4 h-4 mb-0.5" />
          Reserve
        </NavLink>
      </nav>
    </div>
  );
}

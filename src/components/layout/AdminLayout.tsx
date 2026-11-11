import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, Navigate } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  ClipboardList,
  ExternalLink,
  FileEdit,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Package,
  Table2,
  Users,
  Utensils,
  UserCheck,
  X,
} from 'lucide-react';
import { useAdminAuth, type AdminPermission } from '@/context/AdminAuthContext';
import { fetchAllOutletsAdmin } from '@/services/adminService';
import { BrandLogo } from '@/components/BrandLogo';
import type { Outlet } from '@/types/database';

interface AdminLayoutProps {
  children: ReactNode;
  requiredPermission?: AdminPermission;
}

const NAV_ITEMS: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission: AdminPermission;
  exact?: boolean;
}[] = [
  {
    to: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
    permission: 'view_dashboard',
    exact: true,
  },
  {
    to: '/admin/orders',
    label: 'Live Orders (Kanban)',
    icon: ClipboardList,
    permission: 'manage_orders',
  },
  {
    to: '/admin/menu',
    label: 'Menu & Sold Out',
    icon: Utensils,
    permission: 'toggle_availability',
  },
  {
    to: '/admin/tables',
    label: 'Tables & Reservations',
    icon: Table2,
    permission: 'manage_tables',
  },
  {
    to: '/admin/outlets',
    label: 'Outlets & Hours',
    icon: Building2,
    permission: 'manage_outlets',
  },
  {
    to: '/admin/inventory',
    label: 'Inventory & Wastage',
    icon: Package,
    permission: 'manage_inventory',
  },
  {
    to: '/admin/staff',
    label: 'Staff & Shifts',
    icon: UserCheck,
    permission: 'manage_staff',
  },
  {
    to: '/admin/crm',
    label: 'Customers (CRM)',
    icon: Users,
    permission: 'view_crm',
  },
  {
    to: '/admin/reports',
    label: 'Sales & GST Reports',
    icon: BarChart3,
    permission: 'view_reports',
  },
  {
    to: '/admin/content',
    label: 'Website Banners',
    icon: FileEdit,
    permission: 'manage_content',
  },
];

export function AdminLayout({ children, requiredPermission }: AdminLayoutProps) {
  const {
    staff,
    loading,
    isOwner,
    activeOutletId,
    setActiveOutletId,
    can,
    signOut,
  } = useAdminAuth();

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchAllOutletsAdmin().then(setOutlets);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-sm font-semibold text-ink-muted">
        Loading Staff Portal…
      </div>
    );
  }

  if (!staff) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requiredPermission && !can(requiredPermission)) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="max-w-md rounded-2xl bg-white border border-sand-border p-8 text-center space-y-3">
          <h1 className="font-serif text-2xl font-bold text-kumkum">
            Access Restricted
          </h1>
          <p className="text-sm text-ink-muted">
            Your role (<strong className="capitalize">{staff.role.replace('_', ' ')}</strong>)
            does not have permission for this section.
          </p>
          <Link
            to={staff.role === 'kitchen_staff' ? '/admin/orders' : '/admin'}
            className="inline-block rounded-xl bg-kumkum text-white px-4 py-2 text-xs font-bold"
          >
            Go to Allowed View
          </Link>
        </div>
      </div>
    );
  }

  const allowedNav = NAV_ITEMS.filter((item) => can(item.permission));
  const assignedOutlet = outlets.find((o) => o.id === activeOutletId);

  return (
    <div className="min-h-screen bg-cream flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-ink text-cream flex flex-col justify-between border-r border-white/10 transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-5 overflow-y-auto">
          <div className="flex items-center justify-between">
            <BrandLogo variant="light" size="sm" showKannada={false} />
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg bg-white/10 text-white"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Outlet Scope Badge / Switcher */}
          <div className="rounded-2xl bg-white/6 border border-white/10 p-3 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-turmeric">
              {isOwner ? 'Viewing Outlet Scope' : 'Assigned Outlet (Locked)'}
            </p>
            {isOwner ? (
              <select
                aria-label="Admin outlet scope"
                value={activeOutletId}
                onChange={(e) => setActiveOutletId(e.target.value)}
                className="w-full rounded-xl bg-white text-ink px-3 py-2 text-xs font-semibold"
              >
                <option value="all">All Bengaluru Outlets</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.locality}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs font-semibold text-white">
                {assignedOutlet?.locality || 'Assigned Outlet'}
              </p>
            )}
          </div>

          {/* Nav Links */}
          <nav className="space-y-1" aria-label="Admin Navigation">
            {allowedNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-turmeric text-ink shadow-xs'
                        : 'text-cream/75 hover:text-white hover:bg-white/8'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Staff Info */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div>
            <p className="text-xs font-semibold text-white truncate">{staff.full_name}</p>
            <p className="text-[11px] text-turmeric capitalize">
              {staff.role.replace('_', ' ')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-white/10 hover:bg-white/15 py-2 text-[11px] font-semibold transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Public Site
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center justify-center gap-1 rounded-full bg-kumkum hover:bg-kumkum-dark px-3.5 py-2 text-[11px] font-semibold cursor-pointer transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/90 backdrop-blur-md border-b border-ink/8 px-4 sm:px-6 h-14 flex items-center justify-between gap-4 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-ink/12 px-3.5 py-1.5 text-xs font-semibold text-ink"
          >
            <MenuIcon className="w-4 h-4" />
            Admin Menu
          </button>
          <span className="text-xs font-semibold text-kumkum">
            {assignedOutlet?.locality || 'All Outlets'}
          </span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}


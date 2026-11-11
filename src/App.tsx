import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { OutletProvider } from '@/context/OutletContext';
import { CartProvider } from '@/context/CartContext';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { HomePage } from '@/pages/public/HomePage';
import { MenuPage } from '@/pages/public/MenuPage';
import { OutletsPage } from '@/pages/public/OutletsPage';

// Lazy-loaded secondary public routes (keeps initial 4G bundle fast)
const OutletDetailPage = lazy(() =>
  import('@/pages/public/OutletDetailPage').then((m) => ({
    default: m.OutletDetailPage,
  }))
);
const CheckoutPage = lazy(() =>
  import('@/pages/public/CheckoutPage').then((m) => ({
    default: m.CheckoutPage,
  }))
);
const OrderTrackingPage = lazy(() =>
  import('@/pages/public/OrderTrackingPage').then((m) => ({
    default: m.OrderTrackingPage,
  }))
);
const ReserveTablePage = lazy(() =>
  import('@/pages/public/ReserveTablePage').then((m) => ({
    default: m.ReserveTablePage,
  }))
);
const CateringPage = lazy(() =>
  import('@/pages/public/CateringPage').then((m) => ({
    default: m.CateringPage,
  }))
);
const BakeryPage = lazy(() =>
  import('@/pages/public/BakeryPage').then((m) => ({
    default: m.BakeryPage,
  }))
);
const AboutPage = lazy(() =>
  import('@/pages/public/InfoPages').then((m) => ({ default: m.AboutPage }))
);
const ContactPage = lazy(() =>
  import('@/pages/public/InfoPages').then((m) => ({ default: m.ContactPage }))
);
const FaqPage = lazy(() =>
  import('@/pages/public/InfoPages').then((m) => ({ default: m.FaqPage }))
);
const LegalPage = lazy(() =>
  import('@/pages/public/InfoPages').then((m) => ({ default: m.LegalPage }))
);

// Lazy-loaded Admin Panel routes (never downloaded by public diners)
const AdminLoginPage = lazy(() =>
  import('@/pages/admin/AdminLoginPage').then((m) => ({
    default: m.AdminLoginPage,
  }))
);
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({
    default: m.AdminDashboardPage,
  }))
);
const AdminOrdersPage = lazy(() =>
  import('@/pages/admin/AdminOrdersPage').then((m) => ({
    default: m.AdminOrdersPage,
  }))
);
const AdminMenuPage = lazy(() =>
  import('@/pages/admin/AdminMenuPage').then((m) => ({
    default: m.AdminMenuPage,
  }))
);
const AdminOutletsPage = lazy(() =>
  import('@/pages/admin/AdminOutletsPage').then((m) => ({
    default: m.AdminOutletsPage,
  }))
);
const AdminTablesPage = lazy(() =>
  import('@/pages/admin/AdminTablesPage').then((m) => ({
    default: m.AdminTablesPage,
  }))
);
const AdminContentPage = lazy(() =>
  import('@/pages/admin/AdminContentPage').then((m) => ({
    default: m.AdminContentPage,
  }))
);
const AdminInventoryPage = lazy(() =>
  import('@/pages/admin/AdminInventoryPage').then((m) => ({
    default: m.AdminInventoryPage,
  }))
);
const AdminStaffPage = lazy(() =>
  import('@/pages/admin/AdminStaffPage').then((m) => ({
    default: m.AdminStaffPage,
  }))
);
const AdminCrmPage = lazy(() =>
  import('@/pages/admin/AdminCrmPage').then((m) => ({
    default: m.AdminCrmPage,
  }))
);
const AdminReportsPage = lazy(() =>
  import('@/pages/admin/AdminReportsPage').then((m) => ({
    default: m.AdminReportsPage,
  }))
);

function RouteLoadingFallback() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-3 animate-pulse">
      <div className="h-6 w-48 bg-cream-warm rounded mx-auto" />
      <div className="h-32 bg-cream-warm rounded-2xl" />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <OutletProvider>
          <CartProvider>
            <Suspense fallback={<RouteLoadingFallback />}>
              <Routes>
                {/* Admin Auth & Portal Routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route
                  path="/admin"
                  element={
                    <AdminLayout requiredPermission="view_dashboard">
                      <AdminDashboardPage />
                    </AdminLayout>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <AdminLayout requiredPermission="manage_orders">
                      <AdminOrdersPage />
                    </AdminLayout>
                  }
                />
                <Route
                  path="/admin/menu"
                  element={
                    <AdminLayout requiredPermission="toggle_availability">
                      <AdminMenuPage />
                    </AdminLayout>
                  }
                />
                <Route
                  path="/admin/outlets"
                  element={
                    <AdminLayout requiredPermission="manage_outlets">
                      <AdminOutletsPage />
                    </AdminLayout>
                  }
                />
                <Route
                  path="/admin/tables"
                  element={
                    <AdminLayout requiredPermission="manage_tables">
                      <AdminTablesPage />
                    </AdminLayout>
                  }
                />
                <Route
                  path="/admin/content"
                  element={
                    <AdminLayout requiredPermission="manage_content">
                      <AdminContentPage />
                    </AdminLayout>
                  }
                />
                <Route
                  path="/admin/inventory"
                  element={
                    <AdminLayout requiredPermission="manage_inventory">
                      <AdminInventoryPage />
                    </AdminLayout>
                  }
                />
                <Route
                  path="/admin/staff"
                  element={
                    <AdminLayout requiredPermission="manage_staff">
                      <AdminStaffPage />
                    </AdminLayout>
                  }
                />
                <Route
                  path="/admin/crm"
                  element={
                    <AdminLayout requiredPermission="view_crm">
                      <AdminCrmPage />
                    </AdminLayout>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <AdminLayout requiredPermission="view_reports">
                      <AdminReportsPage />
                    </AdminLayout>
                  }
                />

                {/* Public Website Routes */}
                <Route
                  path="/*"
                  element={
                    <PublicLayout>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/outlets" element={<OutletsPage />} />
                        <Route path="/outlets/:slug" element={<OutletDetailPage />} />
                        <Route path="/menu" element={<MenuPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/track-order" element={<OrderTrackingPage />} />
                        <Route
                          path="/track-order/:orderId"
                          element={<OrderTrackingPage />}
                        />
                        <Route path="/reserve" element={<ReserveTablePage />} />
                        <Route path="/catering" element={<CateringPage />} />
                        <Route path="/bakery" element={<BakeryPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/faq" element={<FaqPage />} />
                        <Route path="/privacy" element={<LegalPage type="privacy" />} />
                        <Route path="/terms" element={<LegalPage type="terms" />} />
                        <Route path="/refund" element={<LegalPage type="refund" />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </PublicLayout>
                  }
                />
              </Routes>
            </Suspense>
          </CartProvider>
        </OutletProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;

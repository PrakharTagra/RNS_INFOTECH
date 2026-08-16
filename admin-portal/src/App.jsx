import React, { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AcceptInvitationPage from "./pages/AcceptInvitationPage";
import { navItemsFlat } from "./config/navConfig";
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const StubPage = lazy(() => import("./pages/StubPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const ProductsListPage = lazy(() => import("./pages/products/ProductsListPage"));
const ProductFormPage = lazy(() => import("./pages/products/ProductFormPage"));
const ProductDetailPage = lazy(() => import("./pages/products/ProductDetailPage"));
const CategoriesListPage = lazy(() => import("./pages/categories/CategoriesListPage"));
const BrandsListPage = lazy(() => import("./pages/brands/BrandsListPage"));
const InventoryPage = lazy(() => import("./pages/inventory/InventoryPage"));
const OrdersListPage = lazy(() => import("./pages/orders/OrdersListPage"));
const OrderDetailPage = lazy(() => import("./pages/orders/OrderDetailPage"));
const PaymentsListPage = lazy(() => import("./pages/payments/PaymentsListPage"));
const PaymentDetailPage = lazy(() => import("./pages/payments/PaymentDetailPage"));
const CustomersListPage = lazy(() => import("./pages/customers/CustomersListPage"));
const CustomerDetailPage = lazy(() => import("./pages/customers/CustomerDetailPage"));
const ChatPage = lazy(() => import("./pages/chat/ChatPage"));
const WebsitePage = lazy(() => import("./pages/website/WebsitePage"));
const CouponsListPage = lazy(() => import("./pages/coupons/CouponsListPage"));
const ReviewsListPage = lazy(() => import("./pages/reviews/ReviewsListPage"));
const ContentPage = lazy(() => import("./pages/content/ContentPage"));
const SettingsPage = lazy(() => import("./pages/settings/SettingsPage"));
const StaffPage = lazy(() => import("./pages/StaffPage"));
const AuditLogPage = lazy(() => import("./pages/AuditLogPage"));
const ReturnsPage = lazy(() => import("./pages/returns/ReturnsPage"));

import { getCurrentAdmin, onAdminUnauthorized } from "./lib/adminApi";

const BUILT_PATHS = new Set(["/products", "/categories", "/brands", "/inventory", "/orders", "/payments", "/customers", "/chat", "/website", "/coupons", "/reviews", "/content", "/settings", "/staff", "/audit", "/returns"]);

function RequireAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;
    const cleanupUnauthorized = onAdminUnauthorized(() => {
      if (active) navigate("/login", { replace: true, state: { from: `${location.pathname}${location.search}${location.hash}`, reason: "session-expired" } });
    });
    setStatus("checking");
    getCurrentAdmin().then((admin) => {
      if (!active) return;
      if (admin) setStatus("authenticated");
      else navigate("/login", { replace: true, state: { from: `${location.pathname}${location.search}${location.hash}` } });
    });
    return () => { active = false; cleanupUnauthorized(); };
  }, [location.pathname, location.search, location.hash, navigate]);

  if (status !== "authenticated") {
    return <div className="admin-auth-loading" aria-live="polite">Checking admin session…</div>;
  }

  return <ErrorBoundary resetKey={location.pathname}><Outlet /></ErrorBoundary>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
        <Route element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><DashboardPage /></Suspense>} />
            <Route path="/products" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><ProductsListPage /></Suspense>} />
            <Route path="/products/new" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><ProductFormPage /></Suspense>} />
            <Route path="/products/:id" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><ProductDetailPage /></Suspense>} />
            <Route path="/products/:id/edit" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><ProductFormPage /></Suspense>} />
            <Route path="/categories" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><CategoriesListPage /></Suspense>} />
            <Route path="/brands" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><BrandsListPage /></Suspense>} />
            <Route path="/inventory" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><InventoryPage /></Suspense>} />
            <Route path="/orders" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><OrdersListPage /></Suspense>} />
            <Route path="/orders/:id" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><OrderDetailPage /></Suspense>} />
            <Route path="/payments" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><PaymentsListPage /></Suspense>} />
            <Route path="/payments/:id" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><PaymentDetailPage /></Suspense>} />
            <Route path="/customers" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><CustomersListPage /></Suspense>} />
            <Route path="/customers/:email" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><CustomerDetailPage /></Suspense>} />
            <Route path="/chat" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><ChatPage /></Suspense>} />
            <Route path="/website" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><WebsitePage /></Suspense>} />
            <Route path="/coupons" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><CouponsListPage /></Suspense>} />
            <Route path="/reviews" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><ReviewsListPage /></Suspense>} />
            <Route path="/content" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><ContentPage /></Suspense>} />
            <Route path="/settings" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><SettingsPage /></Suspense>} />
            <Route path="/staff" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><StaffPage /></Suspense>} />
            <Route path="/audit" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><AuditLogPage /></Suspense>} />
            <Route path="/returns" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><ReturnsPage /></Suspense>} />
            {navItemsFlat.filter((item) => item.path !== "/" && !BUILT_PATHS.has(item.path)).map((item) => (
              <Route key={item.path} path={`${item.path}/*`} element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><StubPage /></Suspense>} />
            ))}
            <Route path="*" element={<Suspense fallback={<div className="admin-auth-loading" aria-live="polite">Loading page…</div>}><NotFoundPage /></Suspense>} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

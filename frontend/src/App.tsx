import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AccessibilityAnnouncer from '@/components/AccessibilityAnnouncer';
import { PageLoader } from '@/components/ui/Spinner';
import '@/i18n';

const HomePage = lazy(() => import('@/pages/HomePage'));
const ShopPage = lazy(() => import('@/pages/ShopPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/pages/VerifyEmailPage'));
const AuthCallbackPage = lazy(() => import('@/pages/AuthCallbackPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const ProfileAddressesPage = lazy(() => import('@/pages/ProfileAddressesPage'));
const ProfileSecurityPage = lazy(() => import('@/pages/ProfileSecurityPage'));
const OrdersPage = lazy(() => import('@/pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage'));
const OrderConfirmationPage = lazy(() => import('@/pages/OrderConfirmationPage'));
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));
const ComparePage = lazy(() => import('@/pages/ComparePage'));
const TrackOrderPage = lazy(() => import('@/pages/TrackOrderPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } },
});

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AccessibilityAnnouncer />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="shop" element={<ShopPage />} />
                <Route path="product/:slug" element={<ProductDetailPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="track-order" element={<TrackOrderPage />} />
                <Route path="compare" element={<ComparePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />
                <Route path="verify-email" element={<VerifyEmailPage />} />
                <Route path="auth/callback" element={<AuthCallbackPage />} />
                <Route path="cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="profile/addresses" element={<ProtectedRoute><ProfileAddressesPage /></ProtectedRoute>} />
                <Route path="profile/security" element={<ProtectedRoute><ProfileSecurityPage /></ProtectedRoute>} />
                <Route path="orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="orders/:orderNumber" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                <Route path="order-confirmation/:orderNumber" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
                <Route path="admin/*" element={<ProtectedRoute roles={['admin', 'moderator']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px' } }} />
      </QueryClientProvider>
    </HelmetProvider>
  );
}

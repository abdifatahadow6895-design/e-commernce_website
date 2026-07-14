import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import Header from './Header';
import Footer from './Footer';
import ChatWidget from '../ChatWidget';
import ErrorBoundary from '../ErrorBoundary';
import { useAuthStore, useCartStore, useWishlistStore } from '@/store';
import { cartApi, wishlistApi } from '@/services';

export default function Layout() {
  const { isAuthenticated } = useAuthStore();
  const { setItemCount } = useCartStore();
  const { setItems } = useWishlistStore();

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.get(),
    enabled: isAuthenticated,
  });

  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.get(),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (cartData?.data.cart) {
      const count = cartData.data.cart.items.reduce((sum, item) => sum + item.quantity, 0);
      setItemCount(count);
    }
  }, [cartData, setItemCount]);

  useEffect(() => {
    if (wishlistData?.data.wishlist?.products) {
      setItems(wishlistData.data.wishlist.products.map((p: { _id: string }) => p._id));
    }
  }, [wishlistData, setItems]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </motion.main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

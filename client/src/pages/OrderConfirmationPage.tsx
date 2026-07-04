import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import { orderApi } from '@/services';
import { PageLoader } from '@/components/ui/Spinner';
import { formatPrice, convertPrice } from '@/lib/utils';
import { useSettingsStore } from '@/store';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const { currency } = useSettingsStore();

  const { data, isLoading } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => orderApi.getById(orderNumber!),
    enabled: !!orderNumber,
  });

  if (isLoading) return <PageLoader />;
  const order = data?.data.order;
  if (!order) return <div className="container-custom py-20 text-center">Order not found</div>;

  return (
    <>
      <SEO title="Order Confirmed" />
      <div className="container-custom py-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="mt-6 text-3xl font-bold">Order Confirmed!</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Thank you for your purchase. Your order has been placed successfully.</p>
          <div className="card mt-8 p-6 text-left">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Order Number</span>
              <span className="font-mono font-semibold">{order.orderNumber}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-lg font-bold text-primary-600">{formatPrice(convertPrice(order.total, currency), currency)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">Payment</span>
              <span className="capitalize">{order.paymentMethod.replace('_', ' ')}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">Status</span>
              <span className="badge bg-green-100 text-green-700 capitalize">{order.orderStatus}</span>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to={`/orders/${order.orderNumber}`} className="btn-primary"><Package className="h-4 w-4" /> Track Order</Link>
            <Link to="/shop" className="btn-secondary">Continue Shopping <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}

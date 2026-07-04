import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, Truck, CheckCircle } from 'lucide-react';
import SEO from '@/components/SEO';
import { orderApi } from '@/services';
import { PageLoader } from '@/components/ui/Spinner';
import { formatPrice, convertPrice, formatDate } from '@/lib/utils';
import { useSettingsStore } from '@/store';

export default function OrderDetailPage() {
  const { orderNumber } = useParams();
  const { currency } = useSettingsStore();
  const { data, isLoading } = useQuery({ queryKey: ['order', orderNumber], queryFn: () => orderApi.getById(orderNumber!), enabled: !!orderNumber });

  if (isLoading) return <PageLoader />;
  const order = data?.data.order;
  if (!order) return <div className="container-custom py-20 text-center">Order not found</div>;

  return (
    <>
      <SEO title={`Order #${order.orderNumber}`} />
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
        <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="font-semibold">Order Tracking</h2>
              <div className="mt-6 space-y-4">
                {order.tracking.map((event, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900"><CheckCircle className="h-4 w-4" /></div>
                      {i < order.tracking.length - 1 && <div className="h-full w-0.5 bg-gray-200 dark:bg-gray-700" />}
                    </div>
                    <div className="pb-4">
                      <p className="font-medium capitalize">{event.status}</p>
                      <p className="text-sm text-gray-500">{event.message}</p>
                      <p className="text-xs text-gray-400">{formatDate(event.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-semibold">Items</h2>
              <div className="mt-4 space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <img src={item.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
                    <div className="flex-1"><p className="font-medium">{item.name}</p><p className="text-sm text-gray-500">Qty: {item.quantity}</p></div>
                    <p className="font-semibold">{formatPrice(convertPrice(item.price * item.quantity, currency), currency)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card h-fit p-6">
            <h3 className="font-semibold">Summary</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(convertPrice(order.subtotal, currency), currency)}</span></div>
              <div className="flex justify-between"><span>Discount</span><span>-{formatPrice(convertPrice(order.discount, currency), currency)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(convertPrice(order.shippingCost, currency), currency)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>{formatPrice(convertPrice(order.tax, currency), currency)}</span></div>
              <hr className="border-gray-200 dark:border-gray-700" />
              <div className="flex justify-between font-bold"><span>Total</span><span>{formatPrice(convertPrice(order.total, currency), currency)}</span></div>
            </div>
            {order.invoiceUrl && (
              <a href={order.invoiceUrl} target="_blank" rel="noopener" className="btn-secondary mt-4 w-full text-sm">Download Invoice</a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

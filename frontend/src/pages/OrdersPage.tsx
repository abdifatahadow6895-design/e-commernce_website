import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SEO from '@/components/SEO';
import { orderApi } from '@/services';
import { PageLoader } from '@/components/ui/Spinner';
import { formatPrice, convertPrice, formatDate } from '@/lib/utils';
import { useSettingsStore } from '@/store';

export default function OrdersPage() {
  const { currency } = useSettingsStore();
  const { data, isLoading } = useQuery({ queryKey: ['orders'], queryFn: () => orderApi.getAll() });

  if (isLoading) return <PageLoader />;

  return (
    <>
      <SEO title="Order History" />
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold">Order History</h1>
        <div className="mt-8 space-y-4">
          {data?.data.orders.length === 0 ? (
            <div className="py-20 text-center"><p className="text-gray-500">No orders yet</p><Link to="/shop" className="btn-primary mt-4 inline-flex">Start Shopping</Link></div>
          ) : (
            data?.data.orders.map((order) => (
              <Link key={order._id} to={`/orders/${order.orderNumber}`} className="card flex flex-wrap items-center justify-between gap-4 p-4 transition-shadow hover:shadow-md">
                <div>
                  <p className="font-mono font-semibold">#{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {order.items.slice(0, 3).map((item, i) => (
                    <img key={i} src={item.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  ))}
                  {order.items.length > 3 && <span className="text-xs text-gray-500">+{order.items.length - 3}</span>}
                </div>
                <span className="badge bg-green-100 text-green-700 capitalize">{order.orderStatus}</span>
                <span className="font-semibold">{formatPrice(convertPrice(order.total, currency), currency)}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
}

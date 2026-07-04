import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminApi } from '@/services';
import { PageLoader } from '@/components/ui/Spinner';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/types';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders-all'],
    queryFn: () => adminApi.getOrders({ limit: 50 }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, orderStatus }: { id: string; orderStatus: string }) =>
      adminApi.updateOrderStatus(id, { orderStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders-all'] });
      toast.success('Order status updated');
    },
    onError: () => toast.error('Failed to update order'),
  });

  if (isLoading) return <PageLoader />;
  const orders = data?.data.orders as Order[] || [];

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-3 text-left">Order</th>
              <th className="py-3 text-left">Payment</th>
              <th className="py-3 text-left">Status</th>
              <th className="py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 font-mono">{order.orderNumber}</td>
                <td className="py-3 capitalize">{order.paymentStatus}</td>
                <td className="py-3">
                  <select
                    value={order.orderStatus}
                    onChange={(e) => updateMutation.mutate({ id: order._id, orderStatus: e.target.value })}
                    className="input py-1 text-sm"
                  >
                    {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </td>
                <td className="py-3 text-right font-semibold">{formatPrice(order.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

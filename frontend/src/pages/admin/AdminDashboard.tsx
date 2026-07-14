import { Routes, Route, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, Users, DollarSign, ShoppingCart, TrendingUp, AlertTriangle, LayoutGrid } from 'lucide-react';
import SEO from '@/components/SEO';
import { adminApi } from '@/services';
import { PageLoader } from '@/components/ui/Spinner';
import { formatPrice, cn } from '@/lib/utils';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';

function DashboardHome() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => adminApi.getDashboard() });
  const { data: orders } = useQuery({ queryKey: ['admin-orders'], queryFn: () => adminApi.getOrders({ limit: 5 }) });

  if (isLoading) return <PageLoader />;
  const stats = data?.data.stats;

  const statCards = [
    { icon: DollarSign, label: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), change: `${stats?.revenueGrowth}%` },
    { icon: ShoppingCart, label: 'Total Orders', value: stats?.totalOrders, change: `${stats?.orderGrowth}%` },
    { icon: Package, label: 'Products', value: stats?.totalProducts },
    { icon: Users, label: 'Customers', value: stats?.totalUsers },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button onClick={() => adminApi.exportOrders().then((res) => {
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click();
        })} className="btn-secondary text-sm">Export CSV</button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ icon: Icon, label, value, change }) => (
          <div key={label} className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950"><Icon className="h-5 w-5" /></div>
              {change && <span className="text-xs font-medium text-green-600"><TrendingUp className="inline h-3 w-3" /> {change}</span>}
            </div>
            <p className="mt-4 text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {stats?.lowStockProducts?.length > 0 && (
        <div className="card mt-8 p-6">
          <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-500" /><h2 className="font-semibold">Low Stock Alerts</h2></div>
          <div className="mt-4 space-y-2">
            {stats.lowStockProducts.map((p: { _id: string; name: string; stock: number }) => (
              <div key={p._id} className="flex justify-between text-sm"><span>{p.name}</span><span className="text-orange-500">{p.stock} left</span></div>
            ))}
          </div>
        </div>
      )}

      <div className="card mt-8 p-6">
        <h2 className="font-semibold">Recent Orders</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="py-2 text-left">Order</th><th className="py-2 text-left">Status</th><th className="py-2 text-right">Total</th></tr></thead>
            <tbody>
              {orders?.data.orders.map((order: { _id: string; orderNumber: string; orderStatus: string; total: number }) => (
                <tr key={order._id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 font-mono">{order.orderNumber}</td>
                  <td className="py-3 capitalize">{order.orderStatus}</td>
                  <td className="py-3 text-right font-semibold">{formatPrice(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

const adminNav = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
];

export default function AdminDashboard() {
  return (
    <>
      <SEO title="Admin Dashboard" />
      <div className="container-custom py-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="lg:w-56">
            <nav className="card space-y-1 p-2">
              {adminNav.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-950'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  {label === 'Overview' && <LayoutGrid className="h-4 w-4" />}
                  {label === 'Products' && <Package className="h-4 w-4" />}
                  {label === 'Orders' && <ShoppingCart className="h-4 w-4" />}
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>
          <div className="flex-1">
            <Routes>
              <Route index element={<DashboardHome />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
            </Routes>
          </div>
        </div>
      </div>
    </>
  );
}

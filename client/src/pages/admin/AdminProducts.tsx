import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import { adminApi } from '@/services';
import { PageLoader } from '@/components/ui/Spinner';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', stock: '', description: '', sku: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminApi.getProducts({ limit: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: () => adminApi.createProduct({
      name: form.name,
      price: Number(form.price),
      stock: Number(form.stock),
      description: form.description,
      sku: form.sku || `SKU-${Date.now()}`,
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product created');
      setShowForm(false);
      setForm({ name: '', price: '', stock: '', description: '', sku: '' });
    },
    onError: () => toast.error('Failed to create product'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    },
  });

  if (isLoading) return <PageLoader />;
  const products = data?.data.products as Product[] || [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">Add Product</button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
          <input required placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input sm:col-span-2" />
          <input required type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" />
          <input required type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input" />
          <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input sm:col-span-2" />
          <textarea required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input sm:col-span-2" rows={3} />
          <button type="submit" className="btn-primary sm:col-span-2">Create Product</button>
        </form>
      )}

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="py-3 text-left">Product</th><th className="py-3 text-left">Price</th><th className="py-3 text-left">Stock</th><th className="py-3 text-right">Actions</th></tr></thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3"><div className="flex items-center gap-3"><img src={product.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" /><span className="font-medium">{product.name}</span></div></td>
                <td className="py-3">{formatPrice(product.price)}</td>
                <td className="py-3">{product.stock}</td>
                <td className="py-3 text-right"><button onClick={() => deleteMutation.mutate(product._id)} className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

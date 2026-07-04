import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { X, ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';
import { productApi } from '@/services';
import { useCompareStore, useSettingsStore } from '@/store';
import { formatPrice, convertPrice } from '@/lib/utils';
import { PageLoader } from '@/components/ui/Spinner';
import Rating from '@/components/ui/Rating';

export default function ComparePage() {
  const { products: compareIds, remove, clear } = useCompareStore();
  const { currency } = useSettingsStore();

  const { data, isLoading } = useQuery({
    queryKey: ['compare', compareIds],
    queryFn: () => productApi.compare(compareIds),
    enabled: compareIds.length > 0,
  });

  const products = data?.data.products || [];

  if (!compareIds.length) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold">Compare Products</h1>
        <p className="mt-2 text-gray-500">Add up to 4 products to compare features and prices.</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">Browse Products</Link>
      </div>
    );
  }

  if (isLoading) return <PageLoader />;

  return (
    <>
      <SEO title="Compare Products" />
      <div className="container-custom py-8">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600"><ArrowLeft className="h-4 w-4" /> Back to Shop</Link>
            <h1 className="mt-2 text-2xl font-bold">Compare Products</h1>
          </div>
          <button onClick={clear} className="btn-secondary text-sm">Clear All</button>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr>
                <th className="p-3 text-left">Feature</th>
                {products.map((product) => (
                  <th key={product._id} className="p-3 text-left">
                    <div className="relative">
                      <button onClick={() => remove(product._id)} className="absolute -right-1 -top-1 text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                      <img src={product.images[0]} alt="" className="h-24 w-24 rounded-xl object-cover" />
                      <Link to={`/product/${product.slug}`} className="mt-2 block font-medium hover:text-primary-600">{product.name}</Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-3 font-medium">Price</td>
                {products.map((p) => <td key={p._id} className="p-3 font-semibold text-primary-600">{formatPrice(convertPrice(p.price, currency), currency)}</td>)}
              </tr>
              <tr className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-3 font-medium">Rating</td>
                {products.map((p) => <td key={p._id} className="p-3"><Rating rating={p.averageRating} count={p.reviewCount} size="sm" /></td>)}
              </tr>
              <tr className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-3 font-medium">Stock</td>
                {products.map((p) => <td key={p._id} className="p-3">{p.stock > 0 ? `${p.stock} available` : 'Out of stock'}</td>)}
              </tr>
              <tr className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-3 font-medium">Brand</td>
                {products.map((p) => <td key={p._id} className="p-3">{(p.brand as { name?: string })?.name || 'N/A'}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import ProductCard from '@/components/product/ProductCard';
import { productApi } from '@/services';
import { useWishlistStore } from '@/store';

export default function WishlistPage() {
  const { items } = useWishlistStore();
  const { data } = useQuery({
    queryKey: ['wishlist-products', items],
    queryFn: () => productApi.compare(items),
    enabled: items.length > 0,
  });

  return (
    <>
      <SEO title="Wishlist" />
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        {items.length === 0 ? (
          <div className="py-20 text-center"><p className="text-gray-500">Your wishlist is empty</p><Link to="/shop" className="btn-primary mt-4 inline-flex">Browse Products</Link></div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {data?.data.products.map((product, i) => <ProductCard key={product._id} product={product} index={i} />)}
          </div>
        )}
      </div>
    </>
  );
}

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Minus, Plus, Heart, ShoppingCart, Share2, GitCompare, Truck, RotateCcw, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '@/components/SEO';
import ProductCard from '@/components/product/ProductCard';
import Rating from '@/components/ui/Rating';
import { PageLoader } from '@/components/ui/Spinner';
import { productApi, cartApi, orderApi } from '@/services';
import { useAuthStore, useCartStore, useWishlistStore, useCompareStore, useSettingsStore } from '@/store';
import { formatPrice, convertPrice, getDiscountPercentage } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const { setItemCount } = useCartStore();
  const { toggle, has } = useWishlistStore();
  const { add: addCompare, products: compareProducts } = useCompareStore();
  const { currency } = useSettingsStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomed, setZoomed] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.getBySlug(slug!),
    enabled: !!slug,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', data?.data.product._id],
    queryFn: () => orderApi.getReviews(data!.data.product._id),
    enabled: !!data?.data.product._id,
  });

  if (isLoading) return <PageLoader />;
  if (!data?.data.product) return <div className="container-custom py-20 text-center">Product not found</div>;

  const { product, related, recommendations } = data.data;
  const discount = getDiscountPercentage(product.price, product.compareAtPrice);
  const price = convertPrice(product.price, currency);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    try {
      const { data: cartData } = await cartApi.addItem(product._id, quantity);
      setItemCount(cartData.cart.items.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0));
      toast.success('Added to cart');
    } catch { toast.error('Failed to add to cart'); }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    try {
      await cartApi.addItem(product._id, quantity);
      window.location.href = '/checkout';
    } catch { toast.error('Failed to proceed to checkout'); }
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku,
    offers: { '@type': 'Offer', price: product.price, priceCurrency: 'USD', availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: product.averageRating, reviewCount: product.reviewCount },
  };

  return (
    <>
      <SEO title={product.name} description={product.shortDescription || product.description} image={product.images[0]} type="product" />
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>

      <div className="container-custom py-8">
        <nav className="mb-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-primary-600">Home</Link> / <Link to="/shop" className="hover:text-primary-600">Shop</Link> / <span className="text-gray-900 dark:text-gray-100">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div
              className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 cursor-zoom-in"
              onClick={() => setZoomed(!zoomed)}
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className={cn('h-full w-full object-cover transition-transform duration-300', zoomed && 'scale-150')}
              />
              {discount > 0 && <span className="badge absolute left-4 top-4 bg-red-500 text-white">-{discount}%</span>}
            </div>
            {product.images.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={cn('h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2', selectedImage === i ? 'border-primary-600' : 'border-transparent')}>
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {product.brand && <p className="text-sm font-medium uppercase tracking-wider text-primary-600">{product.brand.name}</p>}
            <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
            <Rating rating={product.averageRating} count={product.reviewCount} size="md" />
            <div className="mt-4 flex items-center gap-3">
              <span className="text-3xl font-bold text-primary-600">{formatPrice(price, currency)}</span>
              {product.compareAtPrice && (
                <span className="text-lg text-gray-400 line-through">{formatPrice(convertPrice(product.compareAtPrice, currency), currency)}</span>
              )}
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{product.shortDescription || product.description.slice(0, 200)}</p>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800"><Minus className="h-4 w-4" /></button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800"><Plus className="h-4 w-4" /></button>
              </div>
              <span className={cn('text-sm font-medium', product.stock > 0 ? 'text-green-600' : 'text-red-500')}>
                {product.stock > 0 ? `${product.stock} ${t('common.inStock')}` : t('common.outOfStock')}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={handleAddToCart} disabled={product.stock <= 0} className="btn-primary flex-1 sm:flex-none">
                <ShoppingCart className="h-4 w-4" /> {t('common.addToCart')}
              </button>
              <button onClick={handleBuyNow} disabled={product.stock <= 0} className="btn-outline flex-1 sm:flex-none">{t('common.buyNow')}</button>
              <button onClick={() => { toggle(product._id); toast.success(has(product._id) ? 'Removed' : 'Added to wishlist'); }} className={cn('btn-ghost rounded-xl border', has(product._id) && 'border-red-500 text-red-500')}>
                <Heart className={cn('h-5 w-5', has(product._id) && 'fill-current')} />
              </button>
              <button onClick={() => { addCompare(product._id); toast.success('Added to compare'); }} className="btn-ghost rounded-xl border">
                <GitCompare className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { icon: Truck, text: 'Free shipping over $100' },
                { icon: RotateCcw, text: '30-day returns' },
                { icon: Shield, text: '2-year warranty' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-2 rounded-xl bg-gray-50 p-3 text-center dark:bg-gray-900">
                  <Icon className="h-5 w-5 text-primary-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{text}</span>
                </div>
              ))}
            </div>

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold">Specifications</h3>
                <dl className="mt-3 space-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-gray-100 py-2 dark:border-gray-800">
                      <dt className="text-sm text-gray-500">{key}</dt>
                      <dd className="text-sm font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>

        <section className="mt-16">
          <h2 className="text-xl font-bold">{t('common.reviews')} ({reviews?.data.pagination.total || 0})</h2>
          <div className="mt-6 space-y-4">
            {reviews?.data.reviews.map((review) => (
              <div key={review._id} className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                    {review.user.firstName[0]}{review.user.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{review.user.firstName} {review.user.lastName}</p>
                    <Rating rating={review.rating} />
                  </div>
                  {review.isVerifiedPurchase && <span className="badge bg-green-100 text-green-700">Verified Purchase</span>}
                </div>
                {review.title && <p className="mt-2 font-medium">{review.title}</p>}
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
              </div>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold">{t('common.related')}</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {related.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
            </div>
          </section>
        )}

        {recommendations?.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold">Recommended for You</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {recommendations.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

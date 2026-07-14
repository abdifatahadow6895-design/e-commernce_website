import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Product } from '@/types';
import { cn, formatPrice, getDiscountPercentage, convertPrice } from '@/lib/utils';
import { useSettingsStore, useWishlistStore } from '@/store';
import Rating from '@/components/ui/Rating';
import toast from 'react-hot-toast';
import { cartApi } from '@/services';
import { useCartStore, useAuthStore } from '@/store';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { t } = useTranslation();
  const { currency } = useSettingsStore();
  const { toggle, has } = useWishlistStore();
  const { setItemCount } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const discount = getDiscountPercentage(product.price, product.compareAtPrice);
  const price = convertPrice(product.price, currency);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    try {
      const { data } = await cartApi.addItem(product._id);
      setItemCount(data.cart.items.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0));
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative"
    >
      <Link to={`/product/${product.slug}`} className="card block overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {discount > 0 && (
            <span className="badge absolute left-3 top-3 bg-red-500 text-white">-{discount}%</span>
          )}
          {product.isFlashSale && (
            <span className="badge absolute right-3 top-3 bg-orange-500 text-white">Flash Sale</span>
          )}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={(e) => { e.preventDefault(); toggle(product._id); toast.success(has(product._id) ? 'Removed from wishlist' : 'Added to wishlist'); }}
              className={cn('rounded-full p-2.5 transition-colors', has(product._id) ? 'bg-red-500 text-white' : 'bg-white text-gray-900 hover:bg-red-500 hover:text-white')}
            >
              <Heart className={cn('h-4 w-4', has(product._id) && 'fill-current')} />
            </button>
            <button onClick={handleAddToCart} className="rounded-full bg-white p-2.5 text-gray-900 hover:bg-primary-600 hover:text-white">
              <ShoppingCart className="h-4 w-4" />
            </button>
            <Link to={`/product/${product.slug}`} className="rounded-full bg-white p-2.5 text-gray-900 hover:bg-primary-600 hover:text-white">
              <Eye className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="p-4">
          {product.brand && (
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{product.brand.name}</p>
          )}
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900 dark:text-gray-100">{product.name}</h3>
          <Rating rating={product.averageRating} count={product.reviewCount} />
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-bold text-primary-600">{formatPrice(price, currency)}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(convertPrice(product.compareAtPrice, currency), currency)}</span>
            )}
          </div>
          {product.stock <= 0 ? (
            <span className="mt-2 inline-block text-xs font-medium text-red-500">{t('common.outOfStock')}</span>
          ) : product.stock <= 10 ? (
            <span className="mt-2 inline-block text-xs font-medium text-orange-500">Only {product.stock} left</span>
          ) : null}
        </div>
      </Link>
    </motion.div>
  );
}

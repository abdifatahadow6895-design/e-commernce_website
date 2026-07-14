import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '@/components/SEO';
import { PageLoader } from '@/components/ui/Spinner';
import { cartApi } from '@/services';
import { useCartStore } from '@/store';
import { useSettingsStore } from '@/store';
import { formatPrice, convertPrice } from '@/lib/utils';
import { useState } from 'react';

export default function CartPage() {
  const { t } = useTranslation();
  const { setItemCount } = useCartStore();
  const { currency } = useSettingsStore();
  const [couponCode, setCouponCode] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.get(),
  });

  const cart = data?.data.cart;
  const subtotal = cart?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const shipping = subtotal > 100 ? 0 : subtotal > 0 ? 9.99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const { data: cartData } = await cartApi.updateItem(productId, quantity);
      setItemCount(cartData.cart.items.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0));
      refetch();
    } catch { toast.error('Failed to update'); }
  };

  const removeItem = async (productId: string) => {
    try {
      const { data: cartData } = await cartApi.removeItem(productId);
      setItemCount(cartData.cart.items.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0));
      refetch();
      toast.success('Item removed');
    } catch { toast.error('Failed to remove'); }
  };

  const applyCoupon = async () => {
    try {
      await cartApi.applyCoupon(couponCode);
      refetch();
      toast.success('Coupon applied!');
    } catch { toast.error('Invalid coupon'); }
  };

  if (isLoading) return <PageLoader />;

  return (
    <>
      <SEO title="Shopping Cart" />
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold">{t('cart.title')}</h1>

        {!cart?.items.length ? (
          <div className="py-20 text-center">
            <p className="text-gray-500">{t('cart.empty')}</p>
            <Link to="/shop" className="btn-primary mt-4">{t('cart.continue')}</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item.product._id} className="card flex gap-4 p-4">
                  <img src={item.product.images[0]} alt={item.product.name} className="h-24 w-24 rounded-xl object-cover" />
                  <div className="flex-1">
                    <Link to={`/product/${item.product.slug}`} className="font-semibold hover:text-primary-600">{item.product.name}</Link>
                    <p className="text-sm text-primary-600">{formatPrice(convertPrice(item.price, currency), currency)}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700">
                        <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="p-1.5"><Minus className="h-3 w-3" /></button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="p-1.5"><Plus className="h-3 w-3" /></button>
                      </div>
                      <button onClick={() => removeItem(item.product._id)} className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <p className="font-semibold">{formatPrice(convertPrice(item.price * item.quantity, currency), currency)}</p>
                </div>
              ))}
            </div>

            <div className="card h-fit p-6">
              <h3 className="font-semibold">Order Summary</h3>
              <div className="mt-4 flex gap-2">
                <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon code" className="input text-sm" />
                <button onClick={applyCoupon} className="btn-secondary text-sm px-3"><Tag className="h-4 w-4" /></button>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>{t('cart.subtotal')}</span><span>{formatPrice(convertPrice(subtotal, currency), currency)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(convertPrice(shipping, currency), currency)}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>{formatPrice(convertPrice(tax, currency), currency)}</span></div>
                <hr className="border-gray-200 dark:border-gray-700" />
                <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatPrice(convertPrice(total, currency), currency)}</span></div>
              </div>
              <Link to="/checkout" className="btn-primary mt-6 w-full">{t('cart.checkout')}</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

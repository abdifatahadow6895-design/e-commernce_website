import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import SEO from '@/components/SEO';
import StripeCheckout from '@/components/StripeCheckout';
import { PageLoader } from '@/components/ui/Spinner';
import { cartApi, orderApi, paymentApi } from '@/services';
import { useSettingsStore } from '@/store';
import { formatPrice, convertPrice, cn } from '@/lib/utils';

const PAYMENT_METHODS = [
  { id: 'stripe', label: 'Credit/Debit Card', desc: 'Visa, Mastercard via Stripe', icons: ['Visa', 'MC'] },
  { id: 'paypal', label: 'PayPal', desc: 'Pay with your PayPal account', icons: ['PayPal'] },
  { id: 'google_pay', label: 'Google Pay', desc: 'Quick checkout with Google', icons: ['GPay'] },
  { id: 'apple_pay', label: 'Apple Pay', desc: 'Quick checkout with Apple', icons: ['Apple'] },
  { id: 'mpesa', label: 'M-Pesa', desc: 'Mobile money payment', icons: ['M-Pesa'] },
  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive', icons: ['COD'] },
];

const STRIPE_METHODS = ['stripe', 'google_pay', 'apple_pay'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { currency } = useSettingsStore();
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<string | null>(null);
  const [address, setAddress] = useState({
    fullName: '', phone: '', street: '', city: '', state: '', zipCode: '', country: 'United States',
  });

  const { data, isLoading } = useQuery({ queryKey: ['cart'], queryFn: () => cartApi.get() });
  const cart = data?.data.cart;
  const subtotal = cart?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: orderData } = await orderApi.create({ shippingAddress: address, paymentMethod, notes: '' });
      const orderNumber = orderData.order.orderNumber;

      if (STRIPE_METHODS.includes(paymentMethod)) {
        setPendingOrder(orderNumber);
        return;
      }

      if (paymentMethod === 'mpesa') {
        await paymentApi.initiateMpesa(orderNumber, address.phone);
        toast.success('M-Pesa payment initiated. Check your phone.');
        navigate(`/order-confirmation/${orderNumber}`);
        return;
      }

      if (paymentMethod !== 'cod') {
        await paymentApi.confirm(orderNumber);
      }

      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${orderNumber}`);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <PageLoader />;
  if (!cart?.items.length) { navigate('/cart'); return null; }

  if (pendingOrder) {
    return (
      <>
        <SEO title="Complete Payment" />
        <div className="container-custom py-8">
          <h1 className="text-2xl font-bold">Complete Payment</h1>
          <p className="mt-2 text-gray-500">Order #{pendingOrder}</p>
          <div className="card mt-6 max-w-lg p-6">
            <StripeCheckout
              orderNumber={pendingOrder}
              onSuccess={() => {
                toast.success('Payment successful!');
                navigate(`/order-confirmation/${pendingOrder}`);
              }}
              onCancel={() => setPendingOrder(null)}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Checkout" />
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="font-semibold">Shipping Address</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {(['fullName', 'phone', 'street', 'city', 'state', 'zipCode', 'country'] as const).map((field) => (
                  <input
                    key={field}
                    required
                    placeholder={field.replace(/([A-Z])/g, ' $1').trim()}
                    value={address[field]}
                    onChange={(e) => setAddress({ ...address, [field]: e.target.value })}
                    className={cn('input', field === 'street' && 'sm:col-span-2')}
                  />
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-semibold">Payment Method</h2>
              <div className="mt-4 space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <label key={method.id} className={cn('flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors', paymentMethod === method.id ? 'border-primary-600 bg-primary-50 dark:bg-primary-950' : 'border-gray-200 dark:border-gray-700')}>
                    <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="text-primary-600" />
                    <div className="flex-1">
                      <p className="font-medium">{method.label}</p>
                      <p className="text-xs text-gray-500">{method.desc}</p>
                    </div>
                    <div className="flex gap-1">{method.icons.map((icon) => <span key={icon} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium dark:bg-gray-800">{icon}</span>)}</div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="card h-fit p-6">
            <h3 className="font-semibold">Order Summary</h3>
            <div className="mt-4 space-y-3">
              {cart.items.map((item) => (
                <div key={item.product._id} className="flex justify-between text-sm">
                  <span>{item.product.name} x{item.quantity}</span>
                  <span>{formatPrice(convertPrice(item.price * item.quantity, currency), currency)}</span>
                </div>
              ))}
            </div>
            <hr className="my-4 border-gray-200 dark:border-gray-700" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(convertPrice(subtotal, currency), currency)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(convertPrice(shipping, currency), currency)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>{formatPrice(convertPrice(tax, currency), currency)}</span></div>
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatPrice(convertPrice(total, currency), currency)}</span></div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
              {loading ? 'Processing...' : STRIPE_METHODS.includes(paymentMethod) ? 'Continue to Payment' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { paymentApi } from '@/services';
import Spinner from '@/components/ui/Spinner';

interface StripeCheckoutFormProps {
  orderNumber: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({ orderNumber, onSuccess, onCancel }: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        await paymentApi.confirm(orderNumber);
        onSuccess();
        return;
      }

      await paymentApi.confirm(orderNumber);
      onSuccess();
    } catch {
      toast.error('Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={!stripe || loading} className="btn-primary flex-1">
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </form>
  );
}

interface StripeCheckoutProps {
  orderNumber: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StripeCheckout({ orderNumber, onSuccess, onCancel }: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: config } = await paymentApi.getConfig();
      setStripePromise(loadStripe(config.publishableKey));

      const { data: intent } = await paymentApi.createIntent(orderNumber);
      setClientSecret(intent.clientSecret);
    };

    init().catch(() => toast.error('Failed to initialize payment'));
  }, [orderNumber]);

  if (!clientSecret || !stripePromise) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#6366f1' } } }}>
      <CheckoutForm orderNumber={orderNumber} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}

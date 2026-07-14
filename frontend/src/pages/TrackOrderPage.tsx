import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Package } from 'lucide-react';
import SEO from '@/components/SEO';
import { orderApi } from '@/services';
import { cn } from '@/lib/utils';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [submitted, setSubmitted] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['track-order', submitted],
    queryFn: () => orderApi.track(submitted),
    enabled: !!submitted,
  });

  const tracking = data?.data.order;

  return (
    <>
      <SEO title="Track Order" description="Track your NexShop order status in real time." />
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold">Track Your Order</h1>
        <p className="mt-2 text-gray-500">Enter your order number to see shipping updates.</p>

        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(orderNumber.trim()); }} className="mt-6 flex max-w-xl gap-3">
          <input required placeholder="Order number (e.g. NS-20260101-ABC123)" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className="input flex-1" />
          <button type="submit" className="btn-primary"><Search className="h-4 w-4" /> Track</button>
        </form>

        {isLoading && <p className="mt-8 text-gray-500">Looking up order...</p>}
        {isError && submitted && <p className="mt-8 text-red-500">Order not found. Please check the order number.</p>}

        {tracking && (
          <div className="card mt-8 max-w-2xl p-6">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-primary-600" />
              <div>
                <p className="font-mono font-semibold">{tracking.orderNumber}</p>
                <p className="text-sm capitalize text-gray-500">Status: {tracking.status}</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {tracking.tracking?.map((step: { status: string; message: string; timestamp?: string }, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className={cn('mt-1 h-3 w-3 rounded-full', i === 0 ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600')} />
                  <div>
                    <p className="font-medium capitalize">{step.status}</p>
                    <p className="text-sm text-gray-500">{step.message}</p>
                    {step.timestamp && <p className="text-xs text-gray-400">{new Date(step.timestamp).toLocaleString()}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

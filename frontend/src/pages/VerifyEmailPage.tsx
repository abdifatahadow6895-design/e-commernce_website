import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import SEO from '@/components/SEO';
import { authApi } from '@/services';
import { PageLoader } from '@/components/ui/Spinner';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  if (status === 'loading') return <PageLoader />;

  return (
    <>
      <SEO title="Verify Email" />
      <div className="container-custom flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        {status === 'success' ? (
          <>
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h1 className="mt-4 text-2xl font-bold">Email verified</h1>
            <p className="mt-2 text-gray-500">Your account is now fully activated.</p>
            <Link to="/shop" className="btn-primary mt-6">Start Shopping</Link>
          </>
        ) : (
          <>
            <XCircle className="h-16 w-16 text-red-500" />
            <h1 className="mt-4 text-2xl font-bold">Verification failed</h1>
            <p className="mt-2 text-gray-500">The link is invalid or has expired.</p>
            <Link to="/profile" className="btn-primary mt-6">Go to Profile</Link>
          </>
        )}
      </div>
    </>
  );
}

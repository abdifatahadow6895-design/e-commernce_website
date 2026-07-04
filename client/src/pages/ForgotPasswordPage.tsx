import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import SEO from '@/components/SEO';
import { authApi } from '@/services';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent if email exists');
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <SEO title="Forgot Password" />
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-center">Reset Password</h1>
          {sent ? (
            <div className="card mt-8 p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">If an account exists for {email}, you'll receive a reset link shortly.</p>
              <Link to="/login" className="btn-primary mt-4 inline-flex">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card mt-8 p-6 space-y-4">
              <input type="email" required placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
              <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send Reset Link'}</button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

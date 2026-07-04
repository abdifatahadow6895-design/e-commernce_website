import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import SEO from '@/components/SEO';
import { authApi } from '@/services';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold">Invalid reset link</h1>
        <Link to="/forgot-password" className="btn-primary mt-4 inline-flex">Request new link</Link>
      </div>
    );
  }

  return (
    <>
      <SEO title="Reset Password" />
      <div className="container-custom flex min-h-[60vh] items-center justify-center py-8">
        <form onSubmit={handleSubmit} className="card w-full max-w-md p-8 space-y-4">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <input type="password" required minLength={8} placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
          <input type="password" required minLength={8} placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input" />
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Resetting...' : 'Reset Password'}</button>
        </form>
      </div>
    </>
  );
}

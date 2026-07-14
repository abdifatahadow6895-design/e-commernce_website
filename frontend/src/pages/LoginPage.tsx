import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import SEO from '@/components/SEO';
import { authApi } from '@/services';
import { useAuthStore } from '@/store';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '', twoFactorCode: '' });
  const [requires2FA, setRequires2FA] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('error') === 'oauth-unconfigured') {
      toast.error('Social login is not configured yet. Please use email and password for now.');
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login(form);
      if (data.requires2FA) {
        setRequires2FA(true);
        toast('Enter your 2FA code');
        return;
      }
      setAuth(data.user, data.token);
      toast.success('Welcome back!');
      navigate(from);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Sign In" />
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-purple-600 text-xl font-bold text-white">N</div>
            <h1 className="mt-4 text-2xl font-bold">Welcome back</h1>
            <p className="mt-1 text-sm text-gray-500">Sign in to your NexShop account</p>
          </div>

          <form onSubmit={handleSubmit} className="card mt-8 p-6 space-y-4">
            <input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
            <input type="password" required placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" />
            {requires2FA && (
              <input type="text" required placeholder="2FA Code" value={form.twoFactorCode} onChange={(e) => setForm({ ...form, twoFactorCode: e.target.value })} className="input" maxLength={6} />
            )}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Signing in...' : 'Sign In'}</button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-gray-500 dark:bg-gray-900">Or continue with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a href="/api/auth/google" className="btn-secondary text-sm">Google</a>
              <a href="/api/auth/github" className="btn-secondary text-sm">GitHub</a>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account? <Link to="/register" className="font-medium text-primary-600 hover:underline">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import SEO from '@/components/SEO';
import { authApi } from '@/services';
import { useAuthStore } from '@/store';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const { data } = await authApi.register(form);
      setAuth(data.user, data.token);
      toast.success('Account created! Please verify your email.');
      navigate('/');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Create Account" />
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="mt-1 text-sm text-gray-500">Join NexShop for exclusive deals</p>
          </div>
          <form onSubmit={handleSubmit} className="card mt-8 p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input" />
              <input required placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input" />
            </div>
            <input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
            <input type="password" required placeholder="Password (min 8 chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" />
            <input type="password" required placeholder="Confirm Password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="input" />
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating...' : 'Create Account'}</button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="font-medium text-primary-600 hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}

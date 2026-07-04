import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';
import { authApi } from '@/services';
import { PageLoader } from '@/components/ui/Spinner';
import type { Address } from '@/types';

const emptyAddress = {
  fullName: '', phone: '', street: '', city: '', state: '', zipCode: '', country: 'United States', isDefault: false,
};

export default function ProfileAddressesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyAddress);

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getMe(),
  });

  const addMutation = useMutation({
    mutationFn: () => authApi.addAddress(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Address added');
      setShowForm(false);
      setForm(emptyAddress);
    },
    onError: () => toast.error('Failed to add address'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => authApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Address removed');
    },
  });

  if (isLoading) return <PageLoader />;
  const addresses = (data?.data.user.addresses || []) as Address[];

  return (
    <>
      <SEO title="My Addresses" />
      <div className="container-custom py-8">
        <Link to="/profile" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600"><ArrowLeft className="h-4 w-4" /> Back to Profile</Link>
        <div className="mt-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Shipping Addresses</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm"><Plus className="h-4 w-4" /> Add Address</button>
        </div>

        {showForm && (
          <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(); }} className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
            {(['fullName', 'phone', 'street', 'city', 'state', 'zipCode', 'country'] as const).map((field) => (
              <input key={field} required placeholder={field.replace(/([A-Z])/g, ' $1').trim()} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className={`input ${field === 'street' ? 'sm:col-span-2' : ''}`} />
            ))}
            <label className="flex items-center gap-2 sm:col-span-2"><input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} /> Set as default</label>
            <button type="submit" className="btn-primary sm:col-span-2">Save Address</button>
          </form>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <div key={address._id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  {address.isDefault && <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-950">Default</span>}
                  <p className="mt-2 font-semibold">{address.fullName}</p>
                  <p className="text-sm text-gray-500">{address.street}</p>
                  <p className="text-sm text-gray-500">{address.city}, {address.state} {address.zipCode}</p>
                  <p className="text-sm text-gray-500">{address.country}</p>
                  <p className="text-sm text-gray-500">{address.phone}</p>
                </div>
                <button onClick={() => deleteMutation.mutate(address._id!)} className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {!addresses.length && <p className="text-gray-500">No addresses saved yet.</p>}
        </div>
      </div>
    </>
  );
}

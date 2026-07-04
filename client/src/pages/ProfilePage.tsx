import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { User, MapPin, Shield, Gift, Star } from 'lucide-react';
import SEO from '@/components/SEO';
import { authApi } from '@/services';
import { useAuthStore } from '@/store';
import { PageLoader } from '@/components/ui/Spinner';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getMe(),
  });

  if (isLoading) return <PageLoader />;
  const profile = data?.data.user || user;

  return (
    <>
      <SEO title="My Profile" />
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="card p-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-700 dark:bg-primary-900">
              {profile?.firstName?.[0]}{profile?.lastName?.[0]}
            </div>
            <h2 className="mt-4 text-xl font-semibold">{profile?.firstName} {profile?.lastName}</h2>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            <div className="mt-4 flex justify-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">{profile?.loyaltyPoints || 0}</p>
                <p className="text-xs text-gray-500">Loyalty Points</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {[
              { icon: MapPin, title: 'Addresses', desc: 'Manage shipping addresses', to: '/profile/addresses' },
              { icon: Star, title: 'Order History', desc: 'View past orders', to: '/orders' },
              { icon: Shield, title: 'Security', desc: '2FA, password settings', to: '/profile/security' },
              { icon: Gift, title: 'Referrals', desc: `Your code: ${(profile as { referralCode?: string })?.referralCode || 'N/A'}`, to: '#' },
            ].map(({ icon: Icon, title, desc, to }) => (
              <Link key={title} to={to} className="card flex items-center gap-4 p-4 transition-shadow hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950"><Icon className="h-5 w-5" /></div>
                <div><p className="font-semibold">{title}</p><p className="text-sm text-gray-500">{desc}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

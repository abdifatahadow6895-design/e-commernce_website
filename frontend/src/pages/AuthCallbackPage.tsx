import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PageLoader } from '@/components/ui/Spinner';
import { authApi } from '@/services';
import { useAuthStore } from '@/store';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  useEffect(() => {
    authApi.getMe()
      .then(({ data }) => {
        setUser(data.user);
        toast.success('Signed in successfully');
        navigate('/');
      })
      .catch(() => {
        toast.error('Authentication failed');
        navigate('/login?error=oauth');
      });
  }, [navigate, setUser]);

  return <PageLoader />;
}

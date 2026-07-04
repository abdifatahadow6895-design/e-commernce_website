import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Shield, Smartphone } from 'lucide-react';
import SEO from '@/components/SEO';
import { authApi } from '@/services';

export default function ProfileSecurityPage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetup2FA = async () => {
    setLoading(true);
    try {
      const { data } = await authApi.setup2FA();
      setQrCode(data.qrCode);
      toast.success('Scan the QR code with your authenticator app');
    } catch {
      toast.error('Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.enable2FA(code);
      toast.success('Two-factor authentication enabled');
      setQrCode(null);
      setCode('');
    } catch {
      toast.error('Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.disable2FA(password);
      toast.success('Two-factor authentication disabled');
      setPassword('');
    } catch {
      toast.error('Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Security Settings" />
      <div className="container-custom py-8">
        <Link to="/profile" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600"><ArrowLeft className="h-4 w-4" /> Back to Profile</Link>
        <h1 className="mt-4 text-2xl font-bold">Security Settings</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <div className="flex items-center gap-3"><Shield className="h-5 w-5 text-primary-600" /><h2 className="font-semibold">Two-Factor Authentication</h2></div>
            <p className="mt-2 text-sm text-gray-500">Add an extra layer of security to your account using an authenticator app.</p>

            {!qrCode ? (
              <button onClick={handleSetup2FA} disabled={loading} className="btn-primary mt-4">Setup 2FA</button>
            ) : (
              <form onSubmit={handleEnable2FA} className="mt-4 space-y-4">
                {qrCode && <img src={qrCode} alt="2FA QR Code" className="mx-auto h-40 w-40 rounded-lg border" />}
                <input required placeholder="Enter 6-digit code" value={code} onChange={(e) => setCode(e.target.value)} className="input" maxLength={6} />
                <button type="submit" disabled={loading} className="btn-primary w-full">Enable 2FA</button>
              </form>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3"><Smartphone className="h-5 w-5 text-primary-600" /><h2 className="font-semibold">Disable 2FA</h2></div>
            <p className="mt-2 text-sm text-gray-500">Enter your password to disable two-factor authentication.</p>
            <form onSubmit={handleDisable2FA} className="mt-4 space-y-4">
              <input type="password" required placeholder="Current password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
              <button type="submit" disabled={loading} className="btn-secondary w-full text-red-600">Disable 2FA</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

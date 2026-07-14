import { useState } from 'react';
import toast from 'react-hot-toast';
import SEO from '@/components/SEO';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { miscApi } from '@/services';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await miscApi.submitContact(form);
      toast.success('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Contact Us" description="Get in touch with the NexShop team." />
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold">Contact Us</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-4">
            {[
              { icon: Mail, title: 'Email', value: 'support@email.com' },
              { icon: Phone, title: 'Phone', value: '+254 7223821031' },
              { icon: MapPin, title: 'Address', value: '123 Commerce St, New York, NY 10001' },
            ].map(({ icon: Icon, title, value }) => (
              <div key={title} className="card flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950"><Icon className="h-5 w-5" /></div>
                <div><p className="text-sm font-medium">{title}</p><p className="text-sm text-gray-500">{value}</p></div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="card lg:col-span-2 p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input required placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
              <input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
            </div>
            <input required placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input" />
            <textarea required placeholder="Message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input resize-none" />
            <button type="submit" disabled={loading} className="btn-primary"><Send className="h-4 w-4" /> {loading ? 'Sending...' : 'Send Message'}</button>
          </form>
        </div>
      </div>
    </>
  );
}

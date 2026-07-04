import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import SEO from '@/components/SEO';

export default function NotFoundPage() {
  return (
    <>
      <SEO title="Page Not Found" />
      <div className="container-custom flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <p className="text-8xl font-bold text-gradient">404</p>
        <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 max-w-md text-gray-500">The page you are looking for does not exist or has been moved.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary"><Home className="h-4 w-4" /> Go Home</Link>
          <Link to="/shop" className="btn-secondary"><Search className="h-4 w-4" /> Browse Shop</Link>
        </div>
      </div>
    </>
  );
}

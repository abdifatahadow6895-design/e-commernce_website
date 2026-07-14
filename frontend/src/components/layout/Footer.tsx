import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="container-custom py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-purple-600 text-lg font-bold text-white">N</div>
              <span className="text-xl font-bold text-gradient">NexShop</span>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Your premium online shopping destination. Quality products, secure payments, and fast delivery worldwide.
            </p>
            <div className="mt-4 flex gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="rounded-lg bg-gray-200 p-2 text-gray-600 transition-colors hover:bg-primary-600 hover:text-white dark:bg-gray-800 dark:text-gray-400">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Quick Links</h4>
            <ul className="mt-4 space-y-2">
              {[
                { to: '/shop', label: 'Shop' },
                { to: '/categories', label: 'Categories' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Customer Service</h4>
            <ul className="mt-4 space-y-2">
              {[
                { to: '/track-order', label: 'Track Order' },
                { to: '/contact', label: 'FAQ & Support' },
                { to: '/about', label: 'Shipping Info' },
                { to: '/contact', label: 'Returns & Refunds' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Contact Us</h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 shrink-0 text-primary-600" /> 123 Commerce St, New York, NY
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4 shrink-0 text-primary-600" /> +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4 shrink-0 text-primary-600" /> support@nexshop.com
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Visa', 'Mastercard', 'Stripe', 'PayPal', 'M-Pesa', 'COD'].map((method) => (
                <span key={method} className="rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">{method}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-500 dark:border-gray-800">
          &copy; {new Date().getFullYear()} NexShop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search, ShoppingCart, Heart, User, Menu, X, Sun, Moon,
  Globe, ChevronDown, Bell, LayoutDashboard, GitCompare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useThemeStore, useSettingsStore, useCartStore, useWishlistStore, useCompareStore } from '@/store';
import { productApi, authApi } from '@/services';
import { formatPrice, convertPrice, cn } from '@/lib/utils';
import type { Product } from '@/types';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'sw', label: 'Kiswahili' },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'KES', 'NGN'];

export default function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const { language, currency, setLanguage, setCurrency } = useSettingsStore();
  const { itemCount } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { products: compareItems } = useCompareStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
  }, [isDark]);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        try {
          const { data } = await productApi.search(searchQuery);
          setSearchResults(data.products);
        } catch { setSearchResults([]); }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/shop', label: t('nav.shop') },
    { to: '/categories', label: t('nav.categories') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-gray-200 dark:border-gray-800">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-purple-600 text-lg font-bold text-white">N</div>
            <span className="hidden text-xl font-bold text-gradient sm:block">NexShop</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400">
                {link.label}
              </Link>
            ))}
          </nav>

          <div ref={searchRef} className="relative hidden flex-1 max-w-md md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              className="input pl-10"
            />
            <AnimatePresence>
              {searchOpen && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
                >
                  {searchResults.map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product.slug}`}
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <img src={product.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-primary-600">{formatPrice(convertPrice(product.price, currency), currency)}</p>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1">
            <div className="relative hidden sm:block">
              <button onClick={() => setLangOpen(!langOpen)} className="btn-ghost rounded-lg p-2">
                <Globe className="h-5 w-5" />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-900">
                    <p className="px-3 py-1 text-xs font-semibold uppercase text-gray-500">Language</p>
                    {LANGUAGES.map((lang) => (
                      <button key={lang.code} onClick={() => { setLanguage(lang.code); setLangOpen(false); }} className={cn('w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800', language === lang.code && 'bg-primary-50 text-primary-600 dark:bg-primary-950')}>
                        {lang.label}
                      </button>
                    ))}
                    <hr className="my-2 border-gray-200 dark:border-gray-700" />
                    <p className="px-3 py-1 text-xs font-semibold uppercase text-gray-500">Currency</p>
                    {CURRENCIES.map((cur) => (
                      <button key={cur} onClick={() => { setCurrency(cur); setLangOpen(false); }} className={cn('w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800', currency === cur && 'bg-primary-50 text-primary-600 dark:bg-primary-950')}>
                        {cur}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={toggle} className="btn-ghost rounded-lg p-2" aria-label="Toggle theme">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <Link to="/wishlist" className="btn-ghost relative rounded-lg p-2">
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{wishlistItems.length}</span>
              )}
            </Link>

            <Link to="/compare" className="btn-ghost relative hidden rounded-lg p-2 sm:inline-flex">
              <GitCompare className="h-5 w-5" />
              {compareItems.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white">{compareItems.length}</span>
              )}
            </Link>

            <Link to="/cart" className="btn-ghost relative rounded-lg p-2">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">{itemCount}</span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setUserOpen(!userOpen)} className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <ChevronDown className="hidden h-4 w-4 sm:block" />
                </button>
                <AnimatePresence>
                  {userOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-900">
                      <div className="border-b border-gray-200 px-3 py-2 dark:border-gray-700">
                        <p className="text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setUserOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"><User className="h-4 w-4" /> {t('nav.profile')}</Link>
                      <Link to="/orders" onClick={() => setUserOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"><Bell className="h-4 w-4" /> Orders</Link>
                      {(user?.role === 'admin' || user?.role === 'moderator') && (
                        <Link to="/admin" onClick={() => setUserOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"><LayoutDashboard className="h-4 w-4" /> {t('nav.admin')}</Link>
                      )}
                      <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950">{t('nav.logout')}</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn-primary hidden sm:inline-flex text-sm px-4 py-2">{t('nav.login')}</Link>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="btn-ghost rounded-lg p-2 lg:hidden">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-gray-200 lg:hidden dark:border-gray-800">
            <div className="container-custom py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                  {searchResults.slice(0, 5).map((product) => (
                    <Link key={product._id} to={`/product/${product.slug}`} onClick={() => { setMobileOpen(false); setSearchQuery(''); }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <img src={product.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <div><p className="text-sm font-medium">{product.name}</p><p className="text-xs text-primary-600">{formatPrice(convertPrice(product.price, currency), currency)}</p></div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <nav className="container-custom space-y-1 py-4 border-t border-gray-200 dark:border-gray-800">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className="block rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">{link.label}</Link>
              ))}
              {!isAuthenticated && (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary mt-2 w-full">{t('nav.login')}</Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

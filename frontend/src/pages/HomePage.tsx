import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, Shield, Headphones, Zap } from 'lucide-react';
import SEO from '@/components/SEO';
import ProductCard from '@/components/product/ProductCard';
import LiveInsights from '@/components/LiveInsights';
import { PageLoader } from '@/components/ui/Spinner';
import { productApi, miscApi } from '@/services';

export default function HomePage() {
  const { t } = useTranslation();

  const { data: featured, isLoading: loadingFeatured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productApi.getAll({ featured: 'true', limit: 8 }),
  });

  const { data: flashSales } = useQuery({
    queryKey: ['flash-sales'],
    queryFn: () => productApi.getFlashSales(),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => miscApi.getCategories(),
  });

  const { data: banners } = useQuery({
    queryKey: ['banners', 'hero'],
    queryFn: () => miscApi.getBanners('hero'),
  });

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => productApi.getRecommendations(),
  });

  const heroBanner = banners?.data.banners[0];

  return (
    <>
      <SEO />
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="container-custom relative py-20 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <span className="badge bg-white/20 text-white backdrop-blur-sm">New Collection 2026</span>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                {heroBanner?.title || t('home.hero')}
              </h1>
              <p className="mt-4 max-w-lg text-lg text-white/80">
                {heroBanner?.subtitle || t('home.subtitle')}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to={heroBanner?.link || '/shop'} className="btn bg-white text-primary-700 hover:bg-gray-100 shadow-xl">
                  {heroBanner?.buttonText || t('home.shopNow')} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/categories" className="btn border-2 border-white/30 text-white hover:bg-white/10">
                  Browse Categories
                </Link>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="hidden lg:block">
              <img
                src={heroBanner?.image || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800'}
                alt="Hero"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <LiveInsights />

      <section className="border-b border-gray-200 bg-white py-8 dark:border-gray-800 dark:bg-gray-950">
        <div className="container-custom grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
            { icon: Shield, title: 'Secure Payment', desc: '100% protected' },
            { icon: Headphones, title: '24/7 Support', desc: 'Dedicated help' },
            { icon: Zap, title: 'Flash Deals', desc: 'Daily discounts' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {categories?.data.categories && (
        <section className="py-16">
          <div className="container-custom">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{t('home.categories')}</h2>
              <Link to="/categories" className="text-sm font-medium text-primary-600 hover:underline">View All</Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {categories.data.categories.map((cat, i) => (
                <motion.div key={cat._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Link to={`/shop?category=${cat._id}`} className="group relative block overflow-hidden rounded-2xl">
                    <img src={cat.image || `https://picsum.photos/seed/${cat.slug}/400/300`} alt={cat.name} className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <p className="absolute bottom-4 left-4 text-sm font-semibold text-white">{cat.name}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {flashSales?.data.products && flashSales.data.products.length > 0 && (
        <section className="bg-gray-50 py-16 dark:bg-gray-900">
          <div className="container-custom">
            <h2 className="text-2xl font-bold">{t('home.flashSales')}</h2>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {flashSales.data.products.slice(0, 4).map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="container-custom">
          <h2 className="text-2xl font-bold">{t('home.featured')}</h2>
          {loadingFeatured ? (
            <PageLoader />
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featured?.data.products.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {recommendations?.data.products && recommendations.data.products.length > 0 && (
        <section className="bg-gray-50 py-16 dark:bg-gray-900">
          <div className="container-custom">
            <h2 className="text-2xl font-bold">{t('home.recommendations')}</h2>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {recommendations.data.products.slice(0, 4).map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

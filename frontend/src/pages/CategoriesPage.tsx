import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';
import { miscApi } from '@/services';

export default function CategoriesPage() {
  const { t } = useTranslation();
  const { data } = useQuery({ queryKey: ['categories'], queryFn: () => miscApi.getCategories() });

  return (
    <>
      <SEO title="Categories" description="Browse products by category." />
      <div className="container-custom py-8">
        <h1 className="text-2xl font-bold">{t('nav.categories')}</h1>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data?.data.categories.map((cat) => (
            <Link key={cat._id} to={`/shop?category=${cat._id}`} className="group card overflow-hidden transition-shadow hover:shadow-lg">
              <div className="relative aspect-[16/9] overflow-hidden">
                <img src={cat.image || `https://picsum.photos/seed/${cat.slug}/600/400`} alt={cat.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h2 className="text-xl font-bold text-white">{cat.name}</h2>
                  {cat.description && <p className="text-sm text-white/80">{cat.description}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

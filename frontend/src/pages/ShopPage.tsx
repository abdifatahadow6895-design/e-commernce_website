import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, Grid3X3, List } from 'lucide-react';
import SEO from '@/components/SEO';
import ProductCard from '@/components/product/ProductCard';
import { PageLoader } from '@/components/ui/Spinner';
import { productApi, miscApi } from '@/services';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest' },
  { value: 'price:asc', label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' },
  { value: 'averageRating:desc', label: 'Top Rated' },
  { value: 'soldCount:desc', label: 'Best Selling' },
];

export default function ShopPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const page = Number(searchParams.get('page') || 1);
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sortParam = searchParams.get('sort') || 'createdAt:desc';
  const [sort, order] = sortParam.split(':');

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', page, category, brand, minPrice, maxPrice, sort, order],
    queryFn: () =>
      productApi.getAll({
        page,
        limit: 12,
        sort,
        order,
        ...(category && { category }),
        ...(brand && { brand }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
      }),
  });

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => miscApi.getCategories() });
  const { data: brands } = useQuery({ queryKey: ['brands'], queryFn: () => miscApi.getBrands() });

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <>
      <SEO title="Shop" description="Browse our complete collection of premium products." />
      <div className="container-custom py-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className={cn('lg:w-64 lg:block', showFilters ? 'block' : 'hidden')}>
            <div className="card p-6 space-y-6">
              <h3 className="font-semibold">{t('shop.filters')}</h3>

              <div>
                <p className="mb-2 text-sm font-medium">Category</p>
                <div className="space-y-1">
                  <button onClick={() => updateFilter('category', '')} className={cn('block w-full rounded-lg px-3 py-1.5 text-left text-sm', !category && 'bg-primary-50 text-primary-600 dark:bg-primary-950')}>All</button>
                  {categories?.data.categories.map((cat) => (
                    <button key={cat._id} onClick={() => updateFilter('category', cat._id)} className={cn('block w-full rounded-lg px-3 py-1.5 text-left text-sm', category === cat._id && 'bg-primary-50 text-primary-600 dark:bg-primary-950')}>{cat.name}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Brand</p>
                <div className="space-y-1">
                  <button onClick={() => updateFilter('brand', '')} className={cn('block w-full rounded-lg px-3 py-1.5 text-left text-sm', !brand && 'bg-primary-50 text-primary-600 dark:bg-primary-950')}>All</button>
                  {brands?.data.brands.map((b) => (
                    <button key={b._id} onClick={() => updateFilter('brand', b._id)} className={cn('block w-full rounded-lg px-3 py-1.5 text-left text-sm', brand === b._id && 'bg-primary-50 text-primary-600 dark:bg-primary-950')}>{b.name}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Price Range</p>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)} className="input text-sm" />
                  <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} className="input text-sm" />
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{t('shop.title')}</h1>
                {products?.data.pagination && (
                  <p className="text-sm text-gray-500">{t('shop.showing', { count: products.data.pagination.total })}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary lg:hidden text-sm">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </button>
                <select
                  value={sortParam}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="input w-auto text-sm"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <PageLoader />
            ) : products?.data.products.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-gray-500">{t('shop.noProducts')}</p>
              </div>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {products?.data.products.map((product, i) => (
                    <ProductCard key={product._id} product={product} index={i} />
                  ))}
                </div>

                {products?.data.pagination && products.data.pagination.pages! > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    {Array.from({ length: products.data.pagination.pages! }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => updateFilter('page', String(p))}
                        className={cn('h-10 w-10 rounded-lg text-sm font-medium', p === page ? 'bg-primary-600 text-white' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800')}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/services';

export default function LiveInsights() {
  const { data } = useQuery({ queryKey: ['recommendations'], queryFn: () => productApi.getRecommendations() });

  return (
    <section className="container-custom py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-primary-100 bg-gradient-to-r from-primary-600 to-indigo-600 p-6 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/20 p-3"><Sparkles className="h-5 w-5" /></div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">AI-powered commerce</p>
            <h2 className="text-2xl font-semibold">Personalized shopping moments for every customer</h2>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/80">
          <span className="rounded-full bg-white/20 px-3 py-1">Smart recommendations</span>
          <span className="rounded-full bg-white/20 px-3 py-1">Fast fulfillment insights</span>
          <span className="rounded-full bg-white/20 px-3 py-1">Real-time updates</span>
        </div>
        <div className="mt-6 flex items-center gap-2 text-sm font-medium">
          <TrendingUp className="h-4 w-4" />
          {data?.data.products?.length || 0} tailored products are ready for you
        </div>
      </motion.div>
    </section>
  );
}

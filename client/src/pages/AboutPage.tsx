import SEO from '@/components/SEO';
import { Users, Target, Award, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <SEO title="About Us" description="Learn about NexShop - your premium online shopping destination." />
      <section className="bg-gradient-to-br from-primary-600 to-purple-700 py-20 text-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl font-bold">About NexShop</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">We're on a mission to make online shopping seamless, secure, and enjoyable for everyone.</p>
        </div>
      </section>
      <section className="py-16">
        <div className="container-custom">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Users, title: '10M+ Customers', desc: 'Trusted by millions worldwide' },
              { icon: Target, title: 'Our Mission', desc: 'Deliver quality products at fair prices' },
              { icon: Award, title: 'Award Winning', desc: 'Best e-commerce platform 2025' },
              { icon: Globe, title: 'Global Reach', desc: 'Shipping to 50+ countries' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-950"><Icon className="h-7 w-7" /></div>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

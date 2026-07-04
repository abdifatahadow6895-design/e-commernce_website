import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export default function SEO({ title, description, image, url, type = 'website' }: SEOProps) {
  const siteTitle = 'NexShop';
  const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} - Premium E-Commerce Platform`;
  const desc = description || 'Shop the latest products with confidence. Fast shipping, secure payments, and exceptional service.';
  const ogImage = image || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200';
  const ogUrl = url || 'https://nexshop.com';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:type" content={type} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />
      <link rel="canonical" href={ogUrl} />
    </Helmet>
  );
}

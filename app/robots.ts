import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// Allow content; block the API and every faceted query URL (?q=, ?page=) so
// crawl budget is spent only on canonical pages. /search itself stays allowed —
// it returns noindex,follow, which Google can only honour if it can fetch it.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/*?*'],
    },
    sitemap: `${SITE_URL}/sitemap-index.xml`,
  };
}

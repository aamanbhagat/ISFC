import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Standard SSG + ISR (generateStaticParams + revalidate). Cache Components is
  // intentionally NOT enabled — `use cache` isolation doesn't co-operate with the
  // libSQL client during prerender, and ISR is rock-solid for a read-only
  // directory of this size.

  // Canonicalise host + trailing slashes — one hop, never a chain. Critical for
  // crawl-budget dedup so a branch resolves to exactly one URL. The www→apex rule
  // only fires on the production host, leaving local dev untouched.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.ifsckosh.tech' }],
        destination: 'https://ifsckosh.tech/:path*',
        permanent: true,
      },
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        // Search/autocomplete must never enter the index or burn crawl budget.
        source: '/api/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Bound build-time pressure: one static-generation worker, a few pages at a
  // time, so prerendering the top-N pages never exhausts memory or the DB.
  experimental: {
    cpus: 1,
    staticGenerationMaxConcurrency: 4,
  },
};

export default nextConfig;

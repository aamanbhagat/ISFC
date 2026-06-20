import 'server-only';
import {
  countBranches,
  countCityHubs,
  getBankStateParams,
  getBranchShard,
  getCityHubShard,
  getLatestUpdatedAt,
  listBanks,
  listStates,
} from '@/lib/db';
import { SITE_URL, urls } from '@/lib/seo';
import { getAllPosts } from '@/lib/blog';

// One URL per resource, ≤50,000 URLs per child sitemap (Google's hard limit).
export const SHARD_SIZE = 45000;

const XML_HEADERS = {
  'Content-Type': 'application/xml',
  // Sitemaps are cheap to regenerate and change only on a data sync.
  'Cache-Control': 'public, max-age=3600, s-maxage=86400',
} as const;

export { XML_HEADERS };

// Evergreen informational pages.
const STATIC_PAGES: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: '/what-is-ifsc', priority: '0.6', changefreq: 'yearly' },
  { path: '/about', priority: '0.3', changefreq: 'yearly' },
  { path: '/contact', priority: '0.3', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
];

function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function urlset(
  rows: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }>,
): string {
  const body = rows
    .map(
      (u) => `  <url>
    <loc>${esc(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}

export function robotsTxt(): string {
  // Allow content; block the API and every faceted query URL (?q=, ?page=) so
  // crawl budget is spent only on canonical pages. /search itself is allowed —
  // it returns `noindex, follow`, which Google can only honour if it can fetch
  // it. We never block /_next/ (Googlebot needs the CSS/JS to render).
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /*?*',
    '',
    `Sitemap: ${SITE_URL}/sitemap-index.xml`,
  ].join('\n');
}

// ── Index ────────────────────────────────────────────────────
export async function sitemapIndexXml(): Promise<string> {
  const lastmod = await getLatestUpdatedAt();
  const branchShards = Math.max(1, Math.ceil((await countBranches()) / SHARD_SIZE));
  const cityShards = Math.max(1, Math.ceil((await countCityHubs()) / SHARD_SIZE));

  const children = [
    'pages',
    ...Array.from({ length: branchShards }, (_, i) => `branches/${i}`),
    ...Array.from({ length: cityShards }, (_, i) => `cities/${i}`),
  ];

  const entries = children
    .map(
      (name) => `  <sitemap>
    <loc>${SITE_URL}/sitemap-${name}.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;
}

// ── pages: home, bank/state indexes, bank hubs, bank/state hubs, static ──
export async function pagesSitemapXml(): Promise<string> {
  const lastmod = await getLatestUpdatedAt();
  const [banks, states, bankStates] = await Promise.all([
    listBanks(),
    listStates(),
    getBankStateParams(),
  ]);

  const rows = [
    { loc: `${SITE_URL}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE_URL}${urls.bankIndex()}`, changefreq: 'weekly', priority: '0.7' },
    { loc: `${SITE_URL}${urls.stateIndex()}`, changefreq: 'weekly', priority: '0.7' },
    ...STATIC_PAGES.map((p) => ({
      loc: `${SITE_URL}${p.path}`,
      changefreq: p.changefreq,
      priority: p.priority,
    })),
    ...states.map((s) => ({
      loc: `${SITE_URL}${urls.state(s.stateSlug)}`,
      changefreq: 'weekly',
      priority: '0.6',
    })),
    ...banks.map((b) => ({
      loc: `${SITE_URL}${urls.bank(b.slug)}`,
      changefreq: 'weekly',
      priority: '0.7',
    })),
    ...bankStates.map((p) => ({
      loc: `${SITE_URL}${urls.bankState(p.bankSlug, p.stateSlug)}`,
      changefreq: 'monthly',
      priority: '0.6',
    })),
  ].map((r) => ({ ...r, lastmod }));

  const blogRows = [
    { loc: `${SITE_URL}/blog`, lastmod, changefreq: 'weekly', priority: '0.6' },
    ...getAllPosts().map((p) => ({
      loc: `${SITE_URL}/blog/${p.slug}`,
      lastmod: new Date(p.frontmatter.updatedAt || p.frontmatter.publishedAt).toISOString(),
      changefreq: 'monthly',
      priority: '0.6',
    })),
  ];

  return urlset([...rows, ...blogRows]);
}

// ── branches shard ───────────────────────────────────────────
export async function branchesSitemapXml(shard: number): Promise<string | null> {
  const total = await countBranches();
  const shards = Math.max(1, Math.ceil(total / SHARD_SIZE));
  if (shard < 0 || shard >= shards) return null;
  const rows = await getBranchShard(shard * SHARD_SIZE, SHARD_SIZE);
  return urlset(
    rows.map((r) => ({
      loc: `${SITE_URL}${urls.branch(r.ifsc)}`,
      lastmod: r.updatedAt,
      changefreq: 'yearly',
      priority: '0.8',
    })),
  );
}

// ── city hubs shard (bank/state/city) ────────────────────────
export async function citiesSitemapXml(shard: number): Promise<string | null> {
  const total = await countCityHubs();
  const shards = Math.max(1, Math.ceil(total / SHARD_SIZE));
  if (shard < 0 || shard >= shards) return null;
  const lastmod = await getLatestUpdatedAt();
  const rows = await getCityHubShard(shard * SHARD_SIZE, SHARD_SIZE);
  return urlset(
    rows.map((p) => ({
      loc: `${SITE_URL}${urls.bankCity(p.bankSlug, p.stateSlug, p.citySlug)}`,
      lastmod,
      changefreq: 'monthly',
      priority: '0.6',
    })),
  );
}

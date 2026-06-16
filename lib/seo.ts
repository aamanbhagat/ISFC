// Canonical URL helpers — one source of truth for absolute links. The fallback
// is the live production origin (NOT localhost) so that if NEXT_PUBLIC_SITE_URL
// is ever missing in a deploy, canonicals, sitemaps and JSON-LD still point at
// the real domain. Local dev sets NEXT_PUBLIC_SITE_URL=http://localhost:3000.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://ifsckosh.in'
).replace(/\/$/, '');

export const SITE_NAME = 'IFSCKosh';

// The dataset release these pages were built from. Drives the "Verified" stamp
// on every branch and is the human-facing provenance line.
export const DATA_SOURCE = 'Reserve Bank of India, via the razorpay/ifsc dataset';
export const DATA_RELEASE = 'December 2025';

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@ifsckosh.in';

export const SOCIAL_LINKS = (process.env.NEXT_PUBLIC_SOCIAL_LINKS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

// ── Internal URL builders ────────────────────────────────────
// Every link in the app routes through these so paths stay consistent and
// crawl-safe (one URL per resource).
export const urls = {
  branch: (ifsc: string) => `/ifsc/${ifsc.toLowerCase()}`,
  bankIndex: () => `/bank`,
  bank: (bankSlug: string) => `/bank/${bankSlug}`,
  bankState: (bankSlug: string, stateSlug: string) =>
    `/bank/${bankSlug}/${stateSlug}`,
  bankCity: (bankSlug: string, stateSlug: string, citySlug: string) =>
    `/bank/${bankSlug}/${stateSlug}/${citySlug}`,
  stateIndex: () => `/state`,
  state: (stateSlug: string) => `/state/${stateSlug}`,
};

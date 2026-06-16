import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SchemaOrg } from '@/components/SchemaOrg';
import { listBanks } from '@/lib/db';
import { azBucket } from '@/lib/ifsc';
import { buildBreadcrumbSchema } from '@/lib/schema';
import { SITE_NAME, SITE_URL, absoluteUrl, urls } from '@/lib/seo';
import type { BankSummary } from '@/types/ifsc';

export const revalidate = 604800;

export const metadata: Metadata = {
  title: 'All Banks — IFSC Code Directory',
  description:
    'Browse every bank in India by name and find IFSC, MICR and SWIFT codes for any of its branches.',
  alternates: { canonical: absoluteUrl(urls.bankIndex()) },
};

export default async function BankIndexPage() {
  const banks = await listBanks();

  const groups = new Map<string, BankSummary[]>();
  for (const b of banks) {
    const key = azBucket(b.name);
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(b);
  }
  const letters = [...groups.keys()].sort();

  return (
    <div className="shell">
      <SchemaOrg
        schemas={[
          buildBreadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'Banks', url: absoluteUrl(urls.bankIndex()) },
          ]),
        ]}
      />
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Banks' }]} />

      <header className="page-head">
        <h1 className="page-head__title">All banks in India</h1>
        <p className="page-head__sub">
          {banks.length.toLocaleString('en-IN')} banks. Pick a bank to browse its
          branches by state and city, then open any branch for its full IFSC
          record.
        </p>
      </header>

      <nav className="az" aria-label="Jump to letter">
        {letters.map((l) => (
          <a key={l} href={`#${l}`} className="az-link">
            {l}
          </a>
        ))}
      </nav>

      {letters.map((l) => (
        <section key={l} className="az-group" id={l}>
          <h2 className="az-group__letter">{l}</h2>
          <div className="card-grid">
            {groups.get(l)!.map((b) => (
              <Link key={b.slug} href={urls.bank(b.slug)} className="tile">
                <span className="tile__name">{b.name}</span>
                <span className="tile__meta">
                  {b.branchCount.toLocaleString('en-IN')}{' '}
                  {b.branchCount === 1 ? 'branch' : 'branches'}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <p className="sr-only">{SITE_NAME} bank directory</p>
    </div>
  );
}

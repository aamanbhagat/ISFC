import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SchemaOrg } from '@/components/SchemaOrg';
import { listStates } from '@/lib/db';
import { buildBreadcrumbSchema } from '@/lib/schema';
import { SITE_URL, absoluteUrl, urls } from '@/lib/seo';

export const revalidate = 604800;

export const metadata: Metadata = {
  title: 'Browse Bank Branches by State',
  description:
    'Find IFSC and MICR codes by state. Browse every Indian state and union territory to narrow down to a bank, city and branch.',
  alternates: { canonical: absoluteUrl(urls.stateIndex()) },
};

export default async function StateIndexPage() {
  const states = await listStates();

  return (
    <div className="shell">
      <SchemaOrg
        schemas={[
          buildBreadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'States', url: absoluteUrl(urls.stateIndex()) },
          ]),
        ]}
      />
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'States' }]} />

      <header className="page-head">
        <h1 className="page-head__title">Bank branches by state</h1>
        <p className="page-head__sub">
          {states.length} states and union territories. Choose one to see which
          banks operate there.
        </p>
      </header>

      <div className="card-grid">
        {states.map((s) => (
          <Link key={s.stateSlug} href={urls.state(s.stateSlug)} className="tile">
            <span className="tile__name">{s.state}</span>
            <span className="tile__meta">
              {s.count.toLocaleString('en-IN')} branches
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

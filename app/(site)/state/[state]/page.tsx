import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SchemaOrg } from '@/components/SchemaOrg';
import { getBanksForState, getStateName, listStates } from '@/lib/db';
import { buildBreadcrumbSchema, buildItemListSchema } from '@/lib/schema';
import { SITE_URL, absoluteUrl, urls } from '@/lib/seo';

export const revalidate = 604800;
export const dynamicParams = true;

type Params = { params: Promise<{ state: string }> };

export async function generateStaticParams() {
  return (await listStates()).map((s) => ({ state: s.stateSlug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const name = await getStateName(stateSlug);
  if (!name) return { title: 'State not found', robots: { index: false } };
  return {
    title: `Bank IFSC Codes in ${name}`,
    description: `Banks operating in ${name}. Find IFSC, MICR and SWIFT codes for any branch by bank and city.`,
    alternates: { canonical: absoluteUrl(urls.state(stateSlug)) },
  };
}

export default async function StatePage({ params }: Params) {
  const { state: stateSlug } = await params;
  const name = await getStateName(stateSlug);
  if (!name) notFound();

  const banks = await getBanksForState(stateSlug);

  return (
    <div className="shell">
      <SchemaOrg
        schemas={[
          buildBreadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'States', url: absoluteUrl(urls.stateIndex()) },
            { name, url: absoluteUrl(urls.state(stateSlug)) },
          ]),
          buildItemListSchema(
            banks.map((b) => ({
              name: `${b.name} branches in ${name}`,
              url: absoluteUrl(urls.bankState(b.slug, stateSlug)),
            })),
          ),
        ]}
      />
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'States', href: urls.stateIndex() },
          { name },
        ]}
      />

      <header className="page-head">
        <h1 className="page-head__title">Bank IFSC codes in {name}</h1>
        <p className="page-head__sub">
          {banks.length} banks operate in {name}. Pick a bank to drill down to a
          city and branch.
        </p>
      </header>

      <div className="card-grid">
        {banks.map((b) => (
          <Link
            key={b.slug}
            href={urls.bankState(b.slug, stateSlug)}
            className="tile"
          >
            <span className="tile__name">{b.name}</span>
            <span className="tile__meta">
              {b.branchCount.toLocaleString('en-IN')}{' '}
              {b.branchCount === 1 ? 'branch' : 'branches'} in {name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SchemaOrg } from '@/components/SchemaOrg';
import { getBank, getStatesForBank, listBanks } from '@/lib/db';
import { buildBreadcrumbSchema, buildItemListSchema } from '@/lib/schema';
import { SITE_URL, absoluteUrl, urls } from '@/lib/seo';

export const revalidate = 604800;

type Params = { params: Promise<{ bank: string }> };

export async function generateStaticParams() {
  // Prerender the 150 largest banks; smaller banks render on demand (ISR).
  const banks = await listBanks();
  return banks
    .sort((a, b) => b.branchCount - a.branchCount)
    .slice(0, 150)
    .map((b) => ({ bank: b.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { bank: bankSlug } = await params;
  const bank = await getBank(bankSlug);
  if (!bank) return { title: 'Bank not found', robots: { index: false } };
  const canonical = absoluteUrl(urls.bank(bank.slug));
  return {
    title: `${bank.name} IFSC Codes — All Branches`,
    description: `Find IFSC, MICR and SWIFT codes for all ${bank.branchCount.toLocaleString(
      'en-IN',
    )} ${bank.name} branches across India. Browse by state and city.`,
    alternates: { canonical },
  };
}

export default async function BankPage({ params }: Params) {
  const { bank: bankSlug } = await params;
  const bank = await getBank(bankSlug);
  if (!bank) notFound();

  const states = await getStatesForBank(bankSlug);

  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Banks', href: urls.bankIndex() },
    { name: bank.name },
  ];

  return (
    <div className="shell">
      <SchemaOrg
        schemas={[
          buildBreadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'Banks', url: absoluteUrl(urls.bankIndex()) },
            { name: bank.name, url: absoluteUrl(urls.bank(bank.slug)) },
          ]),
          buildItemListSchema(
            states.map((s) => ({
              name: `${bank.name} branches in ${s.state}`,
              url: absoluteUrl(urls.bankState(bank.slug, s.stateSlug)),
            })),
          ),
        ]}
      />
      <Breadcrumbs items={crumbs} />

      <header className="page-head">
        <h1 className="page-head__title">{bank.name} IFSC codes</h1>
        <p className="page-head__sub">
          {bank.branchCount.toLocaleString('en-IN')} branches across{' '}
          {states.length} {states.length === 1 ? 'state' : 'states'}. Choose a
          state to narrow down to a city and branch.
        </p>
      </header>

      <div className="card-grid">
        {states.map((s) => (
          <Link
            key={s.stateSlug}
            href={urls.bankState(bank.slug, s.stateSlug)}
            className="tile"
          >
            <span className="tile__name">{s.state}</span>
            <span className="tile__meta">
              {s.count.toLocaleString('en-IN')}{' '}
              {s.count === 1 ? 'branch' : 'branches'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

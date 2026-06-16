import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SchemaOrg } from '@/components/SchemaOrg';
import { getBank, getCitiesForBankState, getStatesForBank } from '@/lib/db';
import { buildBreadcrumbSchema, buildItemListSchema } from '@/lib/schema';
import { SITE_URL, absoluteUrl, urls } from '@/lib/seo';

export const revalidate = 604800;
export const dynamicParams = true; // bank×state combos render on demand

type Params = { params: Promise<{ bank: string; state: string }> };

export async function generateStaticParams() {
  return []; // long tail — generated on first hit, then cached (ISR)
}

async function resolve(bankSlug: string, stateSlug: string) {
  const bank = await getBank(bankSlug);
  if (!bank) return null;
  const state = (await getStatesForBank(bankSlug)).find(
    (s) => s.stateSlug === stateSlug,
  );
  if (!state) return null;
  return { bank, state };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { bank: bankSlug, state: stateSlug } = await params;
  const r = await resolve(bankSlug, stateSlug);
  if (!r) return { title: 'Not found', robots: { index: false } };
  const canonical = absoluteUrl(urls.bankState(r.bank.slug, r.state.stateSlug));
  return {
    title: `${r.bank.name} IFSC Codes in ${r.state.state}`,
    description: `IFSC, MICR and SWIFT codes for ${r.bank.name} branches in ${r.state.state}. Browse by city to find your branch.`,
    alternates: { canonical },
  };
}

export default async function BankStatePage({ params }: Params) {
  const { bank: bankSlug, state: stateSlug } = await params;
  const r = await resolve(bankSlug, stateSlug);
  if (!r) notFound();
  const { bank, state } = r;

  const cities = await getCitiesForBankState(bankSlug, stateSlug);

  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Banks', href: urls.bankIndex() },
    { name: bank.name, href: urls.bank(bank.slug) },
    { name: state.state },
  ];

  return (
    <div className="shell">
      <SchemaOrg
        schemas={[
          buildBreadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'Banks', url: absoluteUrl(urls.bankIndex()) },
            { name: bank.name, url: absoluteUrl(urls.bank(bank.slug)) },
            {
              name: state.state,
              url: absoluteUrl(urls.bankState(bank.slug, state.stateSlug)),
            },
          ]),
          buildItemListSchema(
            cities.map((c) => ({
              name: `${bank.name} branches in ${c.city}`,
              url: absoluteUrl(urls.bankCity(bank.slug, state.stateSlug, c.citySlug)),
            })),
          ),
        ]}
      />
      <Breadcrumbs items={crumbs} />

      <header className="page-head">
        <h1 className="page-head__title">
          {bank.name} IFSC codes in {state.state}
        </h1>
        <p className="page-head__sub">
          {state.count.toLocaleString('en-IN')} branches across {cities.length}{' '}
          {cities.length === 1 ? 'city' : 'cities'}. Pick a city to see its
          branches.
        </p>
      </header>

      <div className="card-grid">
        {cities.map((c) => (
          <Link
            key={c.citySlug}
            href={urls.bankCity(bank.slug, state.stateSlug, c.citySlug)}
            className="tile"
          >
            <span className="tile__name">{c.city}</span>
            <span className="tile__meta">
              {c.count.toLocaleString('en-IN')}{' '}
              {c.count === 1 ? 'branch' : 'branches'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

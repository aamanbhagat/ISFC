import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { BankCityView } from '@/components/BankCityView';
import {
  getBank,
  getBranchesByBankCity,
  getCitiesForBankState,
  getStatesForBank,
} from '@/lib/db';
import { absoluteUrl, urls } from '@/lib/seo';

export const revalidate = 604800;
export const dynamicParams = true;

// Path-based pagination: /bank/[bank]/[state]/[city]/2, /3, … Page 1 lives at
// the base URL, so any "1" here redirects there. These pages are noindex,follow
// — they pass link equity to branches but never compete for the same query.
type Params = {
  params: Promise<{ bank: string; state: string; city: string; page: string }>;
};

export async function generateStaticParams() {
  return [];
}

async function resolve(bankSlug: string, stateSlug: string, citySlug: string) {
  const bank = await getBank(bankSlug);
  if (!bank) return null;
  const state = (await getStatesForBank(bankSlug)).find(
    (s) => s.stateSlug === stateSlug,
  );
  if (!state) return null;
  const city = (await getCitiesForBankState(bankSlug, stateSlug)).find(
    (c) => c.citySlug === citySlug,
  );
  if (!city) return null;
  return { bank, state, city };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { bank: bankSlug, state: stateSlug, city: citySlug } = await params;
  const r = await resolve(bankSlug, stateSlug, citySlug);
  if (!r) return { title: 'Not found', robots: { index: false } };
  return {
    title: `${r.bank.name} IFSC Codes in ${r.city.city}, ${r.state.state}`,
    description: `More ${r.bank.name} branches in ${r.city.city}, ${r.state.state}.`,
    // Canonical points back to page 1; deep pages stay out of the index.
    alternates: {
      canonical: absoluteUrl(
        urls.bankCity(r.bank.slug, r.state.stateSlug, r.city.citySlug),
      ),
    },
    robots: { index: false, follow: true },
  };
}

export default async function BankCityPagedPage({ params }: Params) {
  const { bank: bankSlug, state: stateSlug, city: citySlug, page: pageParam } =
    await params;

  const page = Number(pageParam);
  if (!Number.isInteger(page) || page < 1) notFound();
  if (page === 1) permanentRedirect(urls.bankCity(bankSlug, stateSlug, citySlug));

  const r = await resolve(bankSlug, stateSlug, citySlug);
  if (!r) notFound();

  const listing = await getBranchesByBankCity(bankSlug, stateSlug, citySlug, page);
  if (listing.items.length === 0) notFound();

  return (
    <BankCityView
      bank={r.bank}
      state={r.state}
      city={r.city}
      listing={listing}
    />
  );
}

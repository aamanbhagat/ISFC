import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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

type Params = { params: Promise<{ bank: string; state: string; city: string }> };

export async function generateStaticParams() {
  return []; // long tail — ISR on first hit
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
    description: `IFSC and MICR codes for all ${r.bank.name} branches in ${r.city.city}, ${r.state.state}. Tap a branch for its full record.`,
    alternates: {
      canonical: absoluteUrl(
        urls.bankCity(r.bank.slug, r.state.stateSlug, r.city.citySlug),
      ),
    },
  };
}

export default async function BankCityPage({ params }: Params) {
  const { bank: bankSlug, state: stateSlug, city: citySlug } = await params;
  const r = await resolve(bankSlug, stateSlug, citySlug);
  if (!r) notFound();

  const listing = await getBranchesByBankCity(bankSlug, stateSlug, citySlug, 1);
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

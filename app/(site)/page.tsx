import Link from 'next/link';
import { Building2, MapPin, ShieldCheck } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { BranchList } from '@/components/BranchList';
import { SchemaOrg } from '@/components/SchemaOrg';
import {
  getPopularBranches,
  listBanks,
  listStates,
} from '@/lib/db';
import { buildOrganizationSchema, buildWebsiteSchema } from '@/lib/schema';
import { DATA_RELEASE, SITE_NAME, urls } from '@/lib/seo';

export const revalidate = 604800; // 7d — corpus changes quarterly

export default async function HomePage() {
  const [popular, banks, states] = await Promise.all([
    getPopularBranches(12),
    listBanks(),
    listStates(),
  ]);

  const topBanks = banks.slice(0, 12);
  const topStates = [...states].sort((a, b) => b.count - a.count).slice(0, 12);

  return (
    <>
      <SchemaOrg schemas={[buildWebsiteSchema(), buildOrganizationSchema()]} />

      <section className="hero shell">
        <span className="hero-kicker">Reserve Bank of India · verified</span>
        <h1 className="hero-title">
          Every Indian bank branch, by its <em>IFSC code</em>.
        </h1>
        <p className="hero-sub">
          Look up the IFSC, MICR and SWIFT code, address and transfer support of
          any branch in India. One page per branch — confirmed against the RBI
          dataset.
        </p>
        <SearchBar autoFocus />
        <p className="hero-stat">
          <strong>{banks.length.toLocaleString('en-IN')}</strong> banks ·{' '}
          <strong>{states.length}</strong> states · {DATA_RELEASE} release
        </p>
      </section>

      <div className="shell stack">
        <section className="section">
          <p className="eyebrow">Popular branches</p>
          <h2 className="section-title">Frequently looked-up branches</h2>
          <BranchList items={popular} showLocation />
        </section>

        <section className="section">
          <p className="eyebrow">By bank</p>
          <h2 className="section-title">Browse major banks</h2>
          <div className="card-grid">
            {topBanks.map((b) => (
              <Link key={b.slug} href={urls.bank(b.slug)} className="tile">
                <span className="tile__name">{b.name}</span>
                <span className="tile__meta">
                  {b.branchCount.toLocaleString('en-IN')}{' '}
                  {b.branchCount === 1 ? 'branch' : 'branches'}
                </span>
              </Link>
            ))}
          </div>
          <p style={{ marginTop: 'var(--space-lg)' }}>
            <Link href={urls.bankIndex()}>See all {banks.length} banks →</Link>
          </p>
        </section>

        <section className="section">
          <p className="eyebrow">By state</p>
          <h2 className="section-title">Browse by state</h2>
          <div className="card-grid">
            {topStates.map((s) => (
              <Link key={s.stateSlug} href={urls.state(s.stateSlug)} className="tile">
                <span className="tile__name">{s.state}</span>
                <span className="tile__meta">
                  {s.count.toLocaleString('en-IN')} branches
                </span>
              </Link>
            ))}
          </div>
          <p style={{ marginTop: 'var(--space-lg)' }}>
            <Link href={urls.stateIndex()}>See all states →</Link>
          </p>
        </section>

        <section className="section">
          <div className="card-grid">
            <div className="tile" style={{ borderLeftColor: 'var(--brass)' }}>
              <ShieldCheck aria-hidden style={{ color: 'var(--vault)' }} />
              <span className="tile__name">Verified data</span>
              <span className="tile__meta">
                Sourced from the RBI dataset, refreshed each release.
              </span>
            </div>
            <div className="tile" style={{ borderLeftColor: 'var(--brass)' }}>
              <Building2 aria-hidden style={{ color: 'var(--vault)' }} />
              <span className="tile__name">Every branch</span>
              <span className="tile__meta">
                One dedicated page per branch, with the code segmented for clarity.
              </span>
            </div>
            <div className="tile" style={{ borderLeftColor: 'var(--brass)' }}>
              <MapPin aria-hidden style={{ color: 'var(--vault)' }} />
              <span className="tile__name">Browse or search</span>
              <span className="tile__meta">
                Find a branch by bank, state and city — or search instantly.
              </span>
            </div>
          </div>
        </section>

        <section className="section">
          <p className="note">
            New to IFSC codes?{' '}
            <Link href="/what-is-ifsc">
              Read how the 11-character code works
            </Link>{' '}
            — what each part means and where to find yours.
          </p>
        </section>
      </div>

      <p className="sr-only">{SITE_NAME}</p>
    </>
  );
}

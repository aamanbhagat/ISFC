import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { BranchList } from '@/components/BranchList';
import { SchemaOrg } from '@/components/SchemaOrg';
import { getPopularBranches, listBanks, listStates } from '@/lib/db';
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

      <section className="hero">
        <div className="guilloche" aria-hidden />
        <div className="hero__inner">
          <span className="hero-kicker">
            <span className="hero-kicker__dot" aria-hidden />
            Reserve Bank of India · verified
          </span>
          <h1 className="hero-title">
            Every Indian bank branch, <em>by its IFSC code</em>.
          </h1>
          <p className="hero-sub">
            Look up the IFSC, MICR and SWIFT code, address and transfer support
            of any branch — one page per branch, confirmed against the RBI
            dataset.
          </p>
          <SearchBar autoFocus />
          <p className="hero-stat">
            <span>
              <strong>{banks.length.toLocaleString('en-IN')}</strong> banks
            </span>
            <span>
              <strong>{states.length}</strong> states
            </span>
            <span>{DATA_RELEASE} release</span>
          </p>
        </div>
      </section>

      <div className="shell stack" style={{ marginTop: 'var(--space-3xl)' }}>
        <section>
          <p className="eyebrow">Popular branches</p>
          <h2 className="section-title">Frequently looked-up branches</h2>
          <p className="section-sub">
            A few flagship branches across India’s biggest banks.
          </p>
          <BranchList items={popular} showLocation />
        </section>

        <section>
          <p className="eyebrow">By bank</p>
          <h2 className="section-title">Browse major banks</h2>
          <p className="section-sub">
            Pick a bank to drill down by state, city and branch.
          </p>
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
          <Link href={urls.bankIndex()} className="link-more">
            See all {banks.length.toLocaleString('en-IN')} banks <ArrowRight size={16} />
          </Link>
        </section>

        <section>
          <p className="eyebrow">By state</p>
          <h2 className="section-title">Browse by state</h2>
          <p className="section-sub">
            Every state and union territory, ranked by branch count.
          </p>
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
          <Link href={urls.stateIndex()} className="link-more">
            See all states <ArrowRight size={16} />
          </Link>
        </section>

        <section>
          <p className="eyebrow">Why IFSCKosh</p>
          <h2 className="section-title">Built to be the fastest lookup</h2>
          <div className="card-grid" style={{ marginTop: 'var(--space-xl)' }}>
            <div className="tile">
              <ShieldCheck aria-hidden />
              <span className="tile__name">Verified data</span>
              <span className="tile__meta">
                Sourced straight from the RBI dataset and refreshed each release.
              </span>
            </div>
            <div className="tile">
              <Building2 aria-hidden />
              <span className="tile__name">Every branch</span>
              <span className="tile__meta">
                A dedicated page per branch, with the code segmented for clarity.
              </span>
            </div>
            <div className="tile">
              <MapPin aria-hidden />
              <span className="tile__name">Browse or search</span>
              <span className="tile__meta">
                Find a branch by bank, state and city — or search instantly.
              </span>
            </div>
          </div>
        </section>

        <section>
          <p className="note">
            <span>
              New to IFSC codes?{' '}
              <Link href="/what-is-ifsc">Read how the 11-character code works</Link>{' '}
              — what each part means and where to find yours.
            </span>
          </p>
        </section>
      </div>

      <p className="sr-only">{SITE_NAME}</p>
    </>
  );
}

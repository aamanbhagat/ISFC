import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { BranchList } from '@/components/BranchList';
import { BranchTable } from '@/components/BranchTable';
import { FaqList } from '@/components/FaqList';
import { IfscPlate } from '@/components/IfscPlate';
import { SchemaOrg } from '@/components/SchemaOrg';
import { TransferBadges } from '@/components/TransferBadges';
import { getBranch, getSiblingBranches, getTopBranchIfscs } from '@/lib/db';
import { buildBranchFaqs } from '@/lib/faq';
import { isValidIfsc } from '@/lib/ifsc';
import {
  buildBranchSchema,
  buildBreadcrumbSchema,
  buildFAQSchema,
} from '@/lib/schema';
import { SITE_URL, absoluteUrl, urls } from '@/lib/seo';

export const revalidate = 604800; // 7d
export const dynamicParams = true; // long tail renders on demand, then caches

type Params = { params: Promise<{ ifsc: string }> };

export async function generateStaticParams() {
  // Prerender only a bounded, high-value set; the rest is ISR on first hit.
  // Keeps the Vercel build fast against a remote DB — the long tail (and the
  // full URL set) is still covered by the sitemaps.
  const ifscs = await getTopBranchIfscs(800);
  return ifscs.map((ifsc) => ({ ifsc: ifsc.toLowerCase() }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { ifsc } = await params;
  const code = ifsc.toUpperCase();
  if (!isValidIfsc(code)) return { title: 'Branch not found', robots: { index: false } };

  const branch = await getBranch(code);
  if (!branch) return { title: 'Branch not found', robots: { index: false } };

  const canonical = absoluteUrl(urls.branch(branch.ifsc));
  const title = `${branch.bankName} ${branch.branch} IFSC Code ${branch.ifsc} — ${branch.city}, ${branch.state}`;
  const modes = [
    branch.neft && 'NEFT',
    branch.rtgs && 'RTGS',
    branch.imps && 'IMPS',
  ]
    .filter(Boolean)
    .join('/');
  const description = `IFSC code ${branch.ifsc}${
    branch.micr ? `, MICR ${branch.micr}` : ''
  } for ${branch.bankName}, ${branch.branch} branch in ${branch.city}, ${branch.state}. Address and ${modes} transfer details — verified from the RBI dataset.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website' },
  };
}

export default async function BranchPage({ params }: Params) {
  const { ifsc } = await params;
  const code = ifsc.toUpperCase();

  if (!isValidIfsc(code)) notFound();
  // One URL per resource: canonicalise to the lowercase form.
  if (ifsc !== ifsc.toLowerCase()) permanentRedirect(urls.branch(code));

  const branch = await getBranch(code);
  if (!branch) notFound();

  const [siblings, faqs] = await Promise.all([
    getSiblingBranches(branch.bankSlug, branch.citySlug, branch.ifsc, 12),
    Promise.resolve(buildBranchFaqs(branch)),
  ]);

  const crumbs = [
    { name: 'Home', href: '/' },
    { name: branch.bankName, href: urls.bank(branch.bankSlug) },
    { name: branch.state, href: urls.bankState(branch.bankSlug, branch.stateSlug) },
    {
      name: branch.city,
      href: urls.bankCity(branch.bankSlug, branch.stateSlug, branch.citySlug),
    },
    { name: branch.branch },
  ];

  const breadcrumbSchema = buildBreadcrumbSchema(
    crumbs.map((c) => ({
      name: c.name,
      url: c.href ? `${SITE_URL}${c.href}` : absoluteUrl(urls.branch(branch.ifsc)),
    })),
  );

  return (
    <div className="shell">
      <SchemaOrg
        schemas={[
          buildBranchSchema(branch),
          breadcrumbSchema,
          buildFAQSchema(faqs),
        ]}
      />

      <Breadcrumbs items={crumbs} />

      <header className="leaf-head">
        <h1 className="leaf-title">
          {branch.bankName} — {branch.branch}
          <span>IFSC Code, {branch.city}, {branch.state}</span>
        </h1>
      </header>

      <IfscPlate ifsc={branch.ifsc} />
      <TransferBadges branch={branch} />
      <BranchTable branch={branch} />

      {siblings.length > 0 && (
        <section className="section">
          <p className="eyebrow">Same bank, same city</p>
          <h2 className="section-title">
            Other {branch.bankName} branches in {branch.city}
          </h2>
          <BranchList items={siblings} />
          <p style={{ marginTop: 'var(--space-lg)' }}>
            <Link href={urls.bankCity(branch.bankSlug, branch.stateSlug, branch.citySlug)}>
              All {branch.bankName} branches in {branch.city} →
            </Link>
          </p>
        </section>
      )}

      <section className="section">
        <p className="eyebrow">Questions</p>
        <h2 className="section-title">Frequently asked</h2>
        <FaqList items={faqs} />
      </section>
    </div>
  );
}

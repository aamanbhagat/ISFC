import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SITE_NAME, DATA_SOURCE, absoluteUrl } from '@/lib/seo';

export const revalidate = 604800;

export const metadata: Metadata = {
  title: 'About',
  description: `${SITE_NAME} is a free, fast directory of IFSC, MICR and SWIFT codes for every bank branch in India.`,
  alternates: { canonical: absoluteUrl('/about') },
};

export default function AboutPage() {
  return (
    <div className="shell shell--narrow">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'About' }]} />
      <header className="page-head">
        <h1 className="page-head__title">About {SITE_NAME}</h1>
      </header>
      <article className="prose">
        <p>
          {SITE_NAME} is a free directory of IFSC, MICR and SWIFT codes for every
          bank branch in India. Each branch has its own page with the code
          segmented for clarity, the full address, and which transfers the branch
          supports.
        </p>
        <p>
          Data is sourced from {DATA_SOURCE} and refreshed with each release.
          We keep pages fast and ad-light so you can find a code and get on with
          your transfer.
        </p>
        <p>
          {SITE_NAME} is an independent reference and is not affiliated with the
          Reserve Bank of India or any bank. Always confirm critical transfer
          details with your bank before sending money.
        </p>
      </article>
    </div>
  );
}

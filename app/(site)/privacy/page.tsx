import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SITE_NAME, absoluteUrl } from '@/lib/seo';

export const revalidate = 604800;

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${SITE_NAME} handles data and privacy.`,
  alternates: { canonical: absoluteUrl('/privacy') },
};

export default function PrivacyPage() {
  return (
    <div className="shell shell--narrow">
      <Breadcrumbs
        items={[{ name: 'Home', href: '/' }, { name: 'Privacy' }]}
      />
      <header className="page-head">
        <h1 className="page-head__title">Privacy policy</h1>
      </header>
      <article className="prose">
        <p>
          {SITE_NAME} is a reference directory. We don’t ask you to create an
          account and we don’t collect personal information to look up a code.
        </p>
        <h2>What we process</h2>
        <p>
          Search queries are sent to our server only to return matching branches
          and are not tied to your identity. We may use privacy-respecting
          analytics to understand which pages are useful, in aggregate.
        </p>
        <h2>Third parties</h2>
        <p>
          If advertising is shown, ad providers may set their own cookies under
          their own policies. Branch data is sourced from the public Reserve Bank
          of India dataset.
        </p>
        <h2>Contact</h2>
        <p>
          Questions about privacy? Reach us via the{' '}
          <a href="/contact">contact page</a>.
        </p>
      </article>
    </div>
  );
}

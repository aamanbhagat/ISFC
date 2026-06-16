import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CONTACT_EMAIL, SITE_NAME, absoluteUrl } from '@/lib/seo';

export const revalidate = 604800;

export const metadata: Metadata = {
  title: 'Contact',
  description: `Report a correction or get in touch with ${SITE_NAME}.`,
  alternates: { canonical: absoluteUrl('/contact') },
};

export default function ContactPage() {
  return (
    <div className="shell shell--narrow">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Contact' }]} />
      <header className="page-head">
        <h1 className="page-head__title">Contact</h1>
      </header>
      <article className="prose">
        <p>
          Spotted a branch detail that looks wrong, or a branch that’s missing?
          We’d like to fix it. Email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with the IFSC
          code and what needs correcting.
        </p>
        <p>
          Branch records come from the Reserve Bank of India dataset, so some
          corrections take effect only after the next official release.
        </p>
      </article>
    </div>
  );
}

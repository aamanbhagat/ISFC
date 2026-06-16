import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { FaqList } from '@/components/FaqList';
import { SchemaOrg } from '@/components/SchemaOrg';
import { buildBreadcrumbSchema, buildFAQSchema } from '@/lib/schema';
import { SITE_URL, absoluteUrl } from '@/lib/seo';
import type { FaqItem } from '@/types/ifsc';

export const revalidate = 604800;

export const metadata: Metadata = {
  title: 'What Is an IFSC Code? Format, Meaning & How to Find Yours',
  description:
    'An IFSC code is an 11-character code that identifies a bank branch for NEFT, RTGS and IMPS transfers. Learn what each part means and how to find your branch code.',
  alternates: { canonical: absoluteUrl('/what-is-ifsc') },
};

const FAQS: FaqItem[] = [
  {
    question: 'What does IFSC stand for?',
    answer:
      'IFSC stands for Indian Financial System Code — an 11-character code assigned by the Reserve Bank of India to identify a specific bank branch in electronic fund transfers.',
  },
  {
    question: 'How many digits is an IFSC code?',
    answer:
      'An IFSC code is 11 characters: the first four letters are the bank code, the fifth character is always 0 (reserved), and the last six characters identify the branch.',
  },
  {
    question: 'Is the IFSC code the same as the MICR code?',
    answer:
      'No. The IFSC is used for online transfers (NEFT, RTGS, IMPS). The MICR code is a 9-digit number printed on cheques and read by cheque-sorting machines. A branch usually has both.',
  },
  {
    question: 'Where do I find my IFSC code?',
    answer:
      'It is printed on your cheque book and passbook, shown in your bank’s app or net banking, and listed here on IFSCKosh — search for your bank and branch.',
  },
];

export default function WhatIsIfscPage() {
  return (
    <div className="shell shell--narrow">
      <SchemaOrg
        schemas={[
          buildBreadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'What is IFSC', url: absoluteUrl('/what-is-ifsc') },
          ]),
          buildFAQSchema(FAQS),
        ]}
      />
      <Breadcrumbs
        items={[{ name: 'Home', href: '/' }, { name: 'What is IFSC' }]}
      />

      <header className="page-head">
        <h1 className="page-head__title">What is an IFSC code?</h1>
        <p className="page-head__sub">
          The Indian Financial System Code is how India’s payment systems know
          exactly which bank branch an account belongs to.
        </p>
      </header>

      <article className="prose">
        <p>
          An <strong>IFSC code</strong> (Indian Financial System Code) is an
          11-character code issued by the Reserve Bank of India. Every branch
          that takes part in electronic transfers — <strong>NEFT</strong>,{' '}
          <strong>RTGS</strong> and <strong>IMPS</strong> — has one, and it
          uniquely identifies that branch when you send or receive money.
        </p>

        <h2>What the 11 characters mean</h2>
        <p>
          Take <code>HDFC0000001</code> as an example. The code breaks into three
          parts:
        </p>
        <ul>
          <li>
            <strong>First four letters</strong> (<code>HDFC</code>) — the bank
            code, identifying the bank.
          </li>
          <li>
            <strong>Fifth character</strong> (<code>0</code>) — always zero,
            reserved by the RBI for future use.
          </li>
          <li>
            <strong>Last six characters</strong> (<code>000001</code>) — the
            branch code, identifying the exact branch.
          </li>
        </ul>

        <h2>IFSC vs MICR vs SWIFT</h2>
        <p>
          These three codes do different jobs. The <strong>IFSC</strong> routes
          domestic online transfers. The <strong>MICR</strong> code is a 9-digit
          number on your cheques used by sorting machines. The{' '}
          <strong>SWIFT/BIC</strong> code is for international transfers. A branch
          page on IFSCKosh shows whichever of these the RBI dataset lists.
        </p>

        <h2>How to find your IFSC code</h2>
        <p>
          The fastest way is to{' '}
          <Link href="/">search by bank and branch</Link> on this site. You can
          also read it from your cheque book or passbook, or find it inside your
          bank’s mobile app and net banking under account details.
        </p>
      </article>

      <section className="section">
        <h2 className="section-title">Frequently asked</h2>
        <FaqList items={FAQS} />
      </section>
    </div>
  );
}

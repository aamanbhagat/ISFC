import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="shell shell--narrow" style={{ paddingBlock: 'var(--space-3xl)' }}>
      <p className="eyebrow">404</p>
      <h1 className="page-head__title">Branch not found</h1>
      <p className="page-head__sub" style={{ marginTop: 'var(--space-md)' }}>
        That IFSC code or page doesn’t exist in our directory. Check the code and
        try again, or search for the bank and branch.
      </p>
      <p style={{ marginTop: 'var(--space-lg)' }}>
        <Link href="/" className="page-link">
          Search IFSCKosh
        </Link>
      </p>
    </div>
  );
}

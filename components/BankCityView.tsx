import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { BranchList } from '@/components/BranchList';
import { SchemaOrg } from '@/components/SchemaOrg';
import { buildBreadcrumbSchema } from '@/lib/schema';
import { SITE_URL, absoluteUrl, urls } from '@/lib/seo';
import type { BankSummary, BranchListing, CityGroup, StateGroup } from '@/types/ifsc';

// Shared body for the bank/city hub and its path-based pagination pages. Page 1
// lives at the base URL; deeper pages at /…/[city]/2, /…/[city]/3 (noindex).
export function BankCityView({
  bank,
  state,
  city,
  listing,
}: {
  bank: BankSummary;
  state: StateGroup;
  city: CityGroup;
  listing: BranchListing;
}) {
  const base = urls.bankCity(bank.slug, state.stateSlug, city.citySlug);
  const totalPages = Math.max(1, Math.ceil(listing.total / listing.perPage));
  const page = listing.page;

  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Banks', href: urls.bankIndex() },
    { name: bank.name, href: urls.bank(bank.slug) },
    { name: state.state, href: urls.bankState(bank.slug, state.stateSlug) },
    { name: city.city },
  ];

  return (
    <div className="shell">
      <SchemaOrg
        schemas={[
          buildBreadcrumbSchema([
            { name: 'Home', url: SITE_URL },
            { name: 'Banks', url: absoluteUrl(urls.bankIndex()) },
            { name: bank.name, url: absoluteUrl(urls.bank(bank.slug)) },
            {
              name: state.state,
              url: absoluteUrl(urls.bankState(bank.slug, state.stateSlug)),
            },
            { name: city.city, url: absoluteUrl(base) },
          ]),
        ]}
      />
      <Breadcrumbs items={crumbs} />

      <header className="page-head">
        <h1 className="page-head__title">
          {bank.name} branches in {city.city}
        </h1>
        <p className="page-head__sub">
          {listing.total.toLocaleString('en-IN')} {bank.name}{' '}
          {listing.total === 1 ? 'branch' : 'branches'} in {city.city},{' '}
          {state.state}. Tap any branch for its IFSC, MICR and address.
        </p>
      </header>

      <BranchList items={listing.items} />

      {totalPages > 1 && (
        <nav className="pagination" aria-label="Pagination">
          {page > 1 && (
            <Link
              className="page-link"
              href={page === 2 ? base : `${base}/${page - 1}`}
              rel="prev"
            >
              ← Previous
            </Link>
          )}
          <span className="page-status">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link className="page-link" href={`${base}/${page + 1}`} rel="next">
              Next →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

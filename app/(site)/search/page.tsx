import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { BranchList } from '@/components/BranchList';
import { SearchBar } from '@/components/SearchBar';
import { searchBranches } from '@/lib/db';

// Results render server-side too, so the page works without JS. It is
// noindex,follow and blocked from crawling (robots ?* rule); it exists for
// users, while the sitemap handles branch discovery.
export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();
  const results = query.length >= 2 ? await searchBranches(query, 30) : [];

  return (
    <div className="shell shell--narrow">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Search' }]} />

      <header className="page-head">
        <h1 className="page-head__title">Search bank branches</h1>
        <p className="page-head__sub">
          Search by IFSC code, bank, branch or city.
        </p>
      </header>

      <SearchBar autoFocus />

      <div className="section">
        {query.length < 2 ? (
          <p className="page-status">Type at least two characters to search.</p>
        ) : results.length === 0 ? (
          <p className="page-status">No branches match “{query}”.</p>
        ) : (
          <>
            <p className="eyebrow">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </p>
            <BranchList items={results} showLocation />
          </>
        )}
      </div>
    </div>
  );
}

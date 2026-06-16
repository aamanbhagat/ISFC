import Link from 'next/link';
import { urls } from '@/lib/seo';
import type { BranchSummary } from '@/types/ifsc';

// A compact, crawlable list of branch links. Used on hubs and as leaf
// cross-links. Each row is a real <a href> so crawlers traverse without JS.
export function BranchList({
  items,
  showLocation = false,
}: {
  items: BranchSummary[];
  showLocation?: boolean;
}) {
  return (
    <ul className="branch-list">
      {items.map((b) => (
        <li key={b.ifsc}>
          <Link href={urls.branch(b.ifsc)} className="branch-row">
            <span className="branch-row__name">
              {b.bankName} — {b.branch}
              {showLocation && (
                <span className="branch-row__loc">
                  {b.city}, {b.state}
                </span>
              )}
            </span>
            <span className="branch-row__ifsc t-mono">{b.ifsc}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

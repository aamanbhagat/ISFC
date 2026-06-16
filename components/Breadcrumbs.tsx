import Link from 'next/link';

export interface Crumb {
  name: string;
  href?: string;
}

// Visible breadcrumb trail. The matching BreadcrumbList JSON-LD is emitted
// separately on each page via lib/schema.
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={`${item.name}-${i}`} className="breadcrumb__item">
            {item.href && !last ? (
              <Link href={item.href}>{item.name}</Link>
            ) : (
              <span className="breadcrumb__current" aria-current="page">
                {item.name}
              </span>
            )}
            {!last && <span className="breadcrumb__sep" aria-hidden>›</span>}
          </span>
        );
      })}
    </nav>
  );
}

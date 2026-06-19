import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { SITE_URL } from '@/lib/seo';
import styles from './blog.module.css';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Blog — Guides on IFSC, MICR & Bank Transfers',
  description:
    'Plain-English guides on IFSC and MICR codes, NEFT/RTGS/IMPS transfers and how Indian banking codes work.',
  alternates: { canonical: `${SITE_URL}/blog` },
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function BlogIndex() {
  const posts = getAllPosts();
  return (
    <div className="shell shell--narrow">
      <header className="leaf-head">
        <p className="eyebrow">Blog</p>
        <h1 className="section-title">Guides &amp; explainers</h1>
        <p className="section-sub">
          How IFSC and MICR codes work, and how to move money between Indian
          banks with confidence.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="section-sub">Nothing published yet. Check back soon.</p>
      ) : (
        <ul className={styles.list}>
          {posts.map((p) => (
            <li key={p.slug} className={styles.item}>
              <Link href={`/blog/${p.slug}`} className={styles.itemLink}>
                {p.frontmatter.cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className={styles.thumb}
                    src={p.frontmatter.cover}
                    alt={p.frontmatter.coverAlt || p.frontmatter.title}
                    width={1200}
                    height={630}
                    loading="lazy"
                  />
                )}
                <div>
                  <p className={styles.meta}>
                    <span className={styles.metaCat}>
                      {p.frontmatter.category}
                    </span>
                    <span className={styles.sep}>·</span>
                    <span>{fmtDate(p.frontmatter.publishedAt)}</span>
                    <span className={styles.sep}>·</span>
                    <span>{p.readingTimeMinutes} min read</span>
                  </p>
                  <h2 className={styles.itemTitle}>{p.frontmatter.title}</h2>
                  <p className={styles.itemDesc}>{p.frontmatter.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

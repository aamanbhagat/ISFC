import Link from 'next/link';
import { Search } from 'lucide-react';
import { CommandPalette } from '@/components/CommandPalette';
import { SITE_NAME, urls } from '@/lib/seo';

const YEAR = new Date().getFullYear();

function Wordmark() {
  return (
    <Link href="/" className="wordmark" aria-label={`${SITE_NAME} home`}>
      <span className="wordmark__mark" aria-hidden>
        IK
      </span>
      IFSC<span className="wordmark__kosh">Kosh</span>
    </Link>
  );
}

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CommandPalette />

      <header className="site-header">
        <div className="shell masthead">
          <Wordmark />
          <div className="masthead__spacer" />
          <button type="button" className="kbd-btn" data-search-open aria-label="Search">
            <Search aria-hidden />
            <span className="kbd-btn__label">Search branches…</span>
            <span className="kbd">⌘K</span>
          </button>
          <nav className="site-nav" aria-label="Browse">
            <Link href={urls.bankIndex()} className="nav-link">
              Banks
            </Link>
            <Link href={urls.stateIndex()} className="nav-link">
              States
            </Link>
            <Link href="/what-is-ifsc" className="nav-link">
              What is IFSC
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" className="content-main">
        {children}
      </main>

      <footer className="site-footer">
        <div className="shell">
          <div className="footer-grid">
            <div>
              <Wordmark />
              <p className="footer-blurb">
                IFSC, MICR and SWIFT codes for every bank branch in India —
                verified against the Reserve Bank of India dataset.
              </p>
            </div>
            <nav aria-label="Browse the directory">
              <p className="eyebrow">Browse</p>
              <div className="footer-links">
                <Link href={urls.bankIndex()}>All banks</Link>
                <Link href={urls.stateIndex()}>All states</Link>
                <Link href="/what-is-ifsc">What is an IFSC code</Link>
              </div>
            </nav>
            <nav aria-label="About this site">
              <p className="eyebrow">{SITE_NAME}</p>
              <div className="footer-links">
                <Link href="/about">About</Link>
                <Link href="/contact">Contact</Link>
                <Link href="/privacy">Privacy</Link>
              </div>
            </nav>
          </div>
          <p className="footer-legal">
            © {YEAR} {SITE_NAME}. Data sourced from the Reserve Bank of India
            via the public razorpay/ifsc dataset. Always confirm critical
            transfer details with your bank. {SITE_NAME} is not affiliated with
            the RBI or any bank.
          </p>
        </div>
      </footer>
    </>
  );
}

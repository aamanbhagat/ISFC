import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Inter, Space_Mono } from 'next/font/google';
import './globals.css';
import { SITE_NAME, SITE_URL } from '@/lib/seo';

// Display — technical grotesque (headings, wordmark, hero).
const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-display',
});

// Body & UI — neutral, like the annotation text on an engineering drawing.
const body = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

// The hero role: the IFSC code as a machine-cut coordinate string.
const mono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-mono',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b0e14',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — IFSC, MICR & SWIFT Codes for Every Indian Bank Branch`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Find the IFSC code, MICR code and address of any bank branch in India. Verified against the Reserve Bank of India dataset. Fast, free, and ad-light.',
  applicationName: SITE_NAME,
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_IN',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : {},
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const fontVars = `${display.variable} ${body.variable} ${mono.variable}`;
  return (
    <html lang="en" className={`${fontVars} h-full`}>
      <body className="min-h-full">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

import type { MetadataRoute } from 'next';
import { SITE_NAME } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — IFSC Code Directory`,
    short_name: SITE_NAME,
    description:
      'IFSC, MICR and SWIFT codes for every bank branch in India, verified against the RBI dataset.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fbfcfe',
    theme_color: '#0b0e14',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}

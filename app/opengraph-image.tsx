import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/seo';

export const alt = `${SITE_NAME} — IFSC codes for every Indian bank branch`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Default social card for every page (per-page routes can override later).
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0b0e14',
          color: '#ffffff',
          padding: '80px',
          fontFamily: 'monospace',
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              border: '2px solid #fff',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            IK
          </div>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 700 }}>
            IFSC<span style={{ color: '#7aa2ff' }}>Kosh</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
              fontFamily: 'sans-serif',
              maxWidth: 1000,
            }}
          >
            Every Indian bank branch, by its&nbsp;
            <span style={{ color: '#5b8cff' }}>IFSC code</span>.
          </div>
          <div style={{ fontSize: 28, color: '#a6abd6' }}>
            IFSC · MICR · SWIFT — verified from the RBI dataset
          </div>
        </div>

        <div style={{ fontSize: 22, color: '#8b93a4' }}>ifsckosh.in</div>
      </div>
    ),
    { ...size },
  );
}

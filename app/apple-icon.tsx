import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Apple touch icon as a real PNG (iOS doesn't render SVG touch icons well).
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b0e14',
          color: '#fff',
          fontFamily: 'monospace',
          fontSize: 92,
          fontWeight: 700,
          letterSpacing: 2,
          position: 'relative',
        }}
      >
        IK
        <div
          style={{
            position: 'absolute',
            bottom: 34,
            width: 96,
            height: 8,
            borderRadius: 4,
            background: '#1a56ff',
          }}
        />
      </div>
    ),
    { ...size },
  );
}

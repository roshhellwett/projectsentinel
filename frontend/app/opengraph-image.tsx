// last edited 2026-05-17 by roshhellwett

import { ImageResponse } from 'next/og';

export const alt = 'India Verified';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fbfbfd',
          position: 'relative',
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        }}
      >

        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />


        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>


          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: 32,
              background: 'linear-gradient(145deg, #111111, #0a0a0a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 32px 64px rgba(0,0,0,0.18)',
              border: '1px solid rgba(255,255,255,0.07)',
              marginBottom: 40,
            }}
          >
            <span
              style={{
                color: 'rgba(255,255,255,0.92)',
                fontSize: 52,
                fontWeight: 200,
                letterSpacing: '6px',
                marginLeft: '6px',
              }}
            >
              IV
            </span>
          </div>


          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: '#0d0d0d',
              letterSpacing: '0',
              lineHeight: 1,
              marginBottom: 20,
            }}
          >
            India Verified
          </div>


          <div
            style={{
              fontSize: 28,
              fontWeight: 300,
              color: '#666666',
              letterSpacing: '0.2px',
            }}
          >
            AI-Verified Indian News · No Ads · No Bias
          </div>


          <div
            style={{
              width: 48,
              height: 3,
              borderRadius: 99,
              backgroundColor: '#0d0d0d',
              marginTop: 36,
              opacity: 0.12,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'India Verified - AI-Verified Indian News';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FBFBFD 48%, #F2F4F8 100%)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Dot grid texture */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(15,23,42,0.045) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          display: 'flex',
        }} />

        {/* Tricolor top bar */}
        <div style={{ position: 'absolute', top: 0, left: '96px', right: '96px', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(10,132,255,0.36), transparent)', display: 'flex' }} />
        <div style={{ position: 'absolute', top: '48px', left: '54px', right: '54px', height: '534px', borderRadius: '44px', background: 'linear-gradient(145deg, rgba(255,255,255,0.94), rgba(255,255,255,0.66))', border: '1px solid rgba(17,24,39,0.10)', boxShadow: '0 40px 120px rgba(15,23,42,0.10), 0 28px 90px rgba(10,132,255,0.12)', display: 'flex' }} />
        <div style={{ position: 'absolute', left: '160px', top: '322px', fontSize: '150px', lineHeight: 1, fontWeight: 900, letterSpacing: '-0.06em', color: 'rgba(15,23,42,0.035)', display: 'flex' }}>Verified News</div>

        {/* Saffron corner glow top-right */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(10,132,255,0.18) 0%, rgba(90,200,250,0.08) 45%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Green glow bottom-left */}
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-80px',
          width: '360px', height: '360px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(191,90,242,0.08) 0%, rgba(10,132,255,0.06) 45%, transparent 70%)',
          display: 'flex',
        }} />

        {/* LEFT — Text */}
        <div style={{
          position: 'absolute', left: '88px', top: '120px',
          display: 'flex', flexDirection: 'column', gap: '0px',
        }}>
          {/* Logo mark */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px',
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '17px',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.96), rgba(234,244,255,0.78))',
              border: '1px solid rgba(17,24,39,0.10)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.92), 0 18px 46px rgba(10,132,255,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: '900', color: '#0A84FF', letterSpacing: '-0.08em',
            }}>IV</div>
            <span style={{ fontSize: '22px', fontWeight: '800', color: '#111827', letterSpacing: '0.02em' }}>
              INDIA VERIFIED
            </span>
          </div>

          <div style={{ fontSize: '70px', fontWeight: '850', color: '#0F172A', lineHeight: '0.98', letterSpacing: '-0.055em', display: 'flex' }}>
            A calmer, smarter front page for India.
          </div>
          <div style={{ fontSize: '27px', fontWeight: '400', color: '#4B5563', marginTop: '24px', lineHeight: '1.38', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span>Cross-referenced stories, credibility scores,</span>
            <span>and clear source links — without noise.</span>
          </div>

          {/* Pills */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
            {['35+ Sources', 'Cross-verified', 'Credibility Score'].map((t) => (
              <div key={t} style={{
                padding: '8px 20px', borderRadius: '999px',
                border: '1px solid rgba(17,24,39,0.10)',
                background: 'rgba(255,255,255,0.74)',
                color: '#4B5563', fontSize: '18px', fontWeight: '700',
                display: 'flex',
              }}>{t}</div>
            ))}
          </div>
        </div>

        {/* RIGHT — Floating card illustration */}
        <div style={{
          position: 'absolute', right: '80px', top: '90px',
          width: '340px', height: '420px',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.94), rgba(255,255,255,0.62))',
          border: '1px solid rgba(17,24,39,0.10)',
          borderRadius: '34px',
          display: 'flex', flexDirection: 'column',
          padding: '36px',
          gap: '16px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 34px 90px rgba(15,23,42,0.12), 0 28px 80px rgba(10,132,255,0.16)',
        }}>
          {/* Category pill */}
          <div style={{ display: 'flex' }}>
            <div style={{
              background: 'rgba(10,132,255,0.12)', border: '1px solid rgba(10,132,255,0.24)',
              borderRadius: '999px', padding: '6px 16px',
              color: '#0A84FF', fontSize: '14px', fontWeight: '700', display: 'flex',
            }}>VERIFIED</div>
          </div>

          {/* Lines simulating headline */}
          <div style={{ width: '100%', height: '18px', borderRadius: '9px', background: '#0F172A', opacity: 0.84, display: 'flex' }} />
          <div style={{ width: '80%', height: '18px', borderRadius: '9px', background: '#0F172A', opacity: 0.84, display: 'flex' }} />

          {/* Summary lines */}
          <div style={{ width: '100%', height: '12px', borderRadius: '6px', background: '#CBD5E1', display: 'flex' }} />
          <div style={{ width: '90%', height: '12px', borderRadius: '6px', background: '#CBD5E1', display: 'flex' }} />
          <div style={{ width: '75%', height: '12px', borderRadius: '6px', background: '#CBD5E1', display: 'flex' }} />

          {/* Verification strip */}
          <div style={{
            marginTop: 'auto',
            background: 'rgba(34,197,94,0.10)',
            border: '1px solid rgba(34,197,94,0.24)',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'transparent',
              border: '4px solid #22C55E',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0F172A', fontSize: '13px', fontWeight: '900',
            }}>92</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ color: '#0F172A', fontSize: '16px', fontWeight: '800', display: 'flex' }}>Verified</div>
              <div style={{ color: '#64748B', fontSize: '13px', fontWeight: '600', display: 'flex' }}>3 independent sources</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

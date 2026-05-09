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
          background: 'linear-gradient(135deg, #0F1D45 0%, #1E3A8A 100%)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Dot grid texture */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          display: 'flex',
        }} />

        {/* Tricolor top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: '#FF9933', display: 'flex' }} />
        <div style={{ position: 'absolute', top: '8px', left: 0, right: 0, height: '8px', background: '#FFFFFF', display: 'flex' }} />
        <div style={{ position: 'absolute', top: '16px', left: 0, right: 0, height: '8px', background: '#138808', display: 'flex' }} />

        {/* Saffron corner glow top-right */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,153,51,0.18) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Green glow bottom-left */}
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-80px',
          width: '360px', height: '360px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(19,136,8,0.15) 0%, transparent 70%)',
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
              width: '52px', height: '52px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #FF9933, #e8740a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', fontWeight: '800', color: '#FFFFFF',
            }}>✓</div>
            <span style={{ fontSize: '22px', fontWeight: '700', color: '#FF9933', letterSpacing: '0.08em' }}>
              INDIA VERIFIED
            </span>
          </div>

          <div style={{ fontSize: '72px', fontWeight: '800', color: '#FFFFFF', lineHeight: '1.05', letterSpacing: '-0.02em', display: 'flex' }}>
            Trust, but verify.
          </div>
          <div style={{ fontSize: '30px', fontWeight: '400', color: '#94A3B8', marginTop: '24px', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span>AI-powered news aggregator that cross-references</span>
            <span>and scores credibility of Indian news in real-time.</span>
          </div>

          {/* Pills */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
            {['35+ Sources', 'Cross-verified', 'Credibility Score'].map((t) => (
              <div key={t} style={{
                padding: '8px 20px', borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.06)',
                color: '#CBD5E1', fontSize: '18px', fontWeight: '500',
                display: 'flex',
              }}>{t}</div>
            ))}
          </div>
        </div>

        {/* RIGHT — Floating card illustration */}
        <div style={{
          position: 'absolute', right: '80px', top: '90px',
          width: '340px', height: '420px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '28px',
          display: 'flex', flexDirection: 'column',
          padding: '36px',
          gap: '16px',
        }}>
          {/* Category pill */}
          <div style={{ display: 'flex' }}>
            <div style={{
              background: 'rgba(255,153,51,0.15)', border: '1px solid rgba(255,153,51,0.4)',
              borderRadius: '999px', padding: '6px 16px',
              color: '#FF9933', fontSize: '14px', fontWeight: '600', display: 'flex',
            }}>POLITICS</div>
          </div>

          {/* Lines simulating headline */}
          <div style={{ width: '100%', height: '18px', borderRadius: '9px', background: '#FFFFFF', display: 'flex' }} />
          <div style={{ width: '80%', height: '18px', borderRadius: '9px', background: '#FFFFFF', display: 'flex' }} />

          {/* Summary lines */}
          <div style={{ width: '100%', height: '12px', borderRadius: '6px', background: 'rgba(255,255,255,0.35)', display: 'flex' }} />
          <div style={{ width: '90%', height: '12px', borderRadius: '6px', background: 'rgba(255,255,255,0.35)', display: 'flex' }} />
          <div style={{ width: '75%', height: '12px', borderRadius: '6px', background: 'rgba(255,255,255,0.35)', display: 'flex' }} />

          {/* Verification strip */}
          <div style={{
            marginTop: 'auto',
            background: 'rgba(19,136,8,0.15)',
            border: '1px solid rgba(19,136,8,0.4)',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: '#138808',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', fontSize: '18px', fontWeight: '800',
            }}>✓</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: '700', display: 'flex' }}>Verified — 92/100</div>
              <div style={{ color: '#94A3B8', fontSize: '13px', display: 'flex' }}>3 independent sources</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

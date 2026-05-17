// last edited 2026-05-17 by roshhellwett

import { ImageResponse } from 'next/og';
import { fetchPostById } from '@/lib/supabase/server';
import { getScoreHex, getScoreLabel } from '@/lib/utils/scoreColor';
import { getCategoryTheme } from '@/lib/theme/categoryTheme';
import { getHostname } from '@/lib/utils/getHostname';

export const alt = 'India Verified — AI-verified news story';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function PostOgImage(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const post = await fetchPostById(id).catch(() => null);

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fbfbfd',
            fontSize: 64,
            fontWeight: 700,
            color: '#0d0d0d',
            letterSpacing: '0',
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          }}
        >
          India Verified
        </div>
      ),
      { ...size },
    );
  }

  const theme = getCategoryTheme(post.category);
  const score = Math.min(100, Math.max(0, Number.isFinite(post.credibility_score) ? Math.round(post.credibility_score) : 0));
  const scoreColor = getScoreHex(score);
  const scoreLabel = getScoreLabel(score);
  const sources = (post.sources ?? []).slice(0, 3);
  const extra = Math.max(0, (post.source_count ?? 0) - sources.length);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          position: 'relative',
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          padding: '56px 64px',
        }}
      >

        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle, rgba(15,23,42,0.04) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            backgroundColor: theme.hex,
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '10px 20px',
              borderRadius: 999,
              backgroundColor: `${theme.hex}14`,
              border: `1px solid ${theme.hex}33`,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: theme.hex,
              }}
            />
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: theme.hex,
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              {theme.label}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(145deg, #111111, #0a0a0a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
              }}
            >
              <span
                style={{
                  color: 'rgba(255,255,255,0.95)',
                  fontSize: 18,
                  fontWeight: 300,
                  letterSpacing: '2px',
                  marginLeft: 2,
                }}
              >
                IV
              </span>
            </div>
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: '#0d0d0d',
                letterSpacing: '0',
              }}
            >
              India Verified
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flex: 1,
            zIndex: 10,
            paddingRight: 300,
          }}
        >
          <h1
            style={{
              fontSize: post.headline.length > 90 ? 56 : post.headline.length > 60 ? 64 : 72,
              fontWeight: 800,
              color: '#0d0d0d',
              lineHeight: 1.1,
              letterSpacing: '0',
              margin: 0,

              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {post.headline}
          </h1>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 156,
            right: 64,
            width: 260,
            display: 'flex',
            flexDirection: 'column',
            padding: '22px 24px',
            borderRadius: 28,
            backgroundColor: 'rgba(255,255,255,0.86)',
            border: '1px solid rgba(15,23,42,0.10)',
            boxShadow: '0 20px 54px -34px rgba(15,23,42,0.32)',
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 18,
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
              }}
            >
              Credibility
            </span>
            <span
              style={{
                fontSize: 40,
                fontWeight: 900,
                color: scoreColor,
                lineHeight: 1,
                letterSpacing: '0',
              }}
            >
              {score}
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: 12,
              borderRadius: 999,
              backgroundColor: '#e2e8f0',
              overflow: 'hidden',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: `${score}%`,
                height: '100%',
                borderRadius: 999,
                backgroundColor: scoreColor,
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 15,
              fontWeight: 700,
              color: '#94a3b8',
            }}
          >
            <span>{scoreLabel}</span>
            <span>/100</span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
            paddingTop: 28,
            borderTop: '1px solid #e2e8f0',
          }}
        >

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 999,
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#047857',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                ✓ {post.source_count} Sources Verified
              </span>
            </div>

            {sources.map((s, i) => {
              const host = getHostname(s.url);
              const label = (s.title || s.name || host || 'Source').slice(0, 24);
              if (!label) return null;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 999,
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#475569',
                    }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}

            {extra > 0 && (
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#94a3b8',
                }}
              >
                +{extra} more
              </span>
            )}
          </div>

          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#94a3b8',
              letterSpacing: '0.5px',
            }}
          >
            verifiedindian.vercel.app
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}

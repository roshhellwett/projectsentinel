/**
 * Per-post dynamic OpenGraph image.
 *
 * Renders a beautiful 1200×630 branded preview for every news post URL.
 * Next.js automatically wires this file to the `/news/[id]` route — any link
 * shared on WhatsApp, X, Telegram, Discord, Slack, Facebook, LinkedIn or
 * Instagram DMs will unfurl with this image as the preview, with zero extra
 * UI changes on the site itself.
 *
 * Design intent: read the headline + score + sources in <2 seconds without
 * opening the link. Conversion happens before the user even taps.
 *
 * Runs on the Vercel edge runtime via `next/og`, cached at the edge per URL.
 */

import { ImageResponse } from 'next/og';
import { fetchPostById } from '@/lib/supabase/server';
import { getScoreHex } from '@/lib/utils/scoreColor';
import { getCategoryTheme } from '@/lib/theme/categoryTheme';
import { getHostname } from '@/lib/utils/getHostname';

export const alt = 'India Verified — AI-verified news story';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// ─────────────────────────────────────────────────────────────────────────────
// Visual system — mirrors the canonical theme tokens (categoryTheme.ts,
// scoreColor.ts, getHostname.ts) so social unfurls match the live UI.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default async function PostOgImage(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const post = await fetchPostById(id).catch(() => null);

  // Fallback: post not found / fetch failed → render the generic brand card
  // so the share never breaks with a blank image.
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
            letterSpacing: '-1.5px',
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
  const gauge = getScoreHex(post.credibility_score);
  const sources = (post.sources ?? []).slice(0, 3);
  const extra = Math.max(0, (post.source_count ?? 0) - sources.length);

  // SVG circular-arc geometry for the credibility gauge.
  const gaugeSize = 140;
  const gaugeStroke = 12;
  const gaugeRadius = (gaugeSize - gaugeStroke) / 2;
  const gaugeCirc = 2 * Math.PI * gaugeRadius;
  const gaugeOffset = gaugeCirc * (1 - Math.max(0, Math.min(100, post.credibility_score)) / 100);

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
        {/* ── Subtle dot grid, used for texture without distraction ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle, rgba(15,23,42,0.04) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* ── Category-tinted accent bar across the top ── */}
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

        {/* ── Top row: category pill + brand wordmark ── */}
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
                letterSpacing: '-0.5px',
              }}
            >
              India Verified
            </span>
          </div>
        </div>

        {/* ── Headline: the visual anchor of the whole image ── */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            zIndex: 10,
            paddingRight: 200, // reserve space for gauge on the right
          }}
        >
          <h1
            style={{
              fontSize: post.headline.length > 90 ? 56 : post.headline.length > 60 ? 64 : 72,
              fontWeight: 800,
              color: '#0d0d0d',
              lineHeight: 1.1,
              letterSpacing: '-2px',
              margin: 0,
              // Hard-clamp visually to 4 lines worth at the chosen size.
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {post.headline}
          </h1>
        </div>

        {/* ── Credibility gauge: top-right hero element ── */}
        <div
          style={{
            position: 'absolute',
            top: 130,
            right: 64,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: gaugeSize,
              height: gaugeSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width={gaugeSize}
              height={gaugeSize}
              style={{ transform: 'rotate(-90deg)' }}
            >
              <circle
                cx={gaugeSize / 2}
                cy={gaugeSize / 2}
                r={gaugeRadius}
                stroke="#e2e8f0"
                strokeWidth={gaugeStroke}
                fill="none"
              />
              <circle
                cx={gaugeSize / 2}
                cy={gaugeSize / 2}
                r={gaugeRadius}
                stroke={gauge}
                strokeWidth={gaugeStroke}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={gaugeCirc}
                strokeDashoffset={gaugeOffset}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 42,
                  fontWeight: 800,
                  color: gauge,
                  lineHeight: 1,
                  letterSpacing: '-1px',
                }}
              >
                {post.credibility_score}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#94a3b8',
                  marginTop: 4,
                  letterSpacing: '1px',
                }}
              >
                /100
              </span>
            </div>
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginTop: 8,
            }}
          >
            Credibility
          </span>
        </div>

        {/* ── Bottom bar: sources + URL footer ── */}
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
          {/* Sources */}
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

          {/* URL footer */}
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

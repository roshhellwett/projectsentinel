"use client";

import { useEffect } from "react";

function deriveCode(error: Error & { digest?: string }): string {
  if (error?.digest) return String(error.digest).slice(0, 8).toUpperCase();
  const seed = `${error?.name ?? "Error"}:${error?.message ?? ""}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(7, "0").slice(0, 7).toUpperCase();
}

/**
 * Replaces the entire document when the root layout itself fails, so it must
 * stay dependency-free: inline styles only, no design-token classes.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global] fatal error:", error);
  }, [error]);

  const code = deriveCode(error);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#ffffff",
          color: "#1a1a1a",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          role="alert"
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem 1.25rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "9999px",
              border: "1px solid rgba(26,26,26,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.5rem",
            }}
          >
            <svg
              width="26"
              height="26"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#1a1a1a"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>

          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              margin: "0 0 0.75rem",
            }}
          >
            Critical error
          </p>

          <h1
            style={{
              fontSize: "clamp(1.875rem, 1.6rem + 1.2vw, 2.75rem)",
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: "0 0 1rem",
              maxWidth: "22ch",
            }}
          >
            Sorry to disturb your reading
          </h1>

          <p
            style={{
              color: "#5c5c5c",
              maxWidth: "46ch",
              lineHeight: 1.65,
              margin: "0 0 0.75rem",
            }}
          >
            The page could not be rendered at all. Refresh in a moment — the
            newsroom is still publishing.
          </p>

          <p
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "#706c64",
              margin: "0 0 2rem",
            }}
          >
            ERR &middot; {code}
          </p>

          <button
            onClick={reset}
            style={{
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "0.75rem 1.25rem",
              borderRadius: 3,
              border: "1px solid #1a1a1a",
              background: "#1a1a1a",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

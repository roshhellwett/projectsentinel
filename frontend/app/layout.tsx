import type { Metadata, Viewport } from "next";
import { Source_Serif_4, Caveat, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { headers } from "next/headers";

import "./globals.css";
import dynamic from "next/dynamic";
import { Z_INDEX } from "@/lib/theme/zIndex";
import {
  websiteJsonLd,
  organizationJsonLd,
  jsonLdToString,
} from "@/lib/utils/structuredData";

const ClientShell = dynamic(() => import("@/components/layout/ClientShell"));

const sourceSerif = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  adjustFontFallback: true,
  preload: true,
});

const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
  adjustFontFallback: true,
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  adjustFontFallback: true,
  preload: true,
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://zenithopensourceprojects.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "India Verified — AI-Cross-Referenced Indian News",
    template: "%s — India Verified",
  },
  description:
    "An open-source Indian news reader. Every story is cross-referenced across multiple sources. No ads. No bias. Made by Roshhellwett.",
  keywords: [
    "Roshhellwett",
    "India Verified",
    "Indian news",
    "AI verified news",
    "fact-check",
    "news aggregator",
    "India news",
    "trusted news",
  ],
  authors: [{ name: "Roshhellwett", url: "https://github.com/roshhellwett" }],
  creator: "Roshhellwett",
  publisher: "India Verified",
  category: "News & Media",
  verification: {
    google: "google1bd198fa5b4dc9f1.html",
    other: {
      "google-site-verification": [
        "google1bd198fa5b4dc9f1.html",
        "1bd198fa5b4dc9f1",
      ],
    },
  },
  openGraph: {
    title: "India Verified — AI-Cross-Referenced Indian News",
    description:
      "An open-source Indian news reader. Every story cross-referenced across multiple sources. No ads. No bias.",
    type: "website",
    locale: "en_IN",
    siteName: "India Verified",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "India Verified — AI-Cross-Referenced Indian News",
    description:
      "An open-source Indian news reader. Every story cross-referenced across multiple sources.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
    types: { "application/rss+xml": `${siteUrl}/rss.xml` },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#f2efe9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") || undefined;
  const locale = headersList.get("x-locale") || "en";

  const supabaseOrigin = (() => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
      }
    } catch {}
    return null;
  })();

  return (
      <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {supabaseOrigin && (
          <>
            <link rel="preconnect" href={supabaseOrigin} crossOrigin="" />
            <link rel="dns-prefetch" href={supabaseOrigin} />
          </>
        )}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin=""
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="modulepreload"
          href="/manifest.webmanifest"
          as="fetch"
          crossOrigin=""
        />

        <script
          type="application/ld+json"
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: jsonLdToString(websiteJsonLd()) }}
        />
        <script
          type="application/ld+json"
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: jsonLdToString(organizationJsonLd()),
          }}
        />
        {gtmId && (
          <Script id="gtm-script" strategy="afterInteractive" nonce={nonce}>
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
        )}
        <Script id="sw-register" strategy="afterInteractive" nonce={nonce}>
          {`(function(){if(!('serviceWorker'in navigator))return;var h=location.hostname;var blocked=location.protocol!=='https:'||window.top!==window.self||new URLSearchParams(location.search).has('sw=off'.split('=')[0])&&new URLSearchParams(location.search).get('sw')==='off'||h.indexOf('id-preview--')===0||h.indexOf('preview--')===0||h==='lovableproject.com'||/\\.lovableproject(-dev)?\\.com$/.test(h)||h==='lovableproject-dev.com'||h==='beta.lovable.dev'||/\\.beta\\.lovable\\.dev$/.test(h);if(blocked){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){if(r.active&&r.active.scriptURL.indexOf('/sw.js')!==-1)r.unregister();});}).catch(function(){});return;}window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});})();`}
        </Script>
      </head>
      <body
        className={`${sourceSerif.variable} ${caveat.variable} ${jetbrainsMono.variable} font-body bg-paper text-ink min-h-screen flex flex-col antialiased w-full relative`}
      >
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}

        <a
          href="#main"
          className={`sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 ${Z_INDEX.skipLink} focus:px-4 focus:py-2 focus:bg-ink focus:text-paper focus:rounded focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper`}
        >
          Skip to content
        </a>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}

import { NextRequest, NextResponse } from "next/server";

const LOCALE_COOKIE = "iv-locale";
const SUPPORTED_LOCALES = ["en", "hi"];
const FALLBACK_LOCALE = "en";

function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie && SUPPORTED_LOCALES.includes(cookie)) return cookie;
  const acceptLang = request.headers.get("accept-language");
  if (acceptLang) {
    const preferred = acceptLang
      .split(",")
      .map((s) => s.trim().split(";")[0]?.split("-")[0])
      .filter(Boolean);
    for (const locale of preferred) {
      if (SUPPORTED_LOCALES.includes(locale)) return locale;
    }
  }
  return FALLBACK_LOCALE;
}

const SELF = "'self'";
const SCRIPT_SRC = [
  SELF,
  "https://www.googletagmanager.com",
  "https://*.google-analytics.com",
  "'unsafe-eval'",
];
const STYLE_SRC = [SELF, "'unsafe-inline'", "https://fonts.googleapis.com"];
const FONT_SRC = [SELF, "https://fonts.gstatic.com", "https://*.perplexity.ai"];
const IMG_SRC = [
  SELF,
  "data:",
  "blob:",
  "https://www.google.com",
  "https://*.googleusercontent.com",
  "https://www.googletagmanager.com",
  "https://i.ytimg.com",
  "https://*.ytimg.com",
  "https://*.youtube.com",
];
const CONNECT_SRC = [
  SELF,
  "https://*.supabase.co",
  "wss://*.supabase.co",
  "https://www.googletagmanager.com",
  "https://*.google-analytics.com",
];

function supabaseHostFromUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.hostname || null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const nonce = crypto.randomUUID();
  const locale = detectLocale(request);
  const supabaseHost = supabaseHostFromUrl(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );

  const connectSrc = supabaseHost
    ? [...CONNECT_SRC, `https://${supabaseHost}`]
    : CONNECT_SRC;
  const imgSrc = supabaseHost
    ? [...IMG_SRC, `https://${supabaseHost}`]
    : IMG_SRC;

  const nonceDirective = `'nonce-${nonce}'`;

  const csp = [
    `default-src ${SELF}`,
    `script-src ${[...SCRIPT_SRC, nonceDirective].join(" ")}`,
    `style-src ${STYLE_SRC.join(" ")}`,
    `font-src ${FONT_SRC.join(" ")}`,
    `img-src ${imgSrc.join(" ")}`,
    `connect-src ${connectSrc.join(" ")}`,
    `frame-src ${SELF} https://www.googletagmanager.com https://www.youtube.com https://www.youtube-nocookie.com`,
    `manifest-src ${SELF}`,
    `base-uri ${SELF}`,
    `form-action ${SELF}`,
    "frame-ancestors 'none'",
    `worker-src ${SELF} blob:`,
  ].join("; ");

  const response = NextResponse.next();
  response.headers.set("x-nonce", nonce);
  response.headers.set("x-locale", locale);
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.*|sw\\.js).*)"],
};

import { cookies, headers } from "next/headers";
import type { Locale } from "./i18n-shared";

const COOKIE_KEY = "iv-locale";
const SUPPORTED: Locale[] = ["en", "hi"];
const FALLBACK: Locale = "en";

function parseAcceptLanguage(header: string | null): Locale {
  if (!header) return FALLBACK;
  const preferred = header
    .split(",")
    .map((s) => {
      const [tag] = s.trim().split(";");
      return tag?.split("-")[0];
    })
    .filter(Boolean);
  for (const locale of preferred) {
    if ((SUPPORTED as readonly string[]).includes(locale)) {
      return locale as Locale;
    }
  }
  return FALLBACK;
}

export async function getServerLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const cookieVal = cookieStore.get(COOKIE_KEY)?.value;
    if (cookieVal && (SUPPORTED as readonly string[]).includes(cookieVal)) {
      return cookieVal as Locale;
    }
    const headersList = await headers();
    return parseAcceptLanguage(headersList.get("accept-language"));
  } catch {
    return FALLBACK;
  }
}

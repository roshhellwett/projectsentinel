import { cookies } from "next/headers";
import type { Locale } from "./i18n-shared";

const COOKIE_KEY = "iv-locale";
const SUPPORTED: Locale[] = ["en", "hi"];
const FALLBACK: Locale = "en";

export async function getServerLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const val = cookieStore.get(COOKIE_KEY)?.value;
    if (val && (SUPPORTED as readonly string[]).includes(val)) {
      return val as Locale;
    }
  } catch {
    // cookie access may fail in edge cases
  }
  return FALLBACK;
}

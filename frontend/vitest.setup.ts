import "@testing-library/jest-dom/vitest";
import React from "react";

const { mock, fn } = vi;

// Mock i18n context for all components
mock("@/lib/i18n/context", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      const messages: Record<string, string> = {
        "credibility.score": "Credibility Score",
        "verification.short": "Verified",
        "verification.full": "Verified",
        "credibility.verified": "Verified",
        "category.politics": "Politics",
        "category.tech": "Tech",
        "search.placeholder": "Search articles...",
        "nav.home": "Home",
        "nav.categories": "Categories",
        "reading.quick": "Quick read",
        "reading.min": "{n} min read",
        "card.viewed": "Viewed",
      };
      let msg = messages[key] || key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          msg = msg.replace(`{${k}}`, String(v));
        });
      }
      return msg;
    },
    locale: "en",
    setLocale: () => {},
  }),
}));

// Mock next/navigation
mock("next/navigation", () => ({
  useRouter: () => ({ push: fn(), replace: fn(), back: fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  notFound: fn(),
}));

// Mock next/image
mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill, priority, ...rest } = props;
    return React.createElement(
      "img",
      rest as React.ImgHTMLAttributes<HTMLImageElement>,
    );
  },
}));

// Mock next/link
mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => React.createElement("a", { href, ...props }, children),
}));

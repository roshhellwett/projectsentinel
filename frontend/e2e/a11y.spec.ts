import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { navigateTo, dismissCookieDialog } from "./helpers";

const PAGE_ROUTES = [
  { name: "homepage", path: "/" },
  { name: "category tech", path: "/category/tech/" },
  { name: "category politics", path: "/category/politics/" },
  { name: "category science", path: "/category/science/" },
  { name: "search", path: "/search" },
  { name: "how it works", path: "/how-it-works/" },
  { name: "privacy", path: "/privacy/" },
  { name: "terms", path: "/terms/" },
  { name: "corrections", path: "/corrections/" },
  { name: "contact", path: "/contact/" },
  { name: "saved", path: "/saved/" },
];

test.describe("accessibility", () => {
  for (const { name, path } of PAGE_ROUTES) {
    test(`${name} should have no critical or serious violations`, async ({
      page,
    }) => {
      await navigateTo(page, path);
      await dismissCookieDialog(page);
      await page.waitForLoadState("networkidle");
      // allow a short settle time for client-side rendering
      await page.waitForTimeout(300);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const violations = results.violations.filter((v) =>
        v.impact === "critical" || v.impact === "serious"
      );

      if (violations.length > 0) {
        console.error(
          `Axe found ${violations.length} critical/serious violations on ${path}:`,
          JSON.stringify(violations, null, 2)
        );
      }

      // Fail the test if any critical or serious violations exist
      expect(violations).toHaveLength(0);
    });
  }
});

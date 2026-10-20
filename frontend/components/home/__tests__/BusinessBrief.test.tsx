import { render, screen } from "@testing-library/react";
import { BusinessBrief } from "../BusinessBrief";
import type { Post } from "@/types";

vi.mock("@/lib/i18n/i18n-shared", () => ({
  useI18n: () => ({
    t: (key: string) => ({
      "business.title": "The signal business readers need.",
      "business.description": "The context behind the market move.",
      "business.open_desk": "Open business desk",
      "business.verified_for_decisions": "verified for decisions",
      "business.next_signal": "NEXT SIGNAL",
      "business.empty": "The business desk is warming up.",
      "business.browse_archive": "Browse the business archive",
      "card.source": "source",
      "card.sources": "sources",
    }[key] ?? key),
  }),
}));

const post: Post = {
  id: "business-1",
  headline: "A business story with useful context",
  summary: "A concise summary for operators and decision makers.",
  category: "business",
  credibility_score: 91,
  credibility_reason: "Reported by independent sources.",
  source_count: 3,
  sources: [{ name: "Example Desk", url: "https://example.com/story" }],
  fact_check_flags: [],
  status: "published",
  correction_note: null,
  published_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("BusinessBrief", () => {
  it("shows business stories in the dedicated desk", () => {
    render(<BusinessBrief posts={[post]} />);

    expect(screen.getByRole("region", { name: "The signal business readers need." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /A business story with useful context/ })).toHaveAttribute("href", "/news/business-1");
    expect(screen.getByText("91% verified for decisions")).toBeInTheDocument();
  });

  it("keeps the desk useful when there are no business stories", () => {
    render(<BusinessBrief posts={[]} />);

    expect(screen.getByText("The business desk is warming up.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Browse the business archive/ })).toHaveAttribute("href", "/category/business");
  });
});

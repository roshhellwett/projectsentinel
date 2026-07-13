import { render, screen } from "@testing-library/react";
import { ReadingTime } from "../ReadingTime";

describe("ReadingTime", () => {
  it("displays quick read for very short text", () => {
    render(<ReadingTime text="Hello world" />);
    expect(screen.getByText("Quick read")).toBeInTheDocument();
  });

  it("displays 1 min for ~200 words", () => {
    const words = Array.from({ length: 400 }, (_, i) => `word${i}`).join(" ");
    render(<ReadingTime text={words} />);
    expect(screen.getByText("2 min read")).toBeInTheDocument();
  });

  it("displays 2 min for ~500 words", () => {
    const words = Array.from({ length: 600 }, (_, i) => `word${i}`).join(" ");
    render(<ReadingTime text={words} />);
    expect(screen.getByText("3 min read")).toBeInTheDocument();
  });

  it("handles empty text", () => {
    render(<ReadingTime text="" />);
    expect(screen.getByText("Quick read")).toBeInTheDocument();
  });

  it("handles nullish text", () => {
    render(<ReadingTime text={undefined as unknown as string} />);
    expect(screen.getByText("Quick read")).toBeInTheDocument();
  });
});

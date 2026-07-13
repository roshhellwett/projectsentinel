import { render, screen } from "@testing-library/react";
import { VerificationStamp } from "../VerificationStamp";

describe("VerificationStamp", () => {
  it("renders with full layout by default", () => {
    render(<VerificationStamp score={92} />);
    expect(screen.getByText("92%")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("renders compact layout", () => {
    render(<VerificationStamp score={85} compact />);
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("renders xsmall layout", () => {
    render(<VerificationStamp score={100} xsmall />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("has accessible label with score", () => {
    render(<VerificationStamp score={75} />);
    expect(
      screen.getByLabelText("Credibility Score 75 percent"),
    ).toBeInTheDocument();
  });

  it("has accessible label in compact mode", () => {
    render(<VerificationStamp score={75} compact />);
    expect(
      screen.getByLabelText("Credibility Score 75%"),
    ).toBeInTheDocument();
  });

  it("applies additional className", () => {
    const { container } = render(
      <VerificationStamp score={50} className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

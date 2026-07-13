import { render, screen } from "@testing-library/react";
import { Breadcrumb } from "../Breadcrumb";

describe("Breadcrumb", () => {
  it("renders a single item as plain text with home link", () => {
    render(<Breadcrumb items={[{ label: "Page" }]} />);
    expect(screen.getByText("Page")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/");
  });

  it("renders items with links", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Category", href: "/category/politics" },
          { label: "Current" },
        ]}
      />,
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute("href", "/");
    expect(links[1]).toHaveAttribute("href", "/");
    expect(links[2]).toHaveAttribute("href", "/category/politics");
    expect(screen.getByText("Current")).toBeInTheDocument();
  });

  it("renders separators between items", () => {
    const { container } = render(
      <Breadcrumb
        items={[
          { label: "One", href: "/1" },
          { label: "Two", href: "/2" },
          { label: "Three" },
        ]}
      />,
    );
    const separators = container.querySelectorAll('[aria-hidden="true"]');
    expect(separators).toHaveLength(3);
  });

  it("applies className", () => {
    const { container } = render(
      <Breadcrumb items={[{ label: "Test" }]} className="mb-4" />,
    );
    expect(container.firstChild).toHaveClass("mb-4");
  });
});

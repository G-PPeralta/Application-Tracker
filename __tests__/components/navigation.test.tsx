import { render, screen } from "@testing-library/react";
import { Navigation } from "@/components/navigation";

jest.mock("next/navigation", () => ({
  usePathname: () => "/applications",
}));

jest.mock("next/link", () => {
  return ({ children, href, className }: any) => (
    <a href={href} className={className}>{children}</a>
  );
});

describe("Navigation", () => {
  it("renders app title", () => {
    render(<Navigation />);
    expect(screen.getByText("Application Tracker")).toBeInTheDocument();
  });

  it("renders Board and New Application links", () => {
    render(<Navigation />);
    expect(screen.getByText("Board")).toBeInTheDocument();
    expect(screen.getByText("New Application")).toBeInTheDocument();
  });

  it("links to correct paths", () => {
    render(<Navigation />);
    expect(screen.getByText("Board").closest("a")).toHaveAttribute("href", "/applications");
    expect(screen.getByText("New Application").closest("a")).toHaveAttribute("href", "/new");
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Filters } from "@/components/filters";

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, onClick, style }: any) => (
      <div className={className} onClick={onClick} style={style}>{children}</div>
    ),
  },
}));

describe("Filters", () => {
  const defaultProps = {
    search: "",
    onSearchChange: jest.fn(),
    techFilter: "",
    onTechFilterChange: jest.fn(),
    sourceFilter: "",
    onSourceFilterChange: jest.fn(),
    sortBy: "createdAt" as const,
    onSortByChange: jest.fn(),
  };

  it("renders search input", () => {
    render(<Filters {...defaultProps} />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it("calls onSearchChange when typing", async () => {
    render(<Filters {...defaultProps} />);
    const input = screen.getByPlaceholderText(/search/i);
    await userEvent.type(input, "Acme");
    expect(defaultProps.onSearchChange).toHaveBeenCalled();
  });

  it("renders source filter dropdown", () => {
    render(<Filters {...defaultProps} />);
    expect(screen.getByDisplayValue(/all sources/i)).toBeInTheDocument();
  });

  it("renders sort dropdown", () => {
    render(<Filters {...defaultProps} />);
    expect(screen.getByDisplayValue(/recently created/i)).toBeInTheDocument();
  });
});

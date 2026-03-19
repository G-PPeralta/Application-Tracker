import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navigation } from "@/components/navigation";

const mockSignOut = jest.fn();

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signOut: (...args: any[]) => mockSignOut(...args),
}));

jest.mock("next/link", () => {
  return ({ children, href, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  );
});

jest.mock("next/image", () => {
  return ({ src, alt, width, height, className }: any) => (
    <img src={src} alt={alt} width={width} height={height} className={className} />
  );
});

import { useSession } from "next-auth/react";
const mockUseSession = useSession as jest.Mock;

describe("Navigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders app title", () => {
    mockUseSession.mockReturnValue({ data: null });
    render(<Navigation />);
    expect(screen.getByText("Application Tracker")).toBeInTheDocument();
  });

  it("shows user info when authenticated", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: "Jane Doe", image: "https://example.com/avatar.jpg" },
      },
    });
    render(<Navigation />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByAltText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Sign out")).toBeInTheDocument();
  });

  it("does not show user info when unauthenticated", () => {
    mockUseSession.mockReturnValue({ data: null });
    render(<Navigation />);
    expect(screen.queryByText("Sign out")).not.toBeInTheDocument();
  });

  it("calls signOut on button click", async () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: "Jane", image: null } },
    });
    render(<Navigation />);
    await userEvent.click(screen.getByText("Sign out"));
    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/" });
  });
});

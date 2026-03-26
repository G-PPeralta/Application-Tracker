import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApplicationModal } from "@/components/application-modal";
import type { Application } from "@/types/application";

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, onClick, style }: any) => (
      <div className={className} onClick={onClick} style={style}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockApp: Application = {
  id: "1",
  companyName: "Acme Corp",
  position: "Frontend Developer",
  jobDescription: "Build amazing UIs with React",
  techStack: ["React", "TypeScript"],
  appliedAt: "2026-03-18",
  jobUrl: "https://acme.com/jobs/1",
  source: "LinkedIn",
  status: "Applied",
  notes: "Referred by a friend",
  createdAt: "2026-03-18T12:00:00Z",
};

describe("ApplicationModal", () => {
  it("renders nothing when application is null", () => {
    const { container } = render(
      <ApplicationModal application={null} onClose={jest.fn()} onDelete={jest.fn()} onUpdate={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders application details when open", () => {
    render(
      <ApplicationModal application={mockApp} onClose={jest.fn()} onDelete={jest.fn()} onUpdate={jest.fn()} />
    );
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.getByText("Build amazing UIs with React")).toBeInTheDocument();
    expect(screen.getByText("Referred by a friend")).toBeInTheDocument();
  });

  it("renders job URL as a link", () => {
    render(
      <ApplicationModal application={mockApp} onClose={jest.fn()} onDelete={jest.fn()} onUpdate={jest.fn()} />
    );
    const link = screen.getByRole("link", { name: /view job posting/i });
    expect(link).toHaveAttribute("href", "https://acme.com/jobs/1");
  });

  it("calls onClose when close button clicked", async () => {
    const onClose = jest.fn();
    render(
      <ApplicationModal application={mockApp} onClose={onClose} onDelete={jest.fn()} onUpdate={jest.fn()} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when X button clicked", async () => {
    const onClose = jest.fn();
    render(
      <ApplicationModal application={mockApp} onClose={onClose} onDelete={jest.fn()} onUpdate={jest.fn()} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Close modal" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onDelete when delete button clicked", async () => {
    const onDelete = jest.fn();
    render(
      <ApplicationModal application={mockApp} onClose={jest.fn()} onDelete={onDelete} onUpdate={jest.fn()} />
    );
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith("1");
  });

  it("renders edit button in view mode", () => {
    render(
      <ApplicationModal application={mockApp} onClose={jest.fn()} onDelete={jest.fn()} onUpdate={jest.fn()} />
    );
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  it("calls onClose when X button clicked in edit mode", async () => {
    const onClose = jest.fn();
    render(
      <ApplicationModal
        application={mockApp}
        onClose={onClose}
        onDelete={jest.fn()}
        onUpdate={jest.fn()}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    const closeButton = screen.getByRole("button", { name: /close modal/i });
    await userEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it("does not close when clicking the overlay", async () => {
    const onClose = jest.fn();
    const { container } = render(
      <ApplicationModal
        application={mockApp}
        onClose={onClose}
        onDelete={jest.fn()}
        onUpdate={jest.fn()}
      />
    );
    const overlay = container.querySelector(".fixed.inset-0");
    await userEvent.click(overlay!);
    expect(onClose).not.toHaveBeenCalled();
  });
});

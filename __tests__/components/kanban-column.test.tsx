import { render, screen } from "@testing-library/react";
import { KanbanColumn } from "@/components/kanban-column";
import type { Application } from "@/types/application";

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, onClick, style }: any) => (
      <div className={className} onClick={onClick} style={style}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  LayoutGroup: ({ children }: any) => <>{children}</>,
}));

jest.mock("@/components/application-card", () => ({
  ApplicationCard: ({ application, onClick }: any) => (
    <div data-testid="application-card" onClick={() => onClick(application)}>
      <span>{application.companyName}</span>
      <span>{application.position}</span>
    </div>
  ),
}));

const mockApps: Application[] = [
  {
    id: "1",
    companyName: "Acme",
    position: "Dev",
    jobDescription: "",
    techStack: ["React"],
    appliedAt: "2026-03-18",
    jobUrl: "https://acme.com",
    source: "LinkedIn",
    status: "Applied",
    createdAt: "2026-03-18T12:00:00Z",
  },
  {
    id: "2",
    companyName: "Beta Inc",
    position: "Engineer",
    jobDescription: "",
    techStack: ["Node"],
    appliedAt: "2026-03-17",
    jobUrl: "https://beta.com",
    source: "Indeed",
    status: "Applied",
    createdAt: "2026-03-17T12:00:00Z",
  },
];

describe("KanbanColumn", () => {
  it("renders column title and count", () => {
    render(<KanbanColumn status="Applied" applications={mockApps} onCardClick={jest.fn()} />);
    expect(screen.getByText("Applied")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders all application cards", () => {
    render(<KanbanColumn status="Applied" applications={mockApps} onCardClick={jest.fn()} />);
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Beta Inc")).toBeInTheDocument();
  });

  it("renders empty state when no applications", () => {
    render(<KanbanColumn status="Rejected" applications={[]} onCardClick={jest.fn()} />);
    expect(screen.getByText("Rejected")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});

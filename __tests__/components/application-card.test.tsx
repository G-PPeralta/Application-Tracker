import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApplicationCard } from "@/components/application-card";
import type { Application } from "@/types/application";

// Mock framer-motion to avoid animation issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, onClick, style }: any) => (
      <div className={className} onClick={onClick} style={style}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock("@hello-pangea/dnd", () => ({
  DragDropContext: ({ children }: any) => <>{children}</>,
  Droppable: ({ children }: any) =>
    children({ droppableProps: {}, innerRef: jest.fn(), placeholder: null }, {}),
  Draggable: ({ children }: any) =>
    children({ draggableProps: {}, dragHandleProps: {}, innerRef: jest.fn() }, {}),
}));

const mockApp: Application = {
  id: "1",
  companyName: "Acme Corp",
  position: "Frontend Developer",
  jobDescription: "Build amazing UIs",
  techStack: ["React", "TypeScript"],
  appliedAt: "2026-03-18",
  jobUrl: "https://acme.com/jobs/1",
  source: "LinkedIn",
  status: "Applied",
  notes: "Referred by a friend",
  createdAt: "2026-03-18T12:00:00Z",
};

describe("ApplicationCard", () => {
  it("renders company name and position", () => {
    render(<ApplicationCard application={mockApp} onClick={jest.fn()} index={0} />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
  });

  it("renders tech stack tags", () => {
    render(<ApplicationCard application={mockApp} onClick={jest.fn()} index={0} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("renders source and date", () => {
    render(<ApplicationCard application={mockApp} onClick={jest.fn()} index={0} />);
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText(/2026-03-18/)).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = jest.fn();
    render(<ApplicationCard application={mockApp} onClick={onClick} index={0} />);
    await userEvent.click(screen.getByText("Acme Corp"));
    expect(onClick).toHaveBeenCalledWith(mockApp);
  });
});

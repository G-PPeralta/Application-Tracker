import { render, screen } from "@testing-library/react";
import { KanbanBoard } from "@/components/kanban-board";

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, onClick, style }: any) => (
      <div className={className} onClick={onClick} style={style}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  LayoutGroup: ({ children }: any) => <>{children}</>,
}));

jest.mock("@hello-pangea/dnd", () => ({
  DragDropContext: ({ children }: any) => <>{children}</>,
  Droppable: ({ children }: any) =>
    children({ droppableProps: {}, innerRef: jest.fn(), placeholder: null }, {}),
  Draggable: ({ children }: any) =>
    children({ draggableProps: {}, dragHandleProps: {}, innerRef: jest.fn() }, {}),
}));

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: jest.fn() }),
  usePathname: () => "/applications",
}));

jest.mock("@/hooks/use-applications", () => ({
  useApplications: () => ({
    loading: false,
    error: null,
    grouped: () => ({
      Applied: [],
      Interview: [],
      Rejected: [],
      Offer: [],
    }),
    remove: jest.fn(),
    updateStatus: jest.fn(),
  }),
}));

describe("KanbanBoard", () => {
  it("renders all four status columns", () => {
    render(<KanbanBoard />);
    expect(screen.getByText("Applied")).toBeInTheDocument();
    expect(screen.getByText("Interview")).toBeInTheDocument();
    expect(screen.getByText("Rejected")).toBeInTheDocument();
    expect(screen.getByText("Offer")).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(<KanbanBoard />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });
});

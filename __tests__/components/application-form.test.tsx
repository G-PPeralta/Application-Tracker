import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApplicationForm } from "@/components/application-form";

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, onClick, style }: any) => (
      <div className={className} onClick={onClick} style={style}>{children}</div>
    ),
    form: ({ children, className, onSubmit }: any) => (
      <form className={className} onSubmit={onSubmit}>{children}</form>
    ),
  },
}));

describe("ApplicationForm", () => {
  it("renders all required fields", () => {
    render(<ApplicationForm onSubmit={jest.fn()} />);
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/position/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/source/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/applied date/i)).toBeInTheDocument();
  });

  it("shows validation errors for empty required fields", async () => {
    render(<ApplicationForm onSubmit={jest.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
    });
  });

  it("calls onSubmit with valid data", async () => {
    const onSubmit = jest.fn();
    render(<ApplicationForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/company name/i), "Acme Corp");
    await userEvent.type(screen.getByLabelText(/position/i), "Frontend Dev");
    await userEvent.type(screen.getByLabelText(/job url/i), "https://acme.com/jobs/1");
    await userEvent.type(screen.getByLabelText(/applied date/i), "2026-03-18");
    await userEvent.type(screen.getByLabelText(/tech stack/i), "React, TypeScript");
    await userEvent.selectOptions(screen.getByLabelText(/source/i), "LinkedIn");

    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          companyName: "Acme Corp",
          position: "Frontend Dev",
          jobUrl: "https://acme.com/jobs/1",
          source: "LinkedIn",
        })
      );
    });
  });

  it("shows error for invalid URL", async () => {
    render(<ApplicationForm onSubmit={jest.fn()} />);
    await userEvent.type(screen.getByLabelText(/job url/i), "not-a-url");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/must be a valid url/i)).toBeInTheDocument();
    });
  });
});

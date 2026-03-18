import { groupApplications } from "@/hooks/use-applications";
import type { Application } from "@/types/application";

jest.mock("@/lib/queries", () => ({
  fetchApplications: jest.fn(),
  insertApplication: jest.fn(),
  deleteApplication: jest.fn(),
}));

const makeApp = (overrides: Partial<Application>): Application => ({
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
  ...overrides,
});

describe("groupApplications", () => {
  const apps: Application[] = [
    makeApp({ id: "1", companyName: "Acme", status: "Applied", techStack: ["React"], source: "LinkedIn" }),
    makeApp({ id: "2", companyName: "Beta", status: "Interview", techStack: ["Node"], source: "Indeed" }),
    makeApp({ id: "3", companyName: "Gamma", status: "Applied", techStack: ["React", "Node"], source: "LinkedIn" }),
  ];

  it("groups by status", () => {
    const result = groupApplications(apps, "", "", "", "createdAt");
    expect(result.Applied).toHaveLength(2);
    expect(result.Interview).toHaveLength(1);
    expect(result.Rejected).toHaveLength(0);
    expect(result.Offer).toHaveLength(0);
  });

  it("filters by company name search", () => {
    const result = groupApplications(apps, "beta", "", "", "createdAt");
    expect(result.Interview).toHaveLength(1);
    expect(result.Applied).toHaveLength(0);
  });

  it("filters by tech stack", () => {
    const result = groupApplications(apps, "", "node", "", "createdAt");
    expect(result.Interview).toHaveLength(1);
    expect(result.Applied).toHaveLength(1);
  });

  it("filters by source", () => {
    const result = groupApplications(apps, "", "", "Indeed", "createdAt");
    expect(result.Interview).toHaveLength(1);
    expect(result.Applied).toHaveLength(0);
  });

  it("combines filters", () => {
    const result = groupApplications(apps, "gamma", "react", "LinkedIn", "createdAt");
    expect(result.Applied).toHaveLength(1);
    expect(result.Applied[0].companyName).toBe("Gamma");
  });
});

import { toApplication, toSnakeCase } from "@/lib/mappers";
import type { Application } from "@/types/application";

describe("mappers", () => {
  const snakeCaseRow = {
    id: "abc-123",
    company_name: "Acme Corp",
    position: "Frontend Dev",
    job_description: "Build UIs",
    tech_stack: ["React", "TypeScript"],
    applied_at: "2026-03-18",
    interview_date: "2026-04-01",
    job_url: "https://acme.com/jobs/1",
    source: "LinkedIn",
    status: "Applied",
    notes: "Great company",
    created_at: "2026-03-18T12:00:00Z",
  };

  const camelCaseApp: Application = {
    id: "abc-123",
    companyName: "Acme Corp",
    position: "Frontend Dev",
    jobDescription: "Build UIs",
    techStack: ["React", "TypeScript"],
    appliedAt: "2026-03-18",
    interviewDate: "2026-04-01",
    jobUrl: "https://acme.com/jobs/1",
    source: "LinkedIn",
    status: "Applied",
    notes: "Great company",
    createdAt: "2026-03-18T12:00:00Z",
  };

  it("converts snake_case DB row to camelCase Application", () => {
    expect(toApplication(snakeCaseRow)).toEqual(camelCaseApp);
  });

  it("converts camelCase form data to snake_case for DB", () => {
    const { id, createdAt, ...formData } = camelCaseApp;
    const { id: _id, created_at, ...expectedSnake } = snakeCaseRow;
    expect(toSnakeCase(formData)).toEqual(expectedSnake);
  });
});

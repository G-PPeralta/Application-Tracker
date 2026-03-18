import { applicationSchema, type Application, STATUSES, SOURCES } from "@/types/application";

describe("applicationSchema", () => {
  const validApplication = {
    companyName: "Acme Corp",
    position: "Frontend Developer",
    jobDescription: "Build UIs",
    techStack: ["React", "TypeScript"],
    appliedAt: "2026-03-18",
    jobUrl: "https://acme.com/jobs/1",
    source: "LinkedIn" as const,
    status: "Applied" as const,
    notes: "Referred by a friend",
  };

  it("validates a correct application", () => {
    const result = applicationSchema.safeParse(validApplication);
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = applicationSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = applicationSchema.safeParse({
      ...validApplication,
      status: "Unknown",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid source", () => {
    const result = applicationSchema.safeParse({
      ...validApplication,
      source: "Monster",
    });
    expect(result.success).toBe(false);
  });

  it("allows empty notes", () => {
    const { notes, ...withoutNotes } = validApplication;
    const result = applicationSchema.safeParse(withoutNotes);
    expect(result.success).toBe(true);
  });

  it("rejects invalid URL", () => {
    const result = applicationSchema.safeParse({
      ...validApplication,
      jobUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("exports status and source constants", () => {
    expect(STATUSES).toEqual(["Applied", "Interview", "Rejected", "Offer"]);
    expect(SOURCES).toEqual(["LinkedIn", "Indeed", "Company Site", "Other"]);
  });
});

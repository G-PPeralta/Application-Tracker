import type { Application, ApplicationFormData } from "@/types/application";

export function toApplication(row: Record<string, unknown>): Application {
  return {
    id: row.id as string,
    companyName: row.company_name as string,
    position: row.position as string,
    jobDescription: row.job_description as string,
    techStack: row.tech_stack as string[],
    appliedAt: row.applied_at as string,
    jobUrl: row.job_url as string,
    source: row.source as Application["source"],
    status: row.status as Application["status"],
    notes: (row.notes as string) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export function toSnakeCase(data: ApplicationFormData) {
  return {
    company_name: data.companyName,
    position: data.position,
    job_description: data.jobDescription,
    tech_stack: data.techStack,
    applied_at: data.appliedAt,
    job_url: data.jobUrl,
    source: data.source,
    status: data.status,
    notes: data.notes ?? null,
  };
}

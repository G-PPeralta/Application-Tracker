import { z } from "zod";

export const STATUSES = ["Applied", "Interview", "Rejected", "Offer"] as const;
export const SOURCES = ["LinkedIn", "Indeed", "Company Site", "Other"] as const;

export type Status = (typeof STATUSES)[number];
export type Source = (typeof SOURCES)[number];

export const applicationSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  jobDescription: z.string().default(""),
  techStack: z.array(z.string()).default([]),
  appliedAt: z.string().min(1, "Applied date is required"),
  jobUrl: z.string().url("Must be a valid URL"),
  source: z.enum(SOURCES),
  status: z.enum(STATUSES).default("Applied"),
  notes: z.string().optional(),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

export type Application = ApplicationFormData & {
  id: string;
  createdAt: string;
};

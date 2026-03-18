# Job Application Tracker — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Kanban-style web app to track job applications across hiring stages (Applied, Interview, Rejected, Offer) with filtering, form creation, and smooth animations.

**Architecture:** Next.js App Router with Supabase as the backend. Pages for the Kanban board and application creation form. Shared components for cards, columns, filters, and navigation. Framer Motion for all transitions.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, React Hook Form, Zod, Supabase (PostgreSQL), Jest + React Testing Library

---

## File Structure

All paths relative to project root.

### New Files

| File | Responsibility |
|------|---------------|
| `src/types/application.ts` | Application type definition and Zod schema |
| `src/lib/supabase.ts` | Supabase client singleton |
| `src/lib/queries.ts` | Data access functions (fetch, insert, update, delete) |
| `src/lib/mappers.ts` | snake_case/camelCase data mapping between DB and app |
| `src/components/application-card.tsx` | Single application card with hover effects |
| `src/components/kanban-column.tsx` | Status column containing cards |
| `src/components/kanban-board.tsx` | Full board layout with 4 columns |
| `src/components/filters.tsx` | Search, tech stack, source, sort controls |
| `src/components/application-form.tsx` | React Hook Form + Zod validated form |
| `src/components/application-modal.tsx` | Detail/edit modal for a single application |
| `src/components/navigation.tsx` | Top nav bar with Board and New Application links |
| `src/app/layout.tsx` | Root layout with navigation and global styles |
| `src/app/page.tsx` | Redirect to /applications |
| `src/app/applications/page.tsx` | Kanban board page |
| `src/app/new/page.tsx` | New application form page |
| `src/hooks/use-applications.ts` | Custom hook for fetching + filtering applications |
| `src/hooks/use-filters.ts` | Filter state management with URL sync |
| `__tests__/types/application.test.ts` | Zod schema validation tests |
| `__tests__/lib/queries.test.ts` | Data access function tests |
| `__tests__/components/application-card.test.tsx` | Card rendering tests |
| `__tests__/components/kanban-column.test.tsx` | Column rendering tests |
| `__tests__/components/filters.test.tsx` | Filter interaction tests |
| `__tests__/components/application-form.test.tsx` | Form validation + submission tests |
| `__tests__/components/application-modal.test.tsx` | Modal open/close + content tests |
| `__tests__/lib/mappers.test.ts` | Data mapper tests |
| `__tests__/hooks/use-applications.test.ts` | Application hook filtering/sorting tests |
| `__tests__/components/navigation.test.tsx` | Navigation rendering + active state tests |
| `__tests__/components/kanban-board.test.tsx` | Board integration tests |
| `supabase/schema.sql` | Database table definition |
| `.env.local.example` | Template for Supabase env vars |

### Conventions

- Use `src/` directory (Next.js supports this with App Router)
- Components are client components (`"use client"`) unless noted
- All components use named exports
- Tailwind for all styling — no CSS modules
- Tests mirror source structure under `__tests__/`

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `postcss.config.mjs`, `jest.config.ts`, `jest.setup.ts`, `.env.local.example`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Initialize Next.js project**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```

Accept defaults. This scaffolds the project with TypeScript, Tailwind, ESLint, App Router, and src directory.

- [ ] **Step 2: Install project dependencies**

```bash
npm install @supabase/supabase-js framer-motion react-hook-form @hookform/resolvers zod
```

- [ ] **Step 3: Install dev dependencies for testing**

```bash
npm install -D jest @jest/types ts-jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest
```

- [ ] **Step 4: Create Jest config**

Create `jest.config.ts`:

```ts
import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default createJestConfig(config);
```

Create `jest.setup.ts`:

```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 5: Create environment variable template**

Create `.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Add `.env.local` to `.gitignore` (should already be there from create-next-app).

- [ ] **Step 6: Update Tailwind config with project theme**

Update `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        status: {
          applied: "#EAB308",
          interview: "#3B82F6",
          rejected: "#EF4444",
          offer: "#22C55E",
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 7: Verify setup**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 8: Run a smoke test**

```bash
npm run dev &
sleep 3
curl -s http://localhost:3000 | head -20
kill %1
```

Expected: HTML output from Next.js default page.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with dependencies and test config"
```

---

## Task 2: Types and Zod Schema

**Files:**
- Create: `src/types/application.ts`
- Test: `__tests__/types/application.test.ts`

- [ ] **Step 1: Write failing tests for the Zod schema**

Create `__tests__/types/application.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest __tests__/types/application.test.ts --verbose
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement types and schema**

Create `src/types/application.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest __tests__/types/application.test.ts --verbose
```

Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/types/application.ts __tests__/types/application.test.ts
git commit -m "feat: add Application type and Zod validation schema"
```

---

## Task 3: Supabase Client and Data Access Layer

> **Note:** Column names used here match the schema in Task 14 (`supabase/schema.sql`). You may run Task 14 first if you prefer to set up the DB before writing queries.

**Files:**
- Create: `src/lib/supabase.ts`, `src/lib/queries.ts`
- Test: `__tests__/lib/queries.test.ts`

- [ ] **Step 1: Create Supabase client**

Create `src/lib/supabase.ts`:

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

Note: Using `?? ""` instead of `!` prevents build-time crashes when env vars are not set.

- [ ] **Step 2: Write failing tests for queries**

Create `__tests__/lib/queries.test.ts`:

```ts
import { fetchApplications, insertApplication, updateApplication, deleteApplication } from "@/lib/queries";
import { supabase } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockFrom = supabase.from as jest.Mock;

describe("queries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchApplications", () => {
    it("fetches all applications ordered by created_at desc", async () => {
      const mockData = [{ id: "1", company_name: "Acme" }];
      const mockOrder = jest.fn().mockResolvedValue({ data: mockData, error: null });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await fetchApplications();

      expect(mockFrom).toHaveBeenCalledWith("applications");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
      expect(result).toEqual(mockData);
    });

    it("throws on error", async () => {
      const mockOrder = jest.fn().mockResolvedValue({ data: null, error: { message: "fail" } });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
      mockFrom.mockReturnValue({ select: mockSelect });

      await expect(fetchApplications()).rejects.toThrow("fail");
    });
  });

  describe("insertApplication", () => {
    it("inserts and returns the new application", async () => {
      const input = { company_name: "Acme", position: "Dev" };
      const mockSingle = jest.fn().mockResolvedValue({ data: { id: "1", ...input }, error: null });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      mockFrom.mockReturnValue({ insert: mockInsert });

      const result = await insertApplication(input as any);

      expect(mockInsert).toHaveBeenCalledWith([input]);
      expect(result).toEqual({ id: "1", ...input });
    });
  });

  describe("updateApplication", () => {
    it("updates by id and returns updated row", async () => {
      const mockSingle = jest.fn().mockResolvedValue({ data: { id: "1", status: "Offer" }, error: null });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEq = jest.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ update: mockUpdate });

      const result = await updateApplication("1", { status: "Offer" } as any);

      expect(mockUpdate).toHaveBeenCalledWith({ status: "Offer" });
      expect(mockEq).toHaveBeenCalledWith("id", "1");
      expect(result).toEqual({ id: "1", status: "Offer" });
    });
  });

  describe("deleteApplication", () => {
    it("deletes by id", async () => {
      const mockEq = jest.fn().mockResolvedValue({ error: null });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ delete: mockDelete });

      await deleteApplication("1");

      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("id", "1");
    });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npx jest __tests__/lib/queries.test.ts --verbose
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement query functions**

Create `src/lib/queries.ts`:

```ts
import { supabase } from "./supabase";

type SnakeCaseApplication = {
  id: string;
  company_name: string;
  position: string;
  job_description: string;
  tech_stack: string[];
  applied_at: string;
  job_url: string;
  source: string;
  status: string;
  notes: string | null;
  created_at: string;
};

export async function fetchApplications(): Promise<SnakeCaseApplication[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function insertApplication(
  application: Omit<SnakeCaseApplication, "id" | "created_at">
): Promise<SnakeCaseApplication> {
  const { data, error } = await supabase
    .from("applications")
    .insert([application])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateApplication(
  id: string,
  updates: Partial<Omit<SnakeCaseApplication, "id" | "created_at">>
): Promise<SnakeCaseApplication> {
  const { data, error } = await supabase
    .from("applications")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteApplication(id: string): Promise<void> {
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx jest __tests__/lib/queries.test.ts --verbose
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/supabase.ts src/lib/queries.ts __tests__/lib/queries.test.ts .env.local.example
git commit -m "feat: add Supabase client and data access layer"
```

---

## Task 4: Data Mapping Utilities

**Files:**
- Create: `src/lib/mappers.ts`
- Test: `__tests__/lib/mappers.test.ts`

- [ ] **Step 1: Write failing tests for snake_case <-> camelCase mappers**

Create `__tests__/lib/mappers.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest __tests__/lib/mappers.test.ts --verbose
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement mappers**

Create `src/lib/mappers.ts`:

```ts
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
    notes: data.notes,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest __tests__/lib/mappers.test.ts --verbose
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mappers.ts __tests__/lib/mappers.test.ts
git commit -m "feat: add snake_case/camelCase mapping utilities"
```

---

## Task 5: ApplicationCard Component

**Files:**
- Create: `src/components/application-card.tsx`
- Test: `__tests__/components/application-card.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `__tests__/components/application-card.test.tsx`:

```tsx
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
    render(<ApplicationCard application={mockApp} onClick={jest.fn()} />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
  });

  it("renders tech stack tags", () => {
    render(<ApplicationCard application={mockApp} onClick={jest.fn()} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("renders source and date", () => {
    render(<ApplicationCard application={mockApp} onClick={jest.fn()} />);
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText(/2026-03-18/)).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = jest.fn();
    render(<ApplicationCard application={mockApp} onClick={onClick} />);
    await userEvent.click(screen.getByText("Acme Corp"));
    expect(onClick).toHaveBeenCalledWith(mockApp);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest __tests__/components/application-card.test.tsx --verbose
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement ApplicationCard**

Create `src/components/application-card.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import type { Application, Status } from "@/types/application";

const statusColors: Record<Status, string> = {
  Applied: "bg-status-applied/20 text-status-applied",
  Interview: "bg-status-interview/20 text-status-interview",
  Rejected: "bg-status-rejected/20 text-status-rejected",
  Offer: "bg-status-offer/20 text-status-offer",
};

type Props = {
  application: Application;
  onClick: (application: Application) => void;
};

export function ApplicationCard({ application, onClick }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.2 }}
      className="cursor-pointer rounded-xl bg-white p-4 shadow-sm border border-gray-100 hover:border-gray-200 transition-colors"
      onClick={() => onClick(application)}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-sm">{application.companyName}</h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[application.status]}`}>
          {application.status}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-3">{application.position}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {application.techStack.map((tech) => (
          <span
            key={tech}
            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{application.source}</span>
        <span>{application.appliedAt}</span>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest __tests__/components/application-card.test.tsx --verbose
```

Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/application-card.tsx __tests__/components/application-card.test.tsx
git commit -m "feat: add ApplicationCard component with status badges and hover effects"
```

---

## Task 6: KanbanColumn Component

**Files:**
- Create: `src/components/kanban-column.tsx`
- Test: `__tests__/components/kanban-column.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `__tests__/components/kanban-column.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest __tests__/components/kanban-column.test.tsx --verbose
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement KanbanColumn**

Create `src/components/kanban-column.tsx`:

```tsx
"use client";

import { AnimatePresence, LayoutGroup } from "framer-motion";
import { ApplicationCard } from "./application-card";
import type { Application, Status } from "@/types/application";

const statusHeaderColors: Record<Status, string> = {
  Applied: "bg-status-applied",
  Interview: "bg-status-interview",
  Rejected: "bg-status-rejected",
  Offer: "bg-status-offer",
};

type Props = {
  status: Status;
  applications: Application[];
  onCardClick: (application: Application) => void;
};

export function KanbanColumn({ status, applications, onCardClick }: Props) {
  return (
    <div className="flex-1 min-w-[280px]">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${statusHeaderColors[status]}`} />
        <h2 className="font-semibold text-gray-700">{status}</h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {applications.length}
        </span>
      </div>

      <div className="space-y-3">
        <LayoutGroup>
          <AnimatePresence mode="popLayout">
            {applications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onClick={onCardClick}
              />
            ))}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest __tests__/components/kanban-column.test.tsx --verbose
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/kanban-column.tsx __tests__/components/kanban-column.test.tsx
git commit -m "feat: add KanbanColumn component with status indicators"
```

---

## Task 7: Filters Component

**Files:**
- Create: `src/components/filters.tsx`
- Test: `__tests__/components/filters.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `__tests__/components/filters.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Filters } from "@/components/filters";

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, onClick, style }: any) => (
      <div className={className} onClick={onClick} style={style}>{children}</div>
    ),
  },
}));

describe("Filters", () => {
  const defaultProps = {
    search: "",
    onSearchChange: jest.fn(),
    techFilter: "",
    onTechFilterChange: jest.fn(),
    sourceFilter: "",
    onSourceFilterChange: jest.fn(),
    sortBy: "createdAt" as const,
    onSortByChange: jest.fn(),
  };

  it("renders search input", () => {
    render(<Filters {...defaultProps} />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it("calls onSearchChange when typing", async () => {
    render(<Filters {...defaultProps} />);
    const input = screen.getByPlaceholderText(/search/i);
    await userEvent.type(input, "Acme");
    expect(defaultProps.onSearchChange).toHaveBeenCalled();
  });

  it("renders source filter dropdown", () => {
    render(<Filters {...defaultProps} />);
    expect(screen.getByDisplayValue(/all sources/i)).toBeInTheDocument();
  });

  it("renders sort dropdown", () => {
    render(<Filters {...defaultProps} />);
    expect(screen.getByDisplayValue(/recently created/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest __tests__/components/filters.test.tsx --verbose
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement Filters**

Create `src/components/filters.tsx`:

```tsx
"use client";

import { SOURCES } from "@/types/application";

type SortOption = "createdAt" | "appliedAt";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  techFilter: string;
  onTechFilterChange: (value: string) => void;
  sourceFilter: string;
  onSourceFilterChange: (value: string) => void;
  sortBy: SortOption;
  onSortByChange: (value: SortOption) => void;
};

export function Filters({
  search,
  onSearchChange,
  techFilter,
  onTechFilterChange,
  sourceFilter,
  onSourceFilterChange,
  sortBy,
  onSortByChange,
}: Props) {
  const inputClass =
    "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all";

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <input
        type="text"
        placeholder="Search company..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className={`${inputClass} w-64`}
      />

      <input
        type="text"
        placeholder="Filter by tech (e.g. React)"
        value={techFilter}
        onChange={(e) => onTechFilterChange(e.target.value)}
        className={`${inputClass} w-52`}
      />

      <select
        value={sourceFilter}
        onChange={(e) => onSourceFilterChange(e.target.value)}
        className={inputClass}
      >
        <option value="">All Sources</option>
        {SOURCES.map((source) => (
          <option key={source} value={source}>
            {source}
          </option>
        ))}
      </select>

      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value as SortOption)}
        className={inputClass}
      >
        <option value="createdAt">Recently Created</option>
        <option value="appliedAt">Applied Date</option>
      </select>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest __tests__/components/filters.test.tsx --verbose
```

Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/filters.tsx __tests__/components/filters.test.tsx
git commit -m "feat: add Filters component with search, tech, source, and sort controls"
```

---

## Task 8: Application Form Component

**Files:**
- Create: `src/components/application-form.tsx`
- Test: `__tests__/components/application-form.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `__tests__/components/application-form.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest __tests__/components/application-form.test.tsx --verbose
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement ApplicationForm**

Create `src/components/application-form.tsx`:

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicationSchema, type ApplicationFormData, SOURCES, STATUSES } from "@/types/application";

type Props = {
  onSubmit: (data: ApplicationFormData) => void;
  isSubmitting?: boolean;
};

export function ApplicationForm({ onSubmit, isSubmitting }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      status: "Applied",
      techStack: [],
      jobDescription: "",
    },
  });

  const handleFormSubmit = (data: ApplicationFormData) => {
    onSubmit(data);
  };

  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const inputClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all";
  const errorClass = "text-xs text-red-500 mt-1";

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 max-w-2xl">
      <div>
        <label htmlFor="companyName" className={labelClass}>Company Name</label>
        <input id="companyName" {...register("companyName")} className={inputClass} />
        {errors.companyName && <p className={errorClass}>{errors.companyName.message}</p>}
      </div>

      <div>
        <label htmlFor="position" className={labelClass}>Position</label>
        <input id="position" {...register("position")} className={inputClass} />
        {errors.position && <p className={errorClass}>{errors.position.message}</p>}
      </div>

      <div>
        <label htmlFor="jobUrl" className={labelClass}>Job URL</label>
        <input id="jobUrl" {...register("jobUrl")} className={inputClass} placeholder="https://..." />
        {errors.jobUrl && <p className={errorClass}>{errors.jobUrl.message}</p>}
      </div>

      <div>
        <label htmlFor="jobDescription" className={labelClass}>Job Description</label>
        <textarea
          id="jobDescription"
          {...register("jobDescription")}
          className={`${inputClass} min-h-[100px]`}
        />
      </div>

      <div>
        <label htmlFor="techStack" className={labelClass}>Tech Stack</label>
        <input
          id="techStack"
          placeholder="React, TypeScript, Node.js"
          className={inputClass}
          onChange={(e) => {
            const value = e.target.value;
            const arr = value.split(",").map((s) => s.trim()).filter(Boolean);
            setValue("techStack", arr);
          }}
        />
        <p className="text-xs text-gray-400 mt-1">Comma-separated values</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="source" className={labelClass}>Source</label>
          <select id="source" {...register("source")} className={inputClass}>
            <option value="">Select source...</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.source && <p className={errorClass}>{errors.source.message}</p>}
        </div>

        <div>
          <label htmlFor="status" className={labelClass}>Status</label>
          <select id="status" {...register("status")} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="appliedAt" className={labelClass}>Applied Date</label>
        <input id="appliedAt" type="date" {...register("appliedAt")} className={inputClass} />
        {errors.appliedAt && <p className={errorClass}>{errors.appliedAt.message}</p>}
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>Notes</label>
        <textarea
          id="notes"
          {...register("notes")}
          className={`${inputClass} min-h-[80px]`}
          placeholder="Any additional notes..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-blue-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 transition-all"
      >
        {isSubmitting ? "Saving..." : "Save Application"}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest __tests__/components/application-form.test.tsx --verbose
```

Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/application-form.tsx __tests__/components/application-form.test.tsx
git commit -m "feat: add ApplicationForm with React Hook Form and Zod validation"
```

---

## Task 9: Application Detail Modal

**Files:**
- Create: `src/components/application-modal.tsx`
- Test: `__tests__/components/application-modal.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `__tests__/components/application-modal.test.tsx`:

```tsx
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
      <ApplicationModal application={null} onClose={jest.fn()} onDelete={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders application details when open", () => {
    render(
      <ApplicationModal application={mockApp} onClose={jest.fn()} onDelete={jest.fn()} />
    );
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.getByText("Build amazing UIs with React")).toBeInTheDocument();
    expect(screen.getByText("Referred by a friend")).toBeInTheDocument();
  });

  it("renders job URL as a link", () => {
    render(
      <ApplicationModal application={mockApp} onClose={jest.fn()} onDelete={jest.fn()} />
    );
    const link = screen.getByRole("link", { name: /view job posting/i });
    expect(link).toHaveAttribute("href", "https://acme.com/jobs/1");
  });

  it("calls onClose when close button clicked", async () => {
    const onClose = jest.fn();
    render(
      <ApplicationModal application={mockApp} onClose={onClose} onDelete={jest.fn()} />
    );
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onDelete when delete button clicked", async () => {
    const onDelete = jest.fn();
    render(
      <ApplicationModal application={mockApp} onClose={jest.fn()} onDelete={onDelete} />
    );
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith("1");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest __tests__/components/application-modal.test.tsx --verbose
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement ApplicationModal**

Create `src/components/application-modal.tsx`:

```tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Application, Status } from "@/types/application";

const statusColors: Record<Status, string> = {
  Applied: "bg-status-applied/20 text-status-applied",
  Interview: "bg-status-interview/20 text-status-interview",
  Rejected: "bg-status-rejected/20 text-status-rejected",
  Offer: "bg-status-offer/20 text-status-offer",
};

type Props = {
  application: Application | null;
  onClose: () => void;
  onDelete: (id: string) => void;
};

export function ApplicationModal({ application, onClose, onDelete }: Props) {
  if (!application) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{application.companyName}</h2>
              <p className="text-gray-600">{application.position}</p>
            </div>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${statusColors[application.status]}`}>
              {application.status}
            </span>
          </div>

          <div className="space-y-4 text-sm">
            {application.jobDescription && (
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Job Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{application.jobDescription}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-1">
              {application.techStack.map((tech) => (
                <span key={tech} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">
                  {tech}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 text-gray-600">
              <div>
                <span className="text-gray-400">Source:</span> {application.source}
              </div>
              <div>
                <span className="text-gray-400">Applied:</span> {application.appliedAt}
              </div>
            </div>

            {application.jobUrl && (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-blue-500 hover:text-blue-600 hover:underline"
              >
                View Job Posting
              </a>
            )}

            {application.notes && (
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Notes</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{application.notes}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => onDelete(application.id)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              aria-label="Delete"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              aria-label="Close"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest __tests__/components/application-modal.test.tsx --verbose
```

Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/application-modal.tsx __tests__/components/application-modal.test.tsx
git commit -m "feat: add ApplicationModal with detail view and delete action"
```

---

## Task 10: Custom Hooks (useApplications + useFilters)

**Files:**
- Create: `src/hooks/use-applications.ts`, `src/hooks/use-filters.ts`
- Test: `__tests__/hooks/use-applications.test.ts`

- [ ] **Step 1: Write failing test for useApplications.grouped()**

Create `__tests__/hooks/use-applications.test.ts`:

```ts
import { groupApplications } from "@/hooks/use-applications";
import type { Application } from "@/types/application";

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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest __tests__/hooks/use-applications.test.ts --verbose
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement useFilters hook**

Create `src/hooks/use-filters.ts`:

```ts
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

export type SortOption = "createdAt" | "appliedAt";

export function useFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const search = searchParams.get("search") ?? "";
  const techFilter = searchParams.get("tech") ?? "";
  const sourceFilter = searchParams.get("source") ?? "";
  const sortBy = (searchParams.get("sort") as SortOption) ?? "createdAt";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  return useMemo(
    () => ({
      search,
      techFilter,
      sourceFilter,
      sortBy,
      setSearch: (v: string) => updateParam("search", v),
      setTechFilter: (v: string) => updateParam("tech", v),
      setSourceFilter: (v: string) => updateParam("source", v),
      setSortBy: (v: SortOption) => updateParam("sort", v),
    }),
    [search, techFilter, sourceFilter, sortBy, updateParam]
  );
}
```

- [ ] **Step 4: Implement useApplications hook**

Create `src/hooks/use-applications.ts`:

```ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchApplications, insertApplication, deleteApplication } from "@/lib/queries";
import { toApplication, toSnakeCase } from "@/lib/mappers";
import type { Application, ApplicationFormData, Status } from "@/types/application";

/** Pure function — exported for testing */
export function groupApplications(
  applications: Application[],
  search: string,
  techFilter: string,
  sourceFilter: string,
  sortBy: "createdAt" | "appliedAt"
): Record<Status, Application[]> {
  let filtered = applications;

  if (search) {
    const lower = search.toLowerCase();
    filtered = filtered.filter((a) =>
      a.companyName.toLowerCase().includes(lower)
    );
  }

  if (techFilter) {
    const lower = techFilter.toLowerCase();
    filtered = filtered.filter((a) =>
      a.techStack.some((t) => t.toLowerCase().includes(lower))
    );
  }

  if (sourceFilter) {
    filtered = filtered.filter((a) => a.source === sourceFilter);
  }

  filtered = [...filtered].sort((a, b) => {
    const aVal = sortBy === "appliedAt" ? a.appliedAt : a.createdAt;
    const bVal = sortBy === "appliedAt" ? b.appliedAt : b.createdAt;
    return bVal.localeCompare(aVal);
  });

  const byStatus: Record<Status, Application[]> = {
    Applied: [],
    Interview: [],
    Rejected: [],
    Offer: [],
  };

  for (const app of filtered) {
    byStatus[app.status].push(app);
  }

  return byStatus;
}

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const rows = await fetchApplications();
      setApplications(rows.map(toApplication));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(
    async (data: ApplicationFormData) => {
      const row = await insertApplication(toSnakeCase(data));
      setApplications((prev) => [toApplication(row), ...prev]);
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    await deleteApplication(id);
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const grouped = useCallback(
    (
      search: string,
      techFilter: string,
      sourceFilter: string,
      sortBy: "createdAt" | "appliedAt"
    ) => groupApplications(applications, search, techFilter, sourceFilter, sortBy),
    [applications]
  );

  return { applications, loading, error, add, remove, grouped, reload: load };
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx jest __tests__/hooks/use-applications.test.ts --verbose
```

Expected: All 5 tests PASS.

- [ ] **Step 6: Verify hooks compile**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/use-applications.ts src/hooks/use-filters.ts __tests__/hooks/use-applications.test.ts
git commit -m "feat: add useApplications and useFilters custom hooks with tests"
```

---

## Task 11: Navigation Component

**Files:**
- Create: `src/components/navigation.tsx`
- Test: `__tests__/components/navigation.test.tsx`

- [ ] **Step 1: Write failing test**

Create `__tests__/components/navigation.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { Navigation } from "@/components/navigation";

jest.mock("next/navigation", () => ({
  usePathname: () => "/applications",
}));

jest.mock("next/link", () => {
  return ({ children, href, className }: any) => (
    <a href={href} className={className}>{children}</a>
  );
});

describe("Navigation", () => {
  it("renders app title", () => {
    render(<Navigation />);
    expect(screen.getByText("Application Tracker")).toBeInTheDocument();
  });

  it("renders Board and New Application links", () => {
    render(<Navigation />);
    expect(screen.getByText("Board")).toBeInTheDocument();
    expect(screen.getByText("New Application")).toBeInTheDocument();
  });

  it("links to correct paths", () => {
    render(<Navigation />);
    expect(screen.getByText("Board").closest("a")).toHaveAttribute("href", "/applications");
    expect(screen.getByText("New Application").closest("a")).toHaveAttribute("href", "/new");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest __tests__/components/navigation.test.tsx --verbose
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement Navigation**

Create `src/components/navigation.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-all ${
      pathname === href
        ? "bg-blue-50 text-blue-600"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;

  return (
    <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">
          Application Tracker
        </h1>
        <div className="flex gap-2">
          <Link href="/applications" className={linkClass("/applications")}>
            Board
          </Link>
          <Link href="/new" className={linkClass("/new")}>
            New Application
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest __tests__/components/navigation.test.tsx --verbose
```

Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/navigation.tsx __tests__/components/navigation.test.tsx
git commit -m "feat: add Navigation component with active state"
```

---

## Task 12: KanbanBoard Composite Component

**Files:**
- Create: `src/components/kanban-board.tsx`
- Test: `__tests__/components/kanban-board.test.tsx`

- [ ] **Step 1: Write failing test**

Create `__tests__/components/kanban-board.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest __tests__/components/kanban-board.test.tsx --verbose
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement KanbanBoard**

Create `src/components/kanban-board.tsx`:

```tsx
"use client";

import { useState } from "react";
import { STATUSES, type Application } from "@/types/application";
import { KanbanColumn } from "./kanban-column";
import { Filters } from "./filters";
import { ApplicationModal } from "./application-modal";
import { useApplications } from "@/hooks/use-applications";
import { useFilters } from "@/hooks/use-filters";

export function KanbanBoard() {
  const { loading, error, grouped, remove } = useApplications();
  const filters = useFilters();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const columns = grouped(
    filters.search,
    filters.techFilter,
    filters.sourceFilter,
    filters.sortBy
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading applications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      <Filters
        search={filters.search}
        onSearchChange={filters.setSearch}
        techFilter={filters.techFilter}
        onTechFilterChange={filters.setTechFilter}
        sourceFilter={filters.sourceFilter}
        onSourceFilterChange={filters.setSourceFilter}
        sortBy={filters.sortBy}
        onSortByChange={filters.setSortBy}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={columns[status]}
            onCardClick={setSelectedApp}
          />
        ))}
      </div>

      <ApplicationModal
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
        onDelete={async (id) => {
          await remove(id);
          setSelectedApp(null);
        }}
      />
    </>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest __tests__/components/kanban-board.test.tsx --verbose
```

Expected: All 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/kanban-board.tsx __tests__/components/kanban-board.test.tsx
git commit -m "feat: add KanbanBoard composite component with filters and modal"
```

---

## Task 13: App Layout and Pages

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/app/applications/page.tsx`
- Create: `src/app/new/page.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update global styles**

Replace `src/app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-50 text-gray-900 antialiased;
}
```

- [ ] **Step 2: Update root layout**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Application Tracker",
  description: "Track your job applications with a Kanban board",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Update root page to redirect**

Replace `src/app/page.tsx` with:

```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/applications");
}
```

- [ ] **Step 4: Create Kanban board page**

Create `src/app/applications/page.tsx`:

```tsx
import { Suspense } from "react";
import { KanbanBoard } from "@/components/kanban-board";

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
      <KanbanBoard />
    </Suspense>
  );
}
```

- [ ] **Step 5: Create new application page**

Create `src/app/new/page.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApplicationForm } from "@/components/application-form";
import { useApplications } from "@/hooks/use-applications";
import type { ApplicationFormData } from "@/types/application";

export default function NewApplicationPage() {
  const router = useRouter();
  const { add } = useApplications();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ApplicationFormData) => {
    try {
      setIsSubmitting(true);
      await add(data);
      router.push("/applications");
    } catch (err) {
      console.error("Failed to create application:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Application</h1>
      <ApplicationForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```

Expected: Build succeeds. (Supabase env vars may cause runtime issues, but the build should pass.)

- [ ] **Step 7: Commit**

```bash
git add src/app/ src/components/navigation.tsx
git commit -m "feat: add app layout, pages, and navigation"
```

---

## Task 14: Supabase Database Setup

**Files:**
- Create: `supabase/schema.sql`

- [ ] **Step 1: Create SQL migration file**

Create `supabase/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  job_description TEXT NOT NULL DEFAULT '',
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  applied_at DATE NOT NULL,
  job_url TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('LinkedIn', 'Indeed', 'Company Site', 'Other')),
  status TEXT NOT NULL DEFAULT 'Applied' CHECK (status IN ('Applied', 'Interview', 'Rejected', 'Offer')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);

-- Index for sorting by created_at
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications (created_at DESC);
```

- [ ] **Step 2: Document setup instructions**

The user must:
1. Create a Supabase project at https://supabase.com
2. Run the SQL in `supabase/schema.sql` via the Supabase SQL Editor
3. Copy the project URL and anon key to `.env.local`

- [ ] **Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add Supabase schema for applications table"
```

---

## Task 15: End-to-End Smoke Test and Polish

- [ ] **Step 1: Set up real `.env.local`**

Copy `.env.local.example` to `.env.local` and fill in real Supabase credentials.

- [ ] **Step 2: Run the development server**

```bash
npm run dev
```

- [ ] **Step 3: Manual verification checklist**

Open `http://localhost:3000` and verify:

- [ ] Redirects to `/applications`
- [ ] Navigation shows "Board" and "New Application" links
- [ ] Board shows 4 columns (Applied, Interview, Rejected, Offer)
- [ ] Each column shows colored status indicator
- [ ] Navigate to `/new` — form renders all fields
- [ ] Fill in form and submit — redirects to board, card appears
- [ ] Click a card — modal opens with full details
- [ ] Delete from modal — card disappears
- [ ] Filter by search — board updates
- [ ] Filter by source — board updates
- [ ] Sort toggle works
- [ ] Cards have hover lift effect
- [ ] Transitions are smooth (no flicker)

- [ ] **Step 4: Run all tests**

```bash
npx jest --verbose
```

Expected: All tests pass.

- [ ] **Step 5: Run build**

```bash
npm run build
```

Expected: Clean build with no errors.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: final polish and verification"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Project scaffolding | `package.json`, `jest.config.ts`, `tailwind.config.ts` |
| 2 | Types + Zod schema | `src/types/application.ts` |
| 3 | Supabase client + queries | `src/lib/supabase.ts`, `src/lib/queries.ts` |
| 4 | Data mapping utilities | `src/lib/mappers.ts` |
| 5 | ApplicationCard component | `src/components/application-card.tsx` |
| 6 | KanbanColumn component | `src/components/kanban-column.tsx` |
| 7 | Filters component | `src/components/filters.tsx` |
| 8 | ApplicationForm component | `src/components/application-form.tsx` |
| 9 | ApplicationModal component | `src/components/application-modal.tsx` |
| 10 | Custom hooks | `src/hooks/use-applications.ts`, `src/hooks/use-filters.ts` |
| 11 | Navigation component | `src/components/navigation.tsx` |
| 12 | KanbanBoard composite | `src/components/kanban-board.tsx` |
| 13 | Layout + pages | `src/app/` |
| 14 | Database schema | `supabase/schema.sql` |
| 15 | Smoke test + polish | (verification only) |

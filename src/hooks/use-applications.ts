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

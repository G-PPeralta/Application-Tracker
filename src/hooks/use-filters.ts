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

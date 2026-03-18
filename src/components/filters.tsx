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

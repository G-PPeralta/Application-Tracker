"use client";

import { useState } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { STATUSES, type Application, type Status } from "@/types/application";
import { KanbanColumn } from "./kanban-column";
import { Filters } from "./filters";
import { ApplicationModal } from "./application-modal";
import { useApplications } from "@/hooks/use-applications";
import { useFilters } from "@/hooks/use-filters";

export function KanbanBoard() {
  const { loading, error, grouped, remove, update, updateStatus } = useApplications();
  const filters = useFilters();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const columns = grouped(
    filters.search,
    filters.techFilter,
    filters.sourceFilter,
    filters.sortBy
  );

  const handleDragEnd = (result: DropResult) => {
    const { draggableId, destination } = result;
    if (!destination) return;
    const newStatus = destination.droppableId as Status;
    updateStatus(draggableId, newStatus);
  };

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

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              applications={columns[status]}
              onCardClick={setSelectedApp}
            />
          ))}
        </div>
      </DragDropContext>

      <ApplicationModal
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
        onDelete={async (id) => {
          await remove(id);
          setSelectedApp(null);
        }}
        onUpdate={async (id, data) => {
          await update(id, data);
          setSelectedApp(null);
        }}
      />
    </>
  );
}

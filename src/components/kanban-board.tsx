"use client";

import { useState } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { AnimatePresence, motion } from "framer-motion";
import { STATUSES, type Application, type ApplicationFormData, type Status } from "@/types/application";
import { KanbanColumn } from "./kanban-column";
import { Filters } from "./filters";
import { ApplicationModal } from "./application-modal";
import { ApplicationForm } from "./application-form";
import { useApplications } from "@/hooks/use-applications";
import { useFilters } from "@/hooks/use-filters";

export function KanbanBoard() {
  const { loading, error, grouped, remove, update, updateStatus, add } = useApplications();
  const filters = useFilters();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [createStatus, setCreateStatus] = useState<Status | null>(null);

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
        <div className="grid grid-cols-5 gap-4">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              applications={columns[status]}
              onCardClick={setSelectedApp}
              onAdd={setCreateStatus}
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

      <AnimatePresence>
        {createStatus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setCreateStatus(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">New Application</h2>
              <ApplicationForm
                onSubmit={async (data: ApplicationFormData) => {
                  await add({ ...data, status: createStatus });
                  setCreateStatus(null);
                }}
                onCancel={() => setCreateStatus(null)}
                defaultValues={{ status: createStatus }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

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
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">New Application</h2>
                <button
                  onClick={() => setCreateStatus(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
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

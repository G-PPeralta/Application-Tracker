"use client";

import { Droppable } from "@hello-pangea/dnd";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import { ApplicationCard } from "./application-card";
import type { Application, Status } from "@/types/application";

const statusHeaderColors: Record<Status, string> = {
  Applied: "bg-status-applied",
  "Interview Scheduled": "bg-status-interview",
  Interview: "bg-status-interview",
  Rejected: "bg-status-rejected",
  Offer: "bg-status-offer",
};

type Props = {
  status: Status;
  applications: Application[];
  onCardClick: (application: Application) => void;
  onAdd: (status: Status) => void;
};

export function KanbanColumn({ status, applications, onCardClick, onAdd }: Props) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${statusHeaderColors[status]}`} />
        <h2 className="font-semibold text-gray-700">{status}</h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {applications.length}
        </span>
      </div>

      <Droppable droppableId={status}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-3"
          >
            <LayoutGroup>
              <AnimatePresence mode="popLayout">
                {applications.map((app, index) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onClick={onCardClick}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </LayoutGroup>
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <button
        onClick={() => onAdd(status)}
        className="mt-3 w-full flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <span className="text-lg leading-none">+</span> Add
      </button>
    </div>
  );
}

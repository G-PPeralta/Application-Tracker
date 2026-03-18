"use client";

import { Droppable } from "@hello-pangea/dnd";
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
    </div>
  );
}

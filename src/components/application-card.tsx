"use client";

import { Draggable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import type { Application, Status } from "@/types/application";

const statusColors: Record<Status, string> = {
  Applied: "bg-status-applied/20 text-status-applied",
  "Interview Scheduled": "bg-status-interview/20 text-status-interview",
  Interview: "bg-status-interview/20 text-status-interview",
  Rejected: "bg-status-rejected/20 text-status-rejected",
  Offer: "bg-status-offer/20 text-status-offer",
};

type Props = {
  application: Application;
  onClick: (application: Application) => void;
  index: number;
};

export function ApplicationCard({ application, onClick, index }: Props) {
  return (
    <Draggable draggableId={application.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <motion.div
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
              <div className="text-right">
                <span>{application.appliedAt.split("-").reverse().join("/")}</span>
                {application.interviewDate && (
                  <p className="text-xs text-gray-400">
                    Interview: {application.interviewDate.split("-").reverse().join("/")}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
}

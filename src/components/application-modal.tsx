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

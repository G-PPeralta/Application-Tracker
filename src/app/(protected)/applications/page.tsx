import { Suspense } from "react";
import { KanbanBoard } from "@/components/kanban-board";

export const dynamic = "force-dynamic";

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
      <KanbanBoard />
    </Suspense>
  );
}

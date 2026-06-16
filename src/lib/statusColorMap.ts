import type { EventStatus } from "#/types/event";

export const statusColorMap: Record<EventStatus, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  published: "bg-blue-100 text-blue-700 border-blue-200",
  ongoing: "bg-green-100 text-green-700 border-green-200",
  completed: "bg-gray-100 text-gray-600 border-gray-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

export function getStatusBadgeClass(status: EventStatus): string {
  return (
    statusColorMap[status] ?? "bg-slate-100 text-slate-700 border-slate-200"
  );
}

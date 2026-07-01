import { requirePermission } from "@/utils/routeGuard";
import { Permissions } from "@/constants/permissions";
import { createFileRoute } from '@tanstack/react-router'
import { EventDetailPage } from "#/features/events/EventDetailPage";

export const Route = createFileRoute('/_admin/events/$eventId/')({
  beforeLoad: () => {
    requirePermission(Permissions.EVENTS_READ);
  },
  staticData: {
    title: "Manage Event",
  },
  component: EventDetailPage,
})

import { requirePermission } from "@/utils/routeGuard";
import { Permissions } from "@/constants/permissions";
import { createFileRoute } from '@tanstack/react-router'
import { EventDetailPage } from "#/features/organizer/EventDetailPage";

export const Route = createFileRoute('/_admin/organizer/events/$eventId/')({
  beforeLoad: () => {
    requirePermission(Permissions.EVENTS_READ);
  },
  component: EventDetailPage,
})

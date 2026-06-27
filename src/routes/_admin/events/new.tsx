import { CreateEventPage } from '#/features/events/CreateEventPage'
import { requirePermission } from '#/utils/routeGuard';
import { Permissions } from '#/constants/permissions'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/events/new')({
  beforeLoad: () => {
    requirePermission(Permissions.EVENTS_CREATE);
  },
  staticData: {
    title: "Create Event",
  },
  component: CreateEventPage,
})


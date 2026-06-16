import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '#/utils/routeGuard'
import { Permissions } from '#/constants/permissions'
import { EventsPage } from '#/features/organizer/EventPage'

export const Route = createFileRoute('/_admin/organizer/events/')({
  beforeLoad: () => {
    requirePermission(Permissions.EVENTS_READ)
  },
  component: EventsPage,
})


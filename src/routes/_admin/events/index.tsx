import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '#/utils/routeGuard'
import { Permissions } from '#/constants/permissions'
import { EventsPage } from '#/features/events/EventPage'

export const Route = createFileRoute('/_admin/events/')({
  beforeLoad: () => {
    requirePermission(Permissions.EVENTS_READ)
  },
  staticData: {
    title: "Events"
  },
  component: EventsPage,
})


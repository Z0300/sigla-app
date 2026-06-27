import { Permissions } from '#/constants/permissions'
import { OrganizerDashboard } from '#/features/organizer/OrganizerDashboard'
import { requirePermission } from '#/utils/routeGuard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/')({
  beforeLoad: () => {
    requirePermission(Permissions.EVENTS_READ)
  },
  staticData: {
    title: "Dashboard"
  },
  component: OrganizerDashboard,
})


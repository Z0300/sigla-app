import { Permissions } from '#/constants/permissions'
import { DashboardPage } from '#/features/events/DashboardPage'
import { requirePermission } from '#/utils/routeGuard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/')({
  beforeLoad: () => {
    requirePermission(Permissions.EVENTS_READ)
  },
  staticData: {
    title: "Dashboard"
  },
  component: DashboardPage,
})


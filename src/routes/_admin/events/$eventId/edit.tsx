import { Permissions } from '#/constants/permissions'
import { EditEventPage } from '#/features/events/EditEventPage'
import { requirePermission } from '#/utils/routeGuard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/events/$eventId/edit')({
  beforeLoad: () => {
    requirePermission(Permissions.EVENTS_UPDATE)
  },
  staticData: {
    title: "Edit Event"
  },
  component: EditEventPage,
})


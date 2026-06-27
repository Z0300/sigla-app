import { Permissions } from '#/constants/permissions'
import { EditEventPage } from '#/features/organizer/EditEventPage'
import { requirePermission } from '#/utils/routeGuard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/organizer/events/$eventId/edit')({
  beforeLoad: () => requirePermission(Permissions.EVENTS_UPDATE),
  component: EditEventPage,
  staticData: {
    title: "Edit Event"
  }
})


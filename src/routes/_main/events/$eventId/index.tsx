import { Permissions } from '#/constants/permissions'
import { EventDetailPage } from '#/features/events/EventDetailPage'
import { requirePermission } from '#/utils/routeGuard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/events/$eventId/')({
    beforeLoad: () => {
        requirePermission(Permissions.EVENTS_READ)
    },
    component: EventDetailPage,
})


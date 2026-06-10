import { Permissions } from '#/constants/permissions'
import { requirePermission } from '#/utils/routeGuard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/events/$eventId/')({
    beforeLoad: () => {
        requirePermission(Permissions.EVENTS_READ)
    },
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/_main/events/$eventId/"!</div>
}

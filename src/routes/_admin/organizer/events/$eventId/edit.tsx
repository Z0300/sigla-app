import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/organizer/events/$eventId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/organizer/events/$eventId/"!</div>
}

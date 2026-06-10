import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/events/tickets')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_main/tickets"!</div>
}

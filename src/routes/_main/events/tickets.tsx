import TicketsPage from '#/features/events/TicketsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/events/tickets')({
  component: TicketsPage,
})


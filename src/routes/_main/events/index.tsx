import GlobalPending from '#/components/global-pending';
import { Input } from '#/components/ui/input';
import { Skeleton } from '#/components/ui/skeleton';
import { Permissions } from '#/constants/permissions';
import { EventCard } from '#/features/events/EventCard';
import { usePublicEvents } from '#/services/events/eventQueries';
import type { EventFilters } from '#/types/event';
import { requirePermission } from '#/utils/routeGuard';
import { createFileRoute } from '@tanstack/react-router'
import { Calendar, Search } from 'lucide-react';
import { useState, useTransition } from 'react';

export const Route = createFileRoute('/_main/events/')({
  beforeLoad: () => {
    requirePermission(Permissions.EVENTS_READ)
  },
  component: RouteComponent,
  pendingComponent: GlobalPending
})

const STATUS_FILTERS: { label: string; value: EventFilters['status'] }[] = [
  { label: 'All', value: null },
  { label: 'Open', value: 'published' },
  { label: 'Ongoing', value: 'ongoing' },
]

function RouteComponent() {

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<EventFilters['status']>(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [, startTransition] = useTransition()


  const handleSearch = (value: string) => {
    setSearch(value)
    clearTimeout((window as any).__searchTimer)
      ; (window as any).__searchTimer = setTimeout(() => {
        startTransition(() => setDebouncedSearch(value))
      }, 400)
  }

  const { data, isPending, isError } = usePublicEvents({
    searchTerm: debouncedSearch || undefined,
    status,
  })

  return (
    <div className="w-full max-w-5xl mx-auto  px-4 py-8 space-y-6">

      <h1 className="text-2xl font-semibold tracking-tight">Upcoming Events</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Browse and register for open events
      </p>


      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search events..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>


        <div className="flex gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={String(f.value)}
              onClick={() => setStatus(f.value)}
              className={[
                'px-4 py-1.5 rounded-full text-sm font-medium border transition-colors',
                status === f.value
                  ? 'border-transparent text-white'
                  : 'bg-muted text-muted-foreground border-border hover:border-[#E05C33]/40 hover:text-[#E05C33]',
              ].join(' ')}
              style={status === f.value ? { backgroundColor: '#E05C33', borderColor: '#E05C33' } : {}}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>


      {!isPending && (
        <p className="text-xs text-muted-foreground">
          {data?.meta.totalElements === 0
            ? 'No events found'
            : `Showing ${data?.meta.totalElements} events`}
        </p>
      )}


      {isPending ? (
        <EventsGridSkeleton />
      ) : isError ? (
        <ErrorState />
      ) : data?.data.length === 0 ? (
        <EmptyState search={debouncedSearch} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.data.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}

function EventsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border overflow-hidden">
          <Skeleton className="h-24 w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-2 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <Calendar className="h-10 w-10 text-muted-foreground/40" />
      <p className="font-medium text-muted-foreground">No events found</p>
      {search && (
        <p className="text-sm text-muted-foreground/70">
          No results for "{search}" — try a different search term
        </p>
      )}
    </div>
  )
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-2 text-center">
      <p className="font-medium text-destructive">Failed to load events</p>
      <p className="text-sm text-muted-foreground">Check your connection and try again</p>
    </div>
  )
}

import { Input } from '#/components/ui/input'
import { Skeleton } from '#/components/ui/skeleton'
import { Badge } from '#/components/ui/badge'
import { useMyTickets } from '#/services/events/eventQueries'
import type { AttendeeSimple, TicketResponse } from '#/types'
import { format } from 'date-fns'
import { Calendar, Search, Ticket } from 'lucide-react'
import { useState, useTransition, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'

type TicketStatus = AttendeeSimple['status']

const STATUS_FILTERS: { label: string; value: TicketStatus | null }[] = [
    { label: 'All', value: null },
    { label: 'Registered', value: 'registered' },
    { label: 'Checked In', value: 'checked_in' },
    { label: 'Cancelled', value: 'cancelled' },
]

const STATUS_CONFIG: Record<
    TicketStatus,
    { label: string; className: string }
> = {
    registered: {
        label: 'Registered',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    checked_in: {
        label: 'Checked In',
        className: 'bg-violet-100 text-violet-700 border-violet-200',
    },
    cancelled: {
        label: 'Cancelled',
        className: 'bg-muted text-muted-foreground border-border',
    },
    no_show: {
        label: 'No Show',
        className: 'bg-orange-100 text-orange-700 border-orange-200',
    },
}

const ACCENT = '#E05C33'

export default function TicketsPage() {
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<TicketStatus | null>(null)
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [, startTransition] = useTransition()

    const handleSearch = (value: string) => {
        setSearch(value)
        clearTimeout((window as any).__ticketsSearchTimer)
            ; (window as any).__ticketsSearchTimer = setTimeout(() => {
                startTransition(() => setDebouncedSearch(value))
            }, 400)
    }

    const { data, isPending, isError } = useMyTickets()

    // Client-side filter by search + status (server may not support these params)
    const filtered = useMemo(() => {
        if (!data) return []
        return data.data.filter((ticket) => {
            const matchesStatus = status === null || ticket.attendeeStatus === status
            const q = debouncedSearch.toLowerCase()
            const matchesSearch =
                !q || ticket.eventTitle.toLowerCase().includes(q)
            return matchesStatus && matchesSearch
        })
    }, [data, debouncedSearch, status])

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">My Tickets</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    All events you have registered for
                </p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Search your tickets..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 flex-wrap">
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
                            style={
                                status === f.value
                                    ? { backgroundColor: ACCENT, borderColor: ACCENT }
                                    : {}
                            }
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Result count */}
            {!isPending && (
                <p className="text-xs text-muted-foreground">
                    {filtered.length === 0
                        ? 'No tickets found'
                        : `Showing ${filtered.length} ticket${filtered.length !== 1 ? 's' : ''}`}
                </p>
            )}

            {/* Grid */}
            {isPending ? (
                <TicketsGridSkeleton />
            ) : isError ? (
                <ErrorState />
            ) : filtered.length === 0 ? (
                <EmptyState search={debouncedSearch} />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((ticket) => (
                        <TicketCard key={ticket.eventId} ticket={ticket} />
                    ))}
                </div>
            )}
        </div>
    )
}

function TicketCard({ ticket }: { ticket: TicketResponse }) {
    const navigate = useNavigate()
    const cfg = STATUS_CONFIG[ticket.attendeeStatus]
    const isCheckedIn = ticket.attendeeStatus === 'checked_in'
    const isCancelled = ticket.attendeeStatus === 'cancelled'

    return (
        <div
            className={[
                'rounded-xl border bg-card flex flex-col overflow-hidden transition-colors cursor-pointer',
                isCancelled
                    ? 'opacity-60'
                    : 'hover:border-foreground/20',
            ].join(' ')}
            onClick={() =>
                navigate({
                    to: '/events/$eventId',
                    params: { eventId: ticket.eventId.toString() },
                })
            }
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
                e.key === 'Enter' &&
                navigate({
                    to: '/events/$eventId',
                    params: { eventId: ticket.eventId.toString() },
                })
            }
            aria-label={`View ticket for ${ticket.eventTitle}`}
        >
            {/* Status stripe */}
            <div
                className={`h-1.5 w-full ${isCheckedIn ? 'bg-violet-400' : isCancelled ? 'bg-muted-foreground/30' : 'bg-emerald-400'}`}
            />

            <div className="p-4 flex flex-col gap-3 flex-1">
                {/* Title + status badge */}
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm leading-snug flex-1">
                        {ticket.eventTitle}
                    </h3>
                    <Badge variant="secondary" className={cfg.className}>
                        {cfg.label}
                    </Badge>
                </div>

                {/* Registered date */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>
                            Registered {format(new Date(ticket.registeredAt), 'MMM d, yyyy')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function TicketsGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border overflow-hidden">
                    <Skeleton className="h-1.5 w-full" />
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
            <Ticket className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-muted-foreground">No tickets found</p>
            {search ? (
                <p className="text-sm text-muted-foreground/70">
                    No results for "{search}" — try a different search term
                </p>
            ) : (
                <p className="text-sm text-muted-foreground/70">
                    You haven't registered for any events yet
                </p>
            )}
        </div>
    )
}

function ErrorState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-center">
            <p className="font-medium text-destructive">Failed to load your tickets</p>
            <p className="text-sm text-muted-foreground">
                Check your connection and try again
            </p>
        </div>
    )
}
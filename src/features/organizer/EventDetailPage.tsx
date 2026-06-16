import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { safeFormat as format } from '#/utils/date'
import { ArrowLeft, Plus, MoreHorizontal, Pencil, Trash2, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import { useOrganizerEvents } from '#/services/organizer/organizQueries'
import { useDeleteSession, useOrganizerAttendees, useOrganizerSessions } from '#/services/organizer/organizerMutations'
import { SessionFormDialog } from './SessionFormDialog'
import type { OrganizerEvent, OrganizerSession } from '#/types'


const ATTENDEE_STATUS_STYLES: Record<string, string> = {
    registered: 'bg-violet-100 text-violet-700',
    checked_in: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    no_show: 'bg-muted text-muted-foreground',
}

export function EventDetailPage() {
    const { eventId: id } = useParams({ strict: false })
    const navigate = useNavigate()
    const eventIdNum = Number(id)
    const { data: events } = useOrganizerEvents()
    const event = events?.data?.find((e) => e.id === eventIdNum)

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
            <button
                onClick={() => navigate({ to: '/organizer/events' })}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to events
            </button>

            <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {event?.title ?? <Skeleton className="h-8 w-48" />}
                    </h1>
                    {event && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {format(event.startDate, 'MMM d')} – {format(event.endDate, 'MMM d, yyyy')}
                            {event.venue && ` · ${event.venue}`}
                        </p>
                    )}
                </div>
            </div>

            <Tabs defaultValue="sessions">
                <TabsList>
                    <TabsTrigger value="sessions">Sessions</TabsTrigger>
                    <TabsTrigger value="attendees">Attendees</TabsTrigger>
                </TabsList>

                <TabsContent value="sessions" className="mt-4">
                    {event && (
                        <SessionsTab eventId={eventIdNum} eventStatus={event.status} event={event} />
                    )}
                </TabsContent>

                <TabsContent value="attendees" className="mt-4">
                    <AttendeesTab eventId={eventIdNum} />
                </TabsContent>
            </Tabs>
        </div>
    )
}


function SessionsTab({ eventId, eventStatus, event }: { eventId: number; eventStatus?: string, event: OrganizerEvent }) {
    const { data: sessions, isPending } = useOrganizerSessions(eventId)
    const deleteSession = useDeleteSession(eventId)

    const [createOpen, setCreateOpen] = useState(false)
    const [editSession, setEditSession] = useState<OrganizerSession | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<OrganizerSession | null>(null)

    const locked = eventStatus && !['draft', 'published'].includes(eventStatus) || undefined

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)} disabled={locked}>
                    <Plus className="h-4 w-4" />
                    Add session
                </Button>
            </div>

            <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/40">
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Session</th>
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden sm:table-cell">Time</th>
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden md:table-cell">Room</th>
                            <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Check-ins</th>
                            <th className="px-4 py-2.5 w-10"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {isPending ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i} className="border-b">
                                    <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                                    <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-4 w-28" /></td>
                                    <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-16" /></td>
                                    <td className="px-4 py-3"><Skeleton className="h-4 w-10 ml-auto" /></td>
                                    <td className="px-4 py-3"></td>
                                </tr>
                            ))
                        ) : sessions?.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                                    No sessions yet. Add a session to build the schedule.
                                </td>
                            </tr>
                        ) : (
                            sessions?.map((session) => (
                                <tr key={session.id} className="border-b last:border-b-0 hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">{session.title}</td>
                                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                                        {format(session.startTime, 'MMM d, h:mm a')} – {format(session.endTime, 'h:mm a')}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{session.room}</td>
                                    <td className="px-4 py-3 text-right text-muted-foreground">
                                        {session.checkInCount} / {session.capacity}
                                    </td>
                                    <td className="px-4 py-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditSession(session)} disabled={!!locked}>
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem disabled={eventStatus !== 'ongoing'}>
                                                    <QrCode className="h-4 w-4 mr-2" />
                                                    Generate check-in QR
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => setDeleteTarget(session)}
                                                    disabled={!!locked || session.checkInCount > 0}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <SessionFormDialog open={createOpen} onOpenChange={setCreateOpen} eventId={eventId} event={event!} />

            {editSession && (
                <SessionFormDialog
                    open
                    onOpenChange={(open) => !open && setEditSession(null)}
                    eventId={eventId}
                    event={event}
                    session={editSession}
                />
            )}

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{deleteTarget?.title}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This removes the session from the schedule. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => {
                                if (deleteTarget) {
                                    deleteSession.mutate(deleteTarget.id)
                                    setDeleteTarget(null)
                                }
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

// ─── Attendees tab ────────────────────────────────────────────────────────

const ATTENDEE_FILTERS = [
    { label: 'All', value: null },
    { label: 'Registered', value: 'registered' },
    { label: 'Checked in', value: 'checked_in' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'No show', value: 'no_show' },
]

function AttendeesTab({ eventId }: { eventId: number }) {
    const [status, setStatus] = useState<string | null>(null)
    const { data, isPending } = useOrganizerAttendees(eventId, status)
    const attendees = data?.data ?? []

    return (
        <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
                {ATTENDEE_FILTERS.map((f) => (
                    <button
                        key={String(f.value)}
                        onClick={() => setStatus(f.value)}
                        className={[
                            'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                            status === f.value
                                ? 'bg-foreground text-background border-foreground'
                                : 'bg-muted text-muted-foreground border-border hover:border-foreground/30',
                        ].join(' ')}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/40">
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Name</th>
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                            <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground hidden sm:table-cell">Registered</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isPending ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="border-b">
                                    <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                                    <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-4 w-36" /></td>
                                    <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                                    <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-4 w-20 ml-auto" /></td>
                                </tr>
                            ))
                        ) : attendees.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                                    No attendees{status ? ` with status "${status}"` : ''} yet.
                                </td>
                            </tr>
                        ) : (
                            attendees.map((a) => (
                                <tr key={a.id} className="border-b last:border-b-0 hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">{a.userFullName}</td>
                                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{a.userEmail}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant="secondary" className={ATTENDEE_STATUS_STYLES[a.status] ?? ''}>
                                            {a.status.replace('_', ' ')}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                                        {format(a.registeredAt, 'MMM d, yyyy')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {data && (
                <p className="text-xs text-muted-foreground">
                    {data.meta.totalElements} attendee{data.meta.totalElements !== 1 ? 's' : ''}
                    {status ? ` · filtered by "${status.replace('_', ' ')}"` : ''}
                </p>
            )}
        </div>
    )
}
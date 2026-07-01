import { useMemo, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { safeFormat as format } from '#/utils/date'
import {
    ArrowLeft,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    QrCode,
    Calendar,
    MapPin,
    Megaphone,
    Users,
    AlertTriangle,
    Wrench
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
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
    registered: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    checked_in: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    no_show: 'bg-muted text-muted-foreground',
}

export function EventDetailPage() {
    const { eventId: id } = useParams({ strict: false })
    const navigate = useNavigate()
    const eventIdNum = Number(id)
    const { data: events } = useOrganizerEvents()
    const event = events?.data?.find((e) => e.id === eventIdNum)

    const [createOpen, setCreateOpen] = useState(false)

    return (
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
            <button
                onClick={() => navigate({ to: '/events' })}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to events
            </button>

            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {event?.title ?? <Skeleton className="h-9 w-64" />}
                    </h1>
                    {event ? (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(event.startDate, 'MMM dd')} – {format(event.endDate, 'MMM dd, yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {event.venue || "Convention Hall"}
                            </span>
                        </div>
                    ) : (
                        <Skeleton className="h-4 w-48" />
                    )}
                </div>

                {event && (
                    <Button
                        size="sm"
                        className="gap-2 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black"
                        onClick={() => setCreateOpen(true)}
                        disabled={event.status && !['draft', 'published'].includes(event.status)}
                    >
                        <Plus className="h-4 w-4" />
                        Add session
                    </Button>
                )}
            </div>

            <Tabs defaultValue="sessions" className="w-full">
                <TabsList className="bg-transparent p-0 border-b w-full justify-start rounded-none h-11 space-x-6">
                    <TabsTrigger value="sessions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-1 pb-3 pt-2 text-sm font-medium shadow-none">Sessions</TabsTrigger>
                    <TabsTrigger value="attendees" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-1 pb-3 pt-2 text-sm font-medium shadow-none">Attendees</TabsTrigger>
                    <TabsTrigger value="ticketing" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-1 pb-3 pt-2 text-sm font-medium shadow-none">Ticketing</TabsTrigger>
                </TabsList>

                <TabsContent value="sessions" className="mt-6">
                    {event && (
                        <SessionsTab
                            eventId={eventIdNum}
                            eventStatus={event.status}
                            event={event}
                            createOpen={createOpen}
                            setCreateOpen={setCreateOpen}
                        />
                    )}
                </TabsContent>

                <TabsContent value="attendees" className="mt-6">
                    <AttendeesTab eventId={eventIdNum} />
                </TabsContent>
            </Tabs>
        </div>
    )
}


interface SessionsTabProps {
    eventId: number;
    eventStatus?: string;
    event: OrganizerEvent;
    createOpen: boolean;
    setCreateOpen: (open: boolean) => void;
}

export function SessionsTab({ eventId, eventStatus, event, createOpen, setCreateOpen }: SessionsTabProps) {
    const { data: sessions, isPending } = useOrganizerSessions(eventId)
    const deleteSession = useDeleteSession(eventId)

    const [editSession, setEditSession] = useState<OrganizerSession | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<OrganizerSession | null>(null)
    const [conflictTarget, setConflictTarget] = useState<OrganizerSession | null>(null)

    const locked = eventStatus && !['draft', 'published'].includes(eventStatus) || undefined

    const eventDays = useMemo(() => {
        if (!event?.startDate || !event?.endDate) return [];
        const days: Date[] = [];
        const cursor = new Date(event.startDate);
        const end = new Date(event.endDate);
        cursor.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        while (cursor <= end) {
            days.push(new Date(cursor));
            cursor.setDate(cursor.getDate() + 1);
        }
        return days;
    }, [event?.startDate, event?.endDate]);

    const [selectedDay, setSelectedDay] = useState<number>(0);

    const sessionsWithConflictStatus = useMemo(() => {
        if (!sessions) return [];

        return sessions.map((current) => {
            // Strip off any trailing 'Z' or offset to force browser to parse as local wall-clock time
            const cleanStartStr = current.startTime.endsWith('Z') ? current.startTime.slice(0, 19) : current.startTime;
            const cleanEndStr = current.endTime.endsWith('Z') ? current.endTime.slice(0, 19) : current.endTime;

            const currentStart = new Date(cleanStartStr).getTime();
            const currentEnd = new Date(cleanEndStr).getTime();

            const conflictingSession = sessions.find((other) => {
                if (other.id === current.id) return false;

                const currentRoom = (current.room || "").trim().toLowerCase();
                const otherRoom = (other.room || "").trim().toLowerCase();
                if (currentRoom !== otherRoom) return false;

                const cleanOtherStartStr = other.startTime.endsWith('Z') ? other.startTime.slice(0, 19) : other.startTime;
                const cleanOtherEndStr = other.endTime.endsWith('Z') ? other.endTime.slice(0, 19) : other.endTime;

                const otherStart = new Date(cleanOtherStartStr).getTime();
                const otherEnd = new Date(cleanOtherEndStr).getTime();

                // Overlap equation check
                return currentStart < otherEnd && currentEnd > otherStart;
            });

            return {
                ...current,
                hasConflict: !!conflictingSession,
                conflictingSessions: conflictingSession
            };
        });
    }, [sessions]);

    const sessionsForSelectedDay = useMemo(() => {
        if (!eventDays.length) return sessionsWithConflictStatus;
        const dayStart = eventDays[selectedDay];
        if (!dayStart) return sessionsWithConflictStatus;

        const dayStartTime = dayStart.getTime();
        const dayEndTime = dayStartTime + 24 * 60 * 60 * 1000;

        return sessionsWithConflictStatus.filter((s) => {
            const cleanStartStr = s.startTime.endsWith('Z') ? s.startTime.slice(0, 19) : s.startTime;
            const t = new Date(cleanStartStr).getTime();
            return t >= dayStartTime && t < dayEndTime;
        });
    }, [sessionsWithConflictStatus, eventDays, selectedDay]);

    return (
        <div className="space-y-6">
            <div className="flex gap-2 bg-muted/50 p-1 rounded-lg w-fit border">
                {eventDays.map((day, idx) => (
                    <Button
                        key={day.toISOString()}
                        size="sm"
                        variant={selectedDay === idx ? 'secondary' : 'ghost'}
                        className={selectedDay === idx
                            ? 'bg-white shadow-sm text-xs font-medium h-8 px-4'
                            : 'text-muted-foreground text-xs font-medium h-8 px-4'}
                        onClick={() => setSelectedDay(idx)}
                    >
                        Day {idx + 1} : {format(day.toISOString(), 'MMM dd')}
                    </Button>
                ))}
            </div>

            <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-12 before:w-px before:bg-border/60">
                {isPending ? (
                    Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="flex gap-8 items-start">
                            <Skeleton className="h-4 w-12 mt-2" />
                            <Skeleton className="h-28 flex-1 rounded-xl" />
                        </div>
                    ))
                ) : sessionsForSelectedDay.length === 0 ? (
                    <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground bg-card">
                        No sessions yet. Add a session to build the schedule.
                    </div>
                ) : (
                    sessionsForSelectedDay.map((session) => {
                        const isKeynote = session.title.toLowerCase().includes('keynote')
                        const capacityPercentage = Math.min(((session.checkInCount || 0) / (session.capacity || 30)) * 100, 100)

                        return (
                            <div key={session.id} className="flex gap-8 items-start group">
                                <div className="w-12 text-right text-xs font-medium text-muted-foreground space-y-1 pt-4">
                                    <div className="text-foreground font-semibold">{format(session.startTime, 'hh:mm')}</div>
                                    <div className="uppercase">{format(session.startTime, 'a')}</div>
                                </div>

                                <div className={`flex-1 bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-6 relative ${session.hasConflict ? 'border-amber-200 bg-amber-50/10 dark:bg-amber-950/5' : ''}`}>
                                    <div className="flex gap-4 items-start">
                                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${session.hasConflict ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-muted text-muted-foreground'}`}>
                                            {session.hasConflict ? <AlertTriangle className="h-5 w-5" /> : isKeynote ? <Megaphone className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                                        </div>

                                        <div className="space-y-1.5">
                                            <h3 className="font-semibold text-base tracking-tight">{session.title}</h3>

                                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <span className="font-medium text-foreground">{format(session.startTime, 'hh:mm a')}</span> - {format(session.endTime, 'hh:mm a')}
                                                </span>
                                                <span>•</span>
                                                <span>Room: <span className="font-medium text-foreground">{session.room || "Hall A"}</span></span>

                                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 text-[10px] font-bold tracking-wide uppercase px-1.5 py-0">
                                                    {isKeynote ? "ACTIVE" : "UPCOMING"}
                                                </Badge>

                                                {session.hasConflict && (
                                                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 text-[10px] font-semibold gap-1 px-1.5 py-0 animate-pulse">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        TIME OVERLAP
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 shrink-0">
                                        <div className="w-36 space-y-1.5 text-right hidden sm:block">
                                            <div className="text-xs text-muted-foreground">
                                                Capacity <span className="font-medium text-foreground">{session.checkInCount || 0}/{session.capacity || 30}</span>
                                            </div>
                                            <Progress value={capacityPercentage} className="h-1.5 bg-muted" />
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {session.hasConflict && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-100/60 transition-colors"
                                                    onClick={() => setConflictTarget(session)}
                                                >
                                                    <Wrench className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setEditSession(session)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setEditSession(session)} disabled={!!locked}>
                                                        <Pencil className="h-4 w-4 mr-2" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem disabled={eventStatus !== 'ongoing'}>
                                                        <QrCode className="h-4 w-4 mr-2" /> Generate check-in QR
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => setDeleteTarget(session)}
                                                        disabled={!!locked || (session.checkInCount || 0) > 0}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <SessionFormDialog
                open={createOpen}
                onOpenChange={setCreateOpen} eventId={eventId} event={event!}
                existingSessions={sessions}
            />
            {editSession && (
                <SessionFormDialog open onOpenChange={(open) => !open && setEditSession(null)}
                    eventId={eventId} event={event} session={editSession}
                    existingSessions={sessions}
                />
            )}

            {/* Conflict Alert Panel */}
            <AlertDialog open={!!conflictTarget} onOpenChange={(open) => !open && setConflictTarget(null)}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                            <AlertTriangle className="h-5 w-5" />
                            <AlertDialogTitle>Resolve Room & Time Conflict</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="space-y-4">
                            <span>The room <strong>{conflictTarget?.room || "Unassigned Hall"}</strong> is booked by multiple sessions during this time frame:</span>

                            <div className="p-3 bg-muted rounded-lg space-y-2 border text-xs text-left">
                                <div className="border-b pb-1.5">
                                    <span className="font-semibold text-foreground block">🚨 Current Session:</span>
                                    {conflictTarget?.title} ({conflictTarget && format(conflictTarget.startTime, 'h:mm a')} - {conflictTarget && format(conflictTarget.endTime, 'h:mm a')})
                                </div>
                                {/* ✅ Correctly matching configuration flag parameters */}
                                {conflictTarget?.conflictingSessions && (
                                    <div>
                                        <span className="font-semibold text-foreground block">📅 Overlapping Session:</span>
                                        {conflictTarget.conflictingSessions.title} ({format(conflictTarget.conflictingSessions.startTime, 'h:mm a')} - {format(conflictTarget.conflictingSessions.endTime, 'h:mm a')})
                                    </div>
                                )}
                            </div>
                            <span>Would you like to modify the schedule parameters for this session to clear this conflict?</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={() => {
                                const target = conflictTarget;
                                setConflictTarget(null);
                                if (target) setEditSession(target);
                            }}
                        >
                            Open Form Editor
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Alert Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{deleteTarget?.title}"?</AlertDialogTitle>
                        <AlertDialogDescription>This removes the session from the schedule. This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => { if (deleteTarget) { deleteSession.mutate(deleteTarget.id); setDeleteTarget(null) } }}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
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

            <div className="rounded-lg border overflow-hidden bg-card">
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
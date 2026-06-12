import { Calendar, MapPin, Users, Clock, ArrowLeft } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

import { RegistrationSidebar } from './RegistrationSidebar'
import { useEventDetail, useMyRegistration } from '#/services/events/eventQueries'
import { useNavigate, useParams } from '@tanstack/react-router'
import { safeFormat } from '#/utils/date'

export function EventDetailPage() {
    const navigate = useNavigate()

    const { eventId } = useParams({ from: '/_main/events/$eventId/' })
    const id = Number(eventId)

    const { data: event, isPending: loadingEvent } = useEventDetail(id)
    const { data: myReg, isPending: loadingReg } = useMyRegistration(id)

    if (loadingEvent) return <EventDetailSkeleton />

    if (!event) return (
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
            <p className="text-muted-foreground">Event not found.</p>
        </div>
    )

    const isOngoing = event.status === 'ongoing'

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">


            <button
                onClick={() => navigate({ to: '/events' })}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to events
            </button>


            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">


                <div className="space-y-5">


                    <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                                variant="secondary"
                                className={
                                    isOngoing
                                        ? 'bg-violet-100 text-violet-700'
                                        : 'bg-emerald-100 text-emerald-700'
                                }
                            >
                                {isOngoing ? 'Ongoing' : 'Open for registration'}
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight">{event.title}</h1>


                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <>
                                    {safeFormat(event.endDate, 'MMM d, yyyy')}
                                </>

                            </span>
                            <span className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                {event.venue}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Users className="h-4 w-4" />
                                {event.registeredCount} / {event.capacity} registered
                            </span>
                        </div>
                    </div>


                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{event.registeredCount} registered</span>
                            <span>{event.capacity} total spots</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full rounded-full bg-emerald-500 transition-all"
                                style={{ width: `${Math.min(((event.registeredCount ?? 0) / (event.capacity ?? 1)) * 100, 100)}%` }}
                            />
                        </div>
                    </div>

                    <Separator />


                    {event.description && (
                        <div className="space-y-2">
                            <h2 className="font-medium">About this event</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {event.description}
                            </p>
                        </div>
                    )}

                    <Separator />


                    <div className="space-y-3">
                        <h2 className="font-medium">Sessions</h2>
                        <div className="rounded-lg border overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40">
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Session</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden sm:table-cell">Time</th>
                                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden md:table-cell">Room</th>
                                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Capacity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(event.sessions ?? []).map((session, i) => (
                                        <tr key={session.id} className={i !== (event.sessions ?? []).length - 1 ? 'border-b' : ''}>
                                            <td className="px-4 py-3 font-medium">{session.title}</td>
                                            <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {safeFormat(session.startTime, 'h:mm a')} – {safeFormat(session.endTime, 'h:mm a')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{session.room}</td>
                                            <td className="px-4 py-3 text-muted-foreground text-right">{session.capacity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>


                <RegistrationSidebar
                    event={event}
                    myRegistration={myReg ?? null}
                    loadingReg={loadingReg}
                />
            </div>
        </div>
    )
}

function EventDetailSkeleton() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
            <Skeleton className="h-4 w-24" />
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        </div>
    )
}
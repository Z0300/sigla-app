import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { EventFormContent } from './EventFormContent'
import { useOrganizerEventDetail } from '#/services/organizer/organizQueries'

export function EditEventPage() {
    const navigate = useNavigate()
    const { eventId } = useParams({ from: '/_admin/events/$eventId/edit' })
    const { data: event, isPending } = useOrganizerEventDetail(Number(eventId))

    return (
        <div className="max-w-4xl mx-auto px-6 py-8">
            <button
                onClick={() => navigate({ to: '/events' })}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to events
            </button>

            <div className="space-y-2 py-8">
                <h1 className="text-2xl font-bold tracking-tight">
                    {isPending ? <Skeleton className="h-9 w-48" /> : `Edit "${event?.title}"`}
                </h1>
                {!isPending && (
                    <p className="text-base text-muted-foreground">
                        Update event details. Some fields may be locked depending on the event status.
                    </p>
                )}
            </div>

            <div className="bg-card rounded-xl border shadow-sm p-10">
                {isPending ? (
                    <div className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : event ? (
                    <EventFormContent
                        mode="edit"
                        event={event}
                        onSuccess={() => navigate({ to: '/events' })}
                    />
                ) : (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
                        <p className="text-destructive font-medium">Event not found</p>
                        <button
                            onClick={() => navigate({ to: '/events' })}
                            className="text-sm text-destructive underline mt-2 hover:no-underline"
                        >
                            Go back to events
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
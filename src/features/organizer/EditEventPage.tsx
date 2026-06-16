import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { EventFormContent } from './EventFormContent'
import { useOrganizerEventDetail } from '#/services/organizer/organizQueries'

export function EditEventPage() {
    const navigate = useNavigate()
    const { eventId } = useParams({ from: '/_admin/organizer/events/$eventId/edit' })

    const { data: event, isPending } = useOrganizerEventDetail(Number(eventId))

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                <button
                    onClick={() => navigate({ to: '/organizer/events' })}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to events
                </button>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isPending ? <Skeleton className="h-9 w-48" /> : `Edit "${event?.title}"`}
                    </h1>
                    {!isPending && (
                        <p className="text-base text-muted-foreground">
                            Update event details. Some fields may be locked depending on the event status.
                        </p>
                    )}
                </div>

                {isPending ? (
                    <div className="bg-card rounded-lg border p-8 space-y-6">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : event ? (
                    <div className="bg-card rounded-lg border p-8 shadow-sm">
                        <EventFormContent
                            mode="edit"
                            event={event}
                            onSuccess={() => {
                                navigate({ to: '/organizer/events' })
                            }}
                        />
                    </div>
                ) : (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
                        <p className="text-destructive font-medium">Event not found</p>
                        <button
                            onClick={() => navigate({ to: '/organizer/events' })}
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
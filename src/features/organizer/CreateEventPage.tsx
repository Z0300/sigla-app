import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { EventFormContent } from './EventFormContent'

export function CreateEventPage() {
    const navigate = useNavigate()

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
                    <h1 className="text-3xl font-bold tracking-tight">Create new event</h1>
                    <p className="text-base text-muted-foreground">
                        Set up your event with all the details. You'll be able to add sessions and manage attendees after creation.
                    </p>
                </div>

                <div className="bg-card rounded-lg border p-8 shadow-sm">
                    <EventFormContent
                        mode="create"
                        onSuccess={(eventId) => {
                            navigate({ to: `/organizer/events/${eventId}` })
                        }}
                    />
                </div>

                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 text-sm text-blue-900 dark:text-blue-300">
                    <p className="font-medium">💡 Tip</p>
                    <p className="mt-1">
                        After creating your event, you'll be able to add sessions, manage the event status (draft → published → ongoing), and invite attendees.
                    </p>
                </div>
            </div>
        </div>
    )
}
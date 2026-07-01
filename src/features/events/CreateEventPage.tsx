import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { EventFormContent } from './EventFormContent'

export function CreateEventPage() {
    const navigate = useNavigate()

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
                <h1 className="text-2xl font-bold tracking-tight">Create new event</h1>
                <p className="text-base text-muted-foreground leading-relaxed">
                    Set up your event with all the details. You'll be able to add sessions and manage attendees after creation.
                </p>
            </div>

            <div className="bg-card rounded-xl border shadow-sm p-10">
                <EventFormContent
                    mode="create"
                    onSuccess={(eventId) => {
                        navigate({ to: `/events/${eventId}` })
                    }}
                />
            </div>
        </div>
    )
}
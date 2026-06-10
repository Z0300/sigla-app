import { format } from 'date-fns'
import { MapPin, Calendar, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { EventSummary } from '#/types'
import { useNavigate } from '@tanstack/react-router'

interface Props {
    event: EventSummary
}

export function EventCard({ event }: Props) {
    const navigate = useNavigate()
    const pct = Math.round((event.registeredCount / event.capacity) * 100)
    const isFull = event.registeredCount >= event.capacity
    const isOngoing = event.status === 'ongoing'

    const capColor = isFull
        ? 'bg-destructive'
        : pct >= 80
            ? 'bg-orange-400'
            : 'bg-emerald-500'

    return (
        <div
            className="rounded-xl border bg-card hover:border-foreground/20 transition-colors cursor-pointer flex flex-col overflow-hidden"
            onClick={() => navigate({
                to: '/events/$eventId',
                params: { eventId: event.id.toString() },
            })}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate({
                to: '/events/$eventId',
                params: { eventId: event.id.toString() },
            })}
            aria-label={`View ${event.title}`}
        >
            <div className={`h-1.5 w-full ${isOngoing ? 'bg-violet-400' : 'bg-emerald-400'}`} />
            <div className="p-4 flex flex-col gap-3 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm leading-snug flex-1">{event.title}</h3>
                    <Badge
                        variant="secondary"
                        className={
                            isOngoing
                                ? 'bg-violet-100 text-violet-700 border-violet-200'
                                : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        }
                    >
                        {isOngoing ? 'Ongoing' : 'Open'}
                    </Badge>
                </div>
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>{format(new Date(event.startDate), 'MMM d')}
                            {event.startDate !== event.endDate && ` – ${format(new Date(event.endDate), 'MMM d, yyyy')}`}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                    </div>
                </div>
                <div className="flex-1" />
                <div className="space-y-1.5 pt-2 border-t">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            <span>
                                {isFull
                                    ? 'Full'
                                    : `${event.registeredCount} / ${event.capacity}`}
                            </span>
                        </div>
                        <span className="text-muted-foreground/60">{pct}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${capColor}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
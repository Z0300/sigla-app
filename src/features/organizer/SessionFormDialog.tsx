import { useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CalendarClock } from 'lucide-react'
import type { OrganizerEvent, OrganizerSession, SessionFormValues } from '#/types/event'
import { useCreateSession, useUpdateSession } from '#/services/organizer/organizerMutations'
import { useForm } from '@tanstack/react-form'
import { SessionSchema } from '#/schemas'
import { FormFieldError } from '#/components/form/form-field-error'
import { dateToMax, dateToMin, fmtDate, getEventDays, splitDateTime, toLocalInput } from '#/utils/date'
import { DateTimePicker } from '#/components/form/date-time-picker'

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    eventId: number
    event: OrganizerEvent
    session?: OrganizerSession
}

export function SessionFormDialog({ open, onOpenChange, eventId, event, session }: Props) {
    const isEdit = !!session

    const create = useCreateSession(eventId)
    const update = useUpdateSession(eventId, session?.id ?? 0)
    const mutation = isEdit ? update : create

    const eventDays = getEventDays(event.startDate, event.endDate)

    const form = useForm({
        defaultValues: {
            title: session?.title ?? '',
            room: session?.room ?? '',
            dayIndex: splitDateTime(session?.startTime, eventDays).dayIndex,
            startTimeOnly: splitDateTime(session?.startTime, eventDays).time,
            endTimeOnly: splitDateTime(session?.endTime, eventDays).time,
            capacity: session?.capacity ?? 50,
        },
        validators: {
            onChange: SessionSchema,
        },
        onSubmit: async ({ value }) => {
            const date = eventDays[value.dayIndex].date
            const payload: SessionFormValues = {
                title: value.title,
                room: value.room,
                capacity: Number(value.capacity),
                startTime: `${date}T${value.startTimeOnly}:00`,
                endTime: `${date}T${value.endTimeOnly}:00`,
            }
            await mutation.mutateAsync(payload)
            onOpenChange(false)
        },
    })

    useEffect(() => {
        if (open) {
            if (session) {
                form.setFieldValue('title', session.title)
                form.setFieldValue('room', session.room)
                form.setFieldValue('dayIndex', splitDateTime(session.startTime, eventDays).dayIndex)
                form.setFieldValue('startTimeOnly', splitDateTime(session.startTime, eventDays).time)
                form.setFieldValue('endTimeOnly', splitDateTime(session.endTime, eventDays).time)
                form.setFieldValue('capacity', session.capacity)
            } else {
                form.reset()
            }
        }
    }, [open, session])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit session' : 'Add session'}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update this session's details."
                            : 'Sessions appear in the schedule attendees see on the event page.'}
                    </DialogDescription>
                </DialogHeader>

                {/* Event window banner */}
                <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                    <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                    <span>
                        Sessions must fall within the event window:{' '}
                        <span className="font-medium">
                            {event.startDate.slice(0, 10) === event.endDate.slice(0, 10)
                                ? fmtDate(event.startDate)
                                : `${fmtDate(event.startDate)} – ${fmtDate(event.endDate)}`}
                        </span>
                    </span>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                    className="space-y-4"
                >
                    <form.Field
                        name="title"
                        children={(field) => (
                            <div className="space-y-1.5">
                                <Label htmlFor={field.name}>
                                    Title <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    placeholder="e.g., Keynote speech"
                                />
                                <FormFieldError
                                    touched={field.state.meta.isTouched}
                                    errors={field.state.meta.errors}
                                />
                            </div>
                        )}
                    />

                    {/* Room */}
                    <form.Field
                        name="room"
                        children={(field) => (
                            <div className="space-y-1.5">
                                <Label htmlFor={field.name}>
                                    Room <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id={field.name}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    placeholder="e.g., Hall A"
                                />
                                <FormFieldError
                                    touched={field.state.meta.isTouched}
                                    errors={field.state.meta.errors}
                                />
                            </div>
                        )}
                    />

                    {/* Day selector */}
                    <form.Field
                        name="dayIndex"
                        children={(field) => (
                            <div className="space-y-1.5">
                                <Label>Day <span className="text-destructive">*</span></Label>
                                <select
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(Number(e.target.value))}
                                    onBlur={field.handleBlur}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                >
                                    {eventDays.map((day, i) => (
                                        <option key={day.date} value={i}>{day.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    />

                    {/* Start / end time */}
                    <div className="grid grid-cols-2 gap-3">
                        <form.Field
                            name="startTimeOnly"
                            children={(field) => (
                                <div className="space-y-1.5">
                                    <Label>Start time <span className="text-destructive">*</span></Label>
                                    <Input
                                        type="time"
                                        value={field.state.value}
                                        onChange={(e) => {
                                            field.handleChange(e.target.value)
                                            // nudge end time if needed
                                            const end = form.getFieldValue('endTimeOnly')
                                            if (end && e.target.value && end <= e.target.value) {
                                                const [h, m] = e.target.value.split(':').map(Number)
                                                const nudged = h < 23 ? `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}` : '23:59'
                                                form.setFieldValue('endTimeOnly', nudged)
                                            }
                                        }}
                                        onBlur={field.handleBlur}
                                    />
                                    <FormFieldError touched={field.state.meta.isTouched} errors={field.state.meta.errors} />
                                </div>
                            )}
                        />

                        <form.Field
                            name="endTimeOnly"
                            children={(field) => (
                                <div className="space-y-1.5">
                                    <Label>End time <span className="text-destructive">*</span></Label>
                                    <Input
                                        type="time"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                    />
                                    <FormFieldError touched={field.state.meta.isTouched} errors={field.state.meta.errors} />
                                </div>
                            )}
                        />
                    </div>

                    {/* Duration hint */}
                    <form.Subscribe
                        selector={(s) => [s.values.startTimeOnly, s.values.endTimeOnly]}
                        children={([start, end]) => {
                            if (!start || !end || end <= start) return null
                            const [sh, sm] = start.split(':').map(Number)
                            const [eh, em] = end.split(':').map(Number)
                            const mins = (eh * 60 + em) - (sh * 60 + sm)
                            const h = Math.floor(mins / 60)
                            const m = mins % 60
                            const label = [h && `${h}h`, m && `${m}m`].filter(Boolean).join(' ')
                            return (
                                <p className="text-xs text-muted-foreground">
                                    Duration: <span className="font-medium text-foreground">{label}</span>
                                </p>
                            )
                        }}
                    />

                    {/* Capacity */}
                    <form.Field
                        name="capacity"
                        children={(field) => (
                            <div className="space-y-1.5">
                                <Label htmlFor={field.name}>
                                    Capacity <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id={field.name}
                                    type="number"
                                    value={field.state.value}
                                    min={1}
                                    onChange={(e) => field.handleChange(Number(e.target.value))}
                                    onBlur={field.handleBlur}
                                    placeholder="e.g., 100"
                                />
                                <FormFieldError
                                    touched={field.state.meta.isTouched}
                                    errors={field.state.meta.errors}
                                />
                            </div>
                        )}
                    />

                    {/* Error */}
                    {mutation.isError && (
                        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                            {(mutation.error as any)?.response?.data?.message ??
                                'Failed to save session. Try again.'}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={mutation.isPending || !form.state.isFormValid}
                        >
                            {mutation.isPending
                                ? 'Saving...'
                                : isEdit
                                    ? 'Save changes'
                                    : 'Add session'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
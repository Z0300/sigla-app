import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { OrganizerEvent } from '#/types/event'
import { useCreateEvent, useUpdateEvent } from '#/services/organizer/organizerMutations'
import { useForm } from '@tanstack/react-form'
import { EventSchema } from '#/schemas'
import { FormFieldError } from '#/components/form/form-field-error'
import { DateTimePicker } from '#/components/form/date-picker'
import { ValidationError } from '#/components/form/validation-error'
import type { ErrorResponse } from '#/types'
import type { AxiosError } from 'axios'

interface Props {
    mode: 'create' | 'edit'
    event?: OrganizerEvent
    onSuccess?: (eventId: number) => void
}

function toLocalInput(iso: string) {
    return iso?.slice(0, 16) ?? ''
}

export function EventFormContent({ mode, event, onSuccess }: Props) {
    const isEdit = mode === 'edit'

    const create = useCreateEvent()
    const update = useUpdateEvent(event?.id ?? 0)
    const mutation = isEdit ? update : create

    const form = useForm({
        defaultValues: {
            id: event?.id ?? 0,
            title: event?.title ?? '',
            description: event?.description ?? '',
            venue: event?.venue ?? '',
            startDate: toLocalInput(event?.startDate ?? ''),
            endDate: toLocalInput(event?.endDate ?? ''),
            capacity: event?.capacity ?? 50,
        },
        validators: {
            onChange: EventSchema,
        },
        onSubmit: async ({ value }) => {
            const res = await mutation.mutateAsync(value)
            if (onSuccess) {
                onSuccess(res?.id || value.id)
            }
        },
    })

    const locked = isEdit && !['draft', 'published'].includes(event!.status)
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }}
            className="space-y-6"
        >
            {mutation.isError && (
                <ValidationError title={`Failed to ${mode} event.`}
                    description={(() => {
                        const data = (mutation.error as AxiosError<ErrorResponse>)?.response?.data
                        if (!data) return 'An error occurred. Please try again.'

                        const details = data.details as Record<string, string>
                        if (details && Object.keys(details).length > 0) {
                            return Object.values(details).join(', ')
                        }
                        return data.message ?? 'An error occurred. Please try again.'
                    })()} />
            )}

            <form.Field
                name="title"
                children={(field) => (
                    <div className="space-y-2">
                        <Label htmlFor={field.name}>
                            Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id={field.name}
                            value={field.state.value}
                            disabled={locked}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            placeholder="e.g., Tech Summit 2026"
                            className="text-base"
                        />
                        <FormFieldError
                            touched={field.state.meta.isTouched}
                            errors={field.state.meta.errors}
                        />
                    </div>
                )}
            />


            <form.Field
                name="description"
                children={(field) => (
                    <div className="space-y-2">
                        <Label htmlFor={field.name}>Description</Label>
                        <Textarea
                            id={field.name}
                            value={field.state.value}
                            disabled={locked}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            placeholder="What's this event about? Share key details..."
                            rows={4}
                            className="resize-none"
                        />
                        <FormFieldError
                            touched={field.state.meta.isTouched}
                            errors={field.state.meta.errors}
                        />
                    </div>
                )}
            />


            <form.Field
                name="venue"
                children={(field) => (
                    <div className="space-y-2">
                        <Label htmlFor={field.name}>
                            Venue <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id={field.name}
                            value={field.state.value}
                            disabled={locked}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            placeholder="e.g., Convention Center, Hall A"
                        />
                        <FormFieldError
                            touched={field.state.meta.isTouched}
                            errors={field.state.meta.errors}
                        />
                    </div>
                )}
            />


            <div className="grid grid-cols-2 gap-4">
                <form.Field
                    name="startDate"
                    children={(field) => (
                        <div className="space-y-2">
                            <Label htmlFor={field.name}>
                                Start date <span className="text-destructive">*</span>
                            </Label>
                            <DateTimePicker
                                value={field.state.value}
                                disabled={locked}
                                onChange={field.handleChange}
                                onBlur={field.handleBlur}
                            />
                            <FormFieldError
                                touched={field.state.meta.isTouched}
                                errors={field.state.meta.errors}
                            />
                        </div>
                    )}
                />

                <form.Field
                    name="endDate"
                    children={(field) => (
                        <div className="space-y-2">
                            <Label htmlFor={field.name}>
                                End date <span className="text-destructive">*</span>
                            </Label>
                            <DateTimePicker
                                value={field.state.value}
                                disabled={locked}
                                onChange={field.handleChange}
                                onBlur={field.handleBlur}
                            />
                            <FormFieldError
                                touched={field.state.meta.isTouched}
                                errors={field.state.meta.errors}
                            />
                        </div>
                    )}
                />
            </div>


            <form.Field
                name="capacity"
                children={(field) => (
                    <div className="space-y-2">
                        <Label htmlFor={field.name}>
                            Capacity <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id={field.name}
                            type="number"
                            value={field.state.value}
                            min={1}
                            disabled={locked}
                            onChange={(e) => field.handleChange(Number(e.target.value))}
                            onBlur={field.handleBlur}
                            placeholder="e.g., 150"
                        />
                        <FormFieldError
                            touched={field.state.meta.isTouched}
                            errors={field.state.meta.errors}
                        />
                    </div>
                )}
            />

            {locked && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-800 dark:text-amber-300">
                    <p className="font-medium">This event is "{event!.status}"</p>
                    <p className="mt-1">Most fields are locked. You can only edit events in draft or published status.</p>
                </div>
            )}

            {!locked && (
                <div className="flex gap-3 pt-4 border-t">
                    <Button
                        type="submit"
                        size="lg"
                        disabled={mutation.isPending || !form.state.isFormValid}
                        className="flex-1"
                    >
                        {mutation.isPending
                            ? 'Saving...'
                            : isEdit
                                ? 'Save changes'
                                : 'Create event'}
                    </Button>
                </div>
            )}
        </form>
    )
}
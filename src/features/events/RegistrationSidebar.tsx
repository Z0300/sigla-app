import { useState } from 'react'
import { CheckCircle2, Ticket, AlertTriangle, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

import { QrCodeDisplay } from './QrCodeDisplay'
import type { AttendeeSimple, EventDetail } from '#/types'
import { useCancelRegistration, useRegister } from '#/services/events/eventMutations'
import { safeFormat } from '#/utils/date'

interface Props {
    event: EventDetail
    myRegistration: AttendeeSimple | null
    loadingReg: boolean
}

export function RegistrationSidebar({ event, myRegistration, loadingReg }: Props) {
    const isFull = event.capacity != null && (event.registeredCount ?? 0) >= event.capacity

    const isActiveRegistration = myRegistration && myRegistration.status !== 'cancelled'

    return (
        <div className="rounded-xl border bg-card p-5 space-y-4 sticky top-6">
            <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Registration</p>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                        {isFull ? 'Event full' : 'Free admission'}
                    </span>
                    <span>
                        Deadline: {safeFormat(event.endDate, 'MMM d, yyyy')}
                    </span>
                </div>
            </div>

            <Separator />

            {loadingReg ? (
                <div className="space-y-3">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-4 w-2/3 mx-auto" />
                </div>
            ) : isActiveRegistration ? (
                <RegisteredState event={event} registration={myRegistration} />
            ) : isFull ? (
                <FullState event={event} />
            ) : (
                <UnregisteredState event={event} />
            )}

            <Separator />


            <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                    <span>Starts</span>
                    <span className="text-foreground font-medium">
                        {safeFormat(event.startDate, 'MMM d, yyyy')}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span>Ends</span>
                    <span className="text-foreground font-medium">
                        {safeFormat(event.endDate, 'MMM d, yyyy')}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span>Sessions</span>
                    <span className="text-foreground font-medium">{event.sessions?.length}</span>
                </div>
            </div>
        </div>
    )
}


function UnregisteredState({ event }: { event: EventDetail }) {
    const { mutate: register, isPending, isError, error } = useRegister(event.id)

    return (
        <div className="space-y-3">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button className="w-full" disabled={isPending}>
                        {isPending ? 'Registering...' : 'Register now'}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm registration</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <p>
                                    You're about to register for <strong>{event.title}</strong> on{' '}
                                    {safeFormat(event.startDate, 'MMM d')}–
                                    {safeFormat(event.endDate, 'MMM d, yyyy')} at {event.venue}.
                                </p>
                                <div className="rounded-lg bg-muted p-3 text-sm">
                                    A QR ticket will be generated and sent to your email address.
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => register()}>
                            Confirm registration
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {isError && (
                <p className="text-xs text-destructive text-center">
                    {(error as any)?.response?.data?.message ?? 'Registration failed. Try again.'}
                </p>
            )}

            <p className="text-xs text-muted-foreground text-center">
                {event.capacity - event.registeredCount} spot{event.capacity - event.registeredCount !== 1 ? 's' : ''} remaining
            </p>
        </div>
    )
}


function RegisteredState({
    event,
    registration,
}: {
    event: EventDetail
    registration: AttendeeSimple
}) {
    const { mutate: cancel, isPending } = useCancelRegistration(event.id)
    const [showTicket, setShowTicket] = useState(false)


    return (
        <div className="space-y-3">

            <div className="flex items-start gap-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">You're registered</p>
                    <p className="text-xs text-emerald-700/70 dark:text-emerald-500 mt-0.5">
                        Registered on {safeFormat(registration.registeredAt, 'MMM d, yyyy')}
                    </p>
                </div>
            </div>


            <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setShowTicket((v) => !v)}
            >
                <Ticket className="h-4 w-4" />
                {showTicket ? 'Hide ticket' : 'View my ticket'}
            </Button>

            {showTicket && registration.qrToken && (
                <QrCodeDisplay registration={registration} event={event} />
            )}

            <Separator />


            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                        Cancel registration
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Cancel registration?
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <p>
                                    Are you sure you want to cancel your registration for{' '}
                                    <strong>{event.title}</strong>?
                                </p>
                                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                                    Your QR ticket will be permanently invalidated and you'll lose your spot.
                                    This cannot be undone.
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep my registration</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => cancel(registration.id)}
                            disabled={isPending}
                        >
                            {isPending ? 'Cancelling...' : 'Yes, cancel'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}


function FullState({ event }: { event: EventDetail }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground">
                    This event has reached full capacity.
                </p>
            </div>
            <Button className="w-full" disabled>
                Registration closed
            </Button>
        </div>
    )
}
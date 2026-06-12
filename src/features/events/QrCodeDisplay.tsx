import { useEffect, useRef } from 'react'
import { format } from 'date-fns'
import type { AttendeeSimple, EventDetail } from '#/types'
import QRCode from 'qrcode'

interface Props {
    registration: AttendeeSimple
    event: EventDetail
}

export function QrCodeDisplay({ registration, event }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!canvasRef.current || !registration.qrToken) return
        QRCode.toCanvas(canvasRef.current, registration.qrToken, {
            width: 160,
            margin: 1,
            color: {
                dark: '#09090b',
                light: '#ffffff',
            },
        })
    }, [registration.qrToken])

    return (
        <div className="rounded-lg border overflow-hidden">

            <div className="bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 border-b">
                <p className="font-medium text-sm text-emerald-900 dark:text-emerald-300">
                    {event.title}
                </p>
                <p className="text-xs text-emerald-700/70 dark:text-emerald-500 mt-0.5">
                    {format(new Date(event.startDate), 'MMM d')} – {format(new Date(event.endDate), 'MMM d, yyyy')} · {event.venue}
                </p>
            </div>

            <div className="p-4 flex flex-col items-center gap-3">
                <canvas ref={canvasRef} className="rounded-md" />
                <p className="text-xs text-muted-foreground text-center">
                    Show this QR code to staff at the entrance
                </p>
            </div>


            <div className="border-t border-dashed px-4 py-3 flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium">{registration.userFullName}</p>
                    <p className="text-xs text-muted-foreground">{registration.userEmail}</p>
                </div>
                <p className="text-xs font-mono text-muted-foreground">
                    ATT-{String(registration.id).padStart(5, '0')}
                </p>
            </div>
        </div>
    )
}
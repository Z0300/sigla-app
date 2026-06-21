import { Skeleton } from '@/components/ui/skeleton'
import {
    CalendarCheck2, Users, ScanLine, TrendingUp,
    BarChart3, CheckCircle2, XCircle, Clock, UserX
} from 'lucide-react'
import { safeFormat } from '#/utils/date'
import { useOrganizerStats } from '#/services/organizer/organizQueries';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    registered: { label: 'Registered', color: 'bg-violet-500', icon: <Users className="h-3 w-3" /> },
    checked_in: { label: 'Checked in', color: 'bg-emerald-500', icon: <CheckCircle2 className="h-3 w-3" /> },
    cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: <XCircle className="h-3 w-3" /> },
    no_show: { label: 'No show', color: 'bg-zinc-400', icon: <UserX className="h-3 w-3" /> },
}

export function OrganizerDashboard() {
    const { data: stats, isPending } = useOrganizerStats()
    return (
        <div className="mx-auto py-8 space-y-8">
            <div>
                <p className="text-sm text-muted-foreground mt-1">Overview of all your events</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total events"
                    value={stats?.totalEvents}
                    sub={`${stats?.activeEvents ?? 0} active`}
                    icon={<CalendarCheck2 className="h-4 w-4" />}
                    isPending={isPending}
                />
                <StatCard
                    label="Registrations"
                    value={stats?.totalRegistrations}
                    icon={<Users className="h-4 w-4" />}
                    isPending={isPending}
                />
                <StatCard
                    label="Check-ins"
                    value={stats?.totalCheckIns}
                    icon={<ScanLine className="h-4 w-4" />}
                    isPending={isPending}
                />
                <StatCard
                    label="Check-in rate"
                    value={stats ? `${stats.checkInRate}%` : undefined}
                    icon={<TrendingUp className="h-4 w-4" />}
                    isPending={isPending}
                    highlight={
                        stats
                            ? stats.checkInRate >= 75
                                ? 'good'
                                : stats.checkInRate >= 40
                                    ? 'mid'
                                    : 'low'
                            : undefined
                    }
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendee status breakdown */}
                <section className="rounded-lg border p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-sm font-medium">Attendee breakdown</h2>
                    </div>

                    {isPending ? (
                        <div className="space-y-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-7 w-full" />
                            ))}
                        </div>
                    ) : !stats || Object.keys(stats.attendeeStatusCounts).length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No attendee data yet</p>
                    ) : (
                        <StatusBreakdown counts={stats.attendeeStatusCounts} total={stats.totalRegistrations} />
                    )}
                </section>

                {/* Top sessions */}
                <section className="rounded-lg border p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-sm font-medium">Top sessions by check-ins</h2>
                    </div>

                    {isPending ? (
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full" />
                            ))}
                        </div>
                    ) : !stats?.topSessions?.length ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No check-ins recorded yet</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.topSessions.map((s, i) => {
                                const pct = s.capacity > 0
                                    ? Math.round((s.checkInCount / s.capacity) * 100)
                                    : 0
                                return (
                                    <div key={i} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="min-w-0">
                                                <p className="font-medium truncate">{s.sessionTitle}</p>
                                                <p className="text-xs text-muted-foreground truncate">{s.eventTitle}</p>
                                            </div>
                                            <span className="text-xs text-muted-foreground shrink-0 ml-2">
                                                {s.checkInCount} / {s.capacity}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-emerald-500 transition-all"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </section>
            </div>

            {/* Registration trend */}
            <section className="rounded-lg border p-5 space-y-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-medium">Registration trend</h2>
                </div>

                {isPending ? (
                    <Skeleton className="h-32 w-full" />
                ) : !stats?.registrationTrend?.length ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No registration data yet</p>
                ) : (
                    <TrendChart data={stats.registrationTrend} />
                )}
            </section>
        </div>
    )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
    label, value, sub, icon, isPending, highlight,
}: {
    label: string
    value?: number | string
    sub?: string
    icon: React.ReactNode
    isPending: boolean
    highlight?: 'good' | 'mid' | 'low'
}) {
    const highlightColor = {
        good: 'text-emerald-600',
        mid: 'text-amber-500',
        low: 'text-red-500',
    }

    return (
        <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">{label}</span>
                {icon}
            </div>
            {isPending ? (
                <Skeleton className="h-8 w-24" />
            ) : (
                <p className={[
                    'text-2xl font-semibold tracking-tight',
                    highlight ? highlightColor[highlight] : '',
                ].join(' ')}>
                    {value ?? '—'}
                </p>
            )}
            {sub && !isPending && (
                <p className="text-xs text-muted-foreground">{sub}</p>
            )}
        </div>
    )
}

function StatusBreakdown({
    counts, total,
}: {
    counts: Record<string, number>
    total: number
}) {
    return (
        <div className="space-y-2.5">
            {Object.entries(counts).map(([status, count]) => {
                const cfg = STATUS_CONFIG[status]
                const pct = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                    <div key={status} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                {cfg?.icon}
                                <span>{cfg?.label ?? status}</span>
                            </div>
                            <span className="font-medium text-foreground">
                                {count} <span className="text-muted-foreground font-normal">({pct}%)</span>
                            </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${cfg?.color ?? 'bg-primary'}`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function TrendChart({ data }: { data: { date: string; count: number }[] }) {
    const max = Math.max(...data.map(d => d.count), 1)
    const last7 = data.slice(-14) // show last 14 days max

    return (
        <div className="space-y-2">
            <div className="flex items-end gap-1 h-24">
                {last7.map((d) => {
                    const pct = Math.round((d.count / max) * 100)
                    return (
                        <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {d.count} reg
                            </div>
                            <div className="w-full rounded-t-sm bg-violet-500 transition-all"
                                style={{ height: `${pct}%`, minHeight: d.count > 0 ? '4px' : '0' }}
                            />
                        </div>
                    )
                })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground px-0.5">
                <span>{safeFormat(last7[0]?.date, 'MMM d')}</span>
                <span>{safeFormat(last7[last7.length - 1]?.date, 'MMM d')}</span>
            </div>
        </div>
    )
}
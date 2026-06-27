
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { safeFormat } from '#/utils/date'
import {
    CalendarCheck2, Users, ScanLine, TrendingUp,
    BarChart3, Clock, Plus, Filter
} from 'lucide-react'
import { useOrganizerEvents, useOrganizerStats } from '#/services/organizer/organizQueries'

const STATUS_STYLES: Record<string, string> = {
    draft: 'bg-zinc-100 text-zinc-600',
    published: 'bg-blue-100 text-blue-700',
    ongoing: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-violet-100 text-violet-700',
    cancelled: 'bg-red-100 text-red-700',
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    registered: { label: 'Registered', color: 'bg-blue-500' },
    checked_in: { label: 'Checked in', color: 'bg-emerald-500' },
    cancelled: { label: 'Cancelled', color: 'bg-red-500' },
    no_show: { label: 'No show', color: 'bg-zinc-400' },
}

export function DashboardPage() {
    const { data: stats, isPending } = useOrganizerStats()
    const { data: eventsData, isPending: eventsPending } = useOrganizerEvents()
    const recentEvents = eventsData?.data?.slice(0, 5) ?? []

    return (
        <div className="w-full px-6 py-8 space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Overview of all your events</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                    </Button>
                    <Button size="sm" className="gap-2" asChild>
                        <Link to="/events/new">
                            <Plus className="h-4 w-4" />
                            Create Event
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total events"
                    value={stats?.totalEvents}
                    sub={`${stats?.activeEvents ?? 0} active this month`}
                    icon={<CalendarCheck2 className="h-4 w-4" />}
                    isPending={isPending}
                />
                <StatCard
                    label="Total Registrations"
                    value={stats?.totalRegistrations?.toLocaleString()}
                    sub={stats?.totalEvents ? `Average ${Math.round((stats.totalRegistrations ?? 0) / stats.totalEvents)} per event` : undefined}
                    icon={<Users className="h-4 w-4" />}
                    isPending={isPending}
                />
                <StatCard
                    label="Check-in rate"
                    value={stats ? `${stats.checkInRate}%` : undefined}
                    sub="Target is 90%"
                    icon={<ScanLine className="h-4 w-4" />}
                    isPending={isPending}
                    highlight={
                        stats
                            ? stats.checkInRate >= 75 ? 'good'
                                : stats.checkInRate >= 40 ? 'mid'
                                    : 'low'
                            : undefined
                    }
                />
                <StatCard
                    label="Active Revenue"
                    value="—"
                    sub="Net from ticket sales"
                    icon={<TrendingUp className="h-4 w-4" />}
                    isPending={isPending}
                />
            </div>

            {/* Middle row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Registration trend — takes 2/3 */}
                <section className="lg:col-span-2 rounded-xl border bg-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <h2 className="text-sm font-semibold">Registration trend</h2>
                        </div>
                        <span className="text-xs text-muted-foreground border rounded-md px-2 py-1">
                            Last 6 months
                        </span>
                    </div>

                    {isPending ? (
                        <Skeleton className="h-40 w-full" />
                    ) : !stats?.registrationTrend?.length ? (
                        <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
                            No registration data yet
                        </div>
                    ) : (
                        <TrendChart data={stats.registrationTrend} />
                    )}
                </section>

                {/* Right column */}
                <div className="space-y-4">

                    {/* Attendee breakdown */}
                    <section className="rounded-xl border bg-card p-5 space-y-3">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            <h2 className="text-sm font-semibold">Attendee breakdown</h2>
                        </div>

                        {isPending ? (
                            <div className="space-y-2">
                                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
                            </div>
                        ) : !stats || Object.keys(stats.attendeeStatusCounts).length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-3">No data yet</p>
                        ) : (
                            <StatusBreakdown
                                counts={stats.attendeeStatusCounts}
                                total={stats.totalRegistrations}
                            />
                        )}
                    </section>

                    {/* Top sessions */}
                    <section className="rounded-xl border bg-card p-5 space-y-3">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <h2 className="text-sm font-semibold">Top sessions by check-ins</h2>
                        </div>

                        {isPending ? (
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                            </div>
                        ) : !stats?.topSessions?.length ? (
                            <p className="text-sm text-muted-foreground text-center py-3">No check-ins recorded yet</p>
                        ) : (
                            <div className="space-y-3">
                                {stats.topSessions.slice(0, 3).map((s, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <span className="text-xs font-mono text-muted-foreground w-5 shrink-0 mt-0.5">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{s.sessionTitle}</p>
                                            <p className="text-xs text-muted-foreground">{s.checkInCount} check-ins</p>
                                        </div>
                                    </div>
                                ))}
                                <Link
                                    to="/events"
                                    className="text-xs text-primary hover:underline block pt-1"
                                >
                                    View all sessions →
                                </Link>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* Recent events table */}
            <section className="rounded-xl border bg-card">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-sm font-semibold">Recent Event Updates</h2>
                    <Link to="/events" className="text-xs text-muted-foreground hover:text-foreground">
                        See all history →
                    </Link>
                </div>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Event name</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Status</th>
                            <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Attendees</th>
                        </tr>
                    </thead>
                    <tbody>
                        {eventsPending ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i} className="border-b">
                                    <td className="px-6 py-3"><Skeleton className="h-4 w-40" /></td>
                                    <td className="px-6 py-3 hidden sm:table-cell"><Skeleton className="h-4 w-24" /></td>
                                    <td className="px-6 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                                    <td className="px-6 py-3 hidden md:table-cell"><Skeleton className="h-4 w-12 ml-auto" /></td>
                                </tr>
                            ))
                        ) : recentEvents.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-sm text-muted-foreground">
                                    No events yet.{' '}
                                    <Link to="/events/new" className="text-primary hover:underline">
                                        Create your first event
                                    </Link>
                                </td>
                            </tr>
                        ) : (
                            recentEvents.map((event) => (
                                <tr key={event.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-3.5 font-medium">
                                        <Link
                                            to="/events/$eventId"
                                            params={{ eventId: String(event.id) }}
                                            className="hover:text-primary transition-colors"
                                        >
                                            {event.title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-3.5 text-muted-foreground hidden sm:table-cell">
                                        {safeFormat(event.startDate, 'MMM dd, yyyy')}
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <Badge
                                            variant="secondary"
                                            className={STATUS_STYLES[event.status] ?? ''}
                                        >
                                            {event.status.toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-3.5 text-right text-muted-foreground hidden md:table-cell">
                                        {event.registeredCount.toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </section>
        </div>
    )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

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
        <div className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">{label}</span>
                {icon}
            </div>
            {isPending ? (
                <Skeleton className="h-9 w-28" />
            ) : (
                <p className={[
                    'text-3xl font-semibold tracking-tight',
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
        <div className="space-y-3">
            {Object.entries(counts).map(([status, count]) => {
                const cfg = STATUS_CONFIG[status]
                const pct = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                    <div key={status} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{cfg?.label ?? status}</span>
                            <span className="font-medium">
                                {count.toLocaleString()}{' '}
                                <span className="text-muted-foreground font-normal">({pct}%)</span>
                            </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                                className={`h-full rounded-full ${cfg?.color ?? 'bg-primary'}`}
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

    // group by month label
    const byMonth = data.reduce<Record<string, number>>((acc, d) => {
        const label = new Date(d.date).toLocaleDateString('en-US', { month: 'short' })
        acc[label] = (acc[label] ?? 0) + d.count
        return acc
    }, {})

    const months = Object.entries(byMonth).slice(-6)
    const monthMax = Math.max(...months.map(([, v]) => v), 1)

    return (
        <div className="space-y-2">
            <div className="flex items-end gap-2 h-36 px-1">
                {months.map(([month, count]) => {
                    const pct = Math.round((count / monthMax) * 100)
                    return (
                        <div key={month} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                {count.toLocaleString()} registrations
                            </div>
                            <div
                                className="w-full rounded-t-sm bg-violet-500 transition-all"
                                style={{ height: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                            />
                        </div>
                    )
                })}
            </div>
            <div className="flex justify-between px-1">
                {months.map(([month]) => (
                    <span key={month} className="flex-1 text-center text-xs text-muted-foreground">
                        {month}
                    </span>
                ))}
            </div>
        </div>
    )
}
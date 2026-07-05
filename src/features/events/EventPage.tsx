import { useMemo, useState } from "react";

import { EventStatus, type OrganizerEventFilters } from "#/types/event";
import { Input } from "#/components/ui/input";
import { useOrganizerEvents } from "#/services/organizer/organizQueries";
import { Can } from "#/components/rbac/can";
import { Permissions } from "#/constants/permissions";
import { PlusIcon, Search, SlidersHorizontal } from "lucide-react";
import { EventTable } from "./EventTable";
import { createEventColumns } from "./EventColumn";
import { useUpdateEventStatus } from "#/services/organizer/organizerMutations";
import { Button } from "#/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Tabs, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "#/components/ui/popover";
import { Checkbox } from "#/components/ui/checkbox";

const TABS: { label: string; value: EventStatus | "All" }[] = [
    { label: "All", value: "All" },
    { label: "Active", value: EventStatus.ongoing },
    { label: "Draft", value: EventStatus.draft },
    { label: "Past", value: EventStatus.completed },
    { label: "Cancelled", value: EventStatus.cancelled },
]

const DATE_PRESETS = [
    { label: "All Time", value: "all" },
    { label: "This Month", value: "month" },
    { label: "Next 3 Months", value: "next3" },
    { label: "Custom Range", value: "custom" },
] as const;

function toISODate(d: Date) {
    return d.toISOString().slice(0, 10);
}

function resolveDateRange(
    preset: string,
    customStart: string,
    customEnd: string
): { startDate?: string; endDate?: string } {
    const now = new Date();
    switch (preset) {
        case "month": {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            return { startDate: toISODate(start), endDate: toISODate(end) };
        }
        case "next3": {
            const end = new Date(now.getFullYear(), now.getMonth() + 3, 0);
            return { startDate: toISODate(now), endDate: toISODate(end) };
        }
        case "custom":
            return {
                startDate: customStart || undefined,
                endDate: customEnd || undefined,
            };
        default:
            return {};
    }
}

export function EventsPage() {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<EventStatus | "All">("All");

    // APPLIED filters (drive the query)
    const [appliedDatePreset, setAppliedDatePreset] = useState("all");
    const [appliedStartDate, setAppliedStartDate] = useState("");
    const [appliedEndDate, setAppliedEndDate] = useState("");


    // DRAFT filters (live inside the popover only)
    const [draftPreset, setDraftPreset] = useState(appliedDatePreset);
    const [draftStart, setDraftStart] = useState(appliedStartDate);
    const [draftEnd, setDraftEnd] = useState(appliedEndDate);

    const updateStatus = useUpdateEventStatus();

    const { startDate, endDate } = resolveDateRange(
        appliedDatePreset,
        appliedStartDate,
        appliedEndDate
    );

    const filters: OrganizerEventFilters = {
        ...(search ? { search } : {}),
        ...(search ? { searchTerm: search } : {}),
        ...(status !== "All" ? { status } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        page,
        size: pageSize
    };

    const { data, isLoading } = useOrganizerEvents(filters);

    const [filterOpen, setFilterOpen] = useState(false)

    const columns = useMemo(
        () =>
            createEventColumns({
                toEditPage: "/events/$eventId/edit",
                onStatusChange: (eventId, status) => {
                    updateStatus.mutate({ eventId, status });
                },
            }),
        [],
    );

    const handlePageChange = (newPage: number, newSize?: number) => {
        setPage(newPage);
        if (newSize) setPageSize(newSize);
    };

    const openFilters = (open: boolean) => {
        if (open) {
            // seed draft from currently applied values when opening
            setDraftPreset(appliedDatePreset);
            setDraftStart(appliedStartDate);
            setDraftEnd(appliedEndDate);
        }
        setFilterOpen(open);
    };

    const applyFilters = () => {
        setAppliedDatePreset(draftPreset);
        setAppliedStartDate(draftStart);
        setAppliedEndDate(draftEnd);
        setPage(0);
        setFilterOpen(false);
    };

    const clearFilters = () => {
        setDraftPreset("all");
        setDraftStart("");
        setDraftEnd("");
    };

    const customRangeInvalid =
        draftPreset === "custom" &&
        draftStart &&
        draftEnd &&
        draftStart > draftEnd;

    return (
        <div className="space-y-4 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Events</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage and track your events</p>
                </div>
                <Can permission={Permissions.EVENTS_CREATE}>
                    <Button asChild>
                        <Link to="/events/new">
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Create Event
                        </Link>
                    </Button>
                </Can>
            </div>


            <Tabs value={status} onValueChange={(v) => { setStatus(v as EventStatus | "All"); setPage(0); }}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <TabsList>
                        {TABS.map((tab) => (
                            <TabsTrigger key={tab.value} value={tab.value}>
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Search + Filters */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            <Input
                                placeholder="Quick find..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                                className="pl-8 h-8 w-48 text-sm"
                            />
                        </div>


                        <Popover open={filterOpen} onOpenChange={openFilters}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-2">
                                    <SlidersHorizontal className="h-3.5 w-3.5" />
                                    Filters
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-72 p-4 space-y-4">
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Date Range
                                    </p>
                                    {DATE_PRESETS.map((opt) => (
                                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                                            <Checkbox
                                                checked={draftPreset === opt.value}
                                                onCheckedChange={() => setDraftPreset(opt.value)}
                                            />
                                            <span className="text-sm">{opt.label}</span>
                                        </label>
                                    ))}

                                    {draftPreset === "custom" && (
                                        <div className="grid grid-cols-2 gap-2 pt-2">
                                            <div className="space-y-1">
                                                <p className="text-[11px] text-muted-foreground">From</p>
                                                <Input
                                                    type="date"
                                                    value={draftStart}
                                                    max={draftEnd || undefined}
                                                    onChange={(e) => setDraftStart(e.target.value)}
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[11px] text-muted-foreground">To</p>
                                                <Input
                                                    type="date"
                                                    value={draftEnd}
                                                    min={draftStart || undefined}
                                                    onChange={(e) => setDraftEnd(e.target.value)}
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                            {customRangeInvalid && (
                                                <p className="col-span-2 text-xs text-destructive">
                                                    Start date must be before end date.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t">
                                    <button
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={clearFilters}
                                    >
                                        Clear All
                                    </button>
                                    <Button
                                        size="sm"
                                        onClick={applyFilters}
                                        disabled={!!customRangeInvalid}
                                    >
                                        Apply Filters
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </Tabs>

            <EventTable
                data={data}
                columns={columns}
                isLoading={isLoading}
                page={page}
                pageSize={pageSize}
                onPageChange={handlePageChange}
            />

        </div>
    );
}
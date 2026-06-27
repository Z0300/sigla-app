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
export function EventsPage() {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<EventStatus | "All">("All");

    const updateStatus = useUpdateEventStatus();

    const filters: OrganizerEventFilters = {
        ...(search ? { search } : {}),
        ...(search ? { searchTerm: search } : {}),
        ...(status !== "All" ? { status } : {}),
        page,
        size: pageSize
    };

    const { data, isLoading } = useOrganizerEvents(filters);

    const [filterOpen, setFilterOpen] = useState(false)
    const [dateRange, setDateRange] = useState("all")
    const [locations, setLocations] = useState<string[]>([])
    const [categories, setCategories] = useState<string[]>([])

    function toggleArray(arr: string[], val: string) {
        return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
    }


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


                        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-2">
                                    <SlidersHorizontal className="h-3.5 w-3.5" />
                                    Filters
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-72 p-4 space-y-4">

                                {/* Date Range */}
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Date Range
                                    </p>
                                    {[
                                        { label: "All Time", value: "all" },
                                        { label: "This Month", value: "month" },
                                        { label: "Next 3 Months", value: "next3" },
                                    ].map((opt) => (
                                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                                            <Checkbox
                                                checked={dateRange === opt.value}
                                                onCheckedChange={() => setDateRange(opt.value)}
                                            />
                                            <span className="text-sm">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>

                                {/* Location */}
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Location
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {["Online", "San Francisco", "Austin", "NYC"].map((loc) => (
                                            <label key={loc} className="flex items-center gap-2 cursor-pointer">
                                                <Checkbox
                                                    checked={locations.includes(loc)}
                                                    onCheckedChange={() => setLocations(toggleArray(locations, loc))}
                                                />
                                                <span className="text-sm">{loc}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Event Category */}
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Event Category
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {["Conference", "Workshop", "Networking", "Product"].map((cat) => (
                                            <label key={cat} className="flex items-center gap-2 cursor-pointer">
                                                <Checkbox
                                                    checked={categories.includes(cat)}
                                                    onCheckedChange={() => setCategories(toggleArray(categories, cat))}
                                                />
                                                <span className="text-sm">{cat}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-2 border-t">
                                    <button
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={() => {
                                            setDateRange("all")
                                            setLocations([])
                                            setCategories([])
                                        }}
                                    >
                                        Clear All
                                    </button>
                                    <Button size="sm" onClick={() => setFilterOpen(false)}>
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
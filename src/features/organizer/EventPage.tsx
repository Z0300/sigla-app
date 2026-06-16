import { useMemo, useState } from "react";

import { EventStatus, type OrganizerEventFilters } from "#/types/event";
import { Input } from "#/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "#/components/ui/select";
import { useOrganizerEvents } from "#/services/organizer/organizQueries";
import { Can } from "#/components/rbac/can";
import { Permissions } from "#/constants/permissions";
import { PlusIcon } from "lucide-react";
import { EventTable } from "./EventTable";
import { createEventColumns } from "./EventColumn";
import { useUpdateEventStatus } from "#/services/organizer/organizerMutations";
import { Button } from "#/components/ui/button";
import { Link } from "@tanstack/react-router";

const STATUS_OPTIONS: (EventStatus | "All")[] = [
    "All",
    EventStatus.draft,
    EventStatus.published,
    EventStatus.ongoing,
    EventStatus.completed,
    EventStatus.cancelled,
];

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
    };

    const { data, isLoading } = useOrganizerEvents(filters);

    const columns = useMemo(
        () =>
            createEventColumns({
                toEditPage: "/organizer/events/$eventId/edit",
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
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">My Events</h1>

                <Can permission={Permissions.EVENTS_CREATE}>
                    <Button asChild>
                        <Link to="/organizer/events/new">
                            <PlusIcon className="mr-2 h-4 w-4" />
                            New Event
                        </Link>
                    </Button>
                </Can>
            </div>

            <div className="flex gap-3">
                <Input
                    placeholder="Search events..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    name="search-my-events"
                    className="max-w-sm"
                />
                <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as EventStatus | "All")}
                    name="transition-status-filter"
                >
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                                {s}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

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
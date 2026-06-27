import type { ColumnDef } from "@tanstack/react-table";
import type { EventStatus, OrganizerEvent } from "@/types/event";

import { Button } from "@/components/ui/button";
import { Can } from "@/components/rbac/can";
import { Badge } from "@/components/ui/badge";

import { MoreVerticalIcon, PencilIcon } from "lucide-react";
import { Permissions } from "@/constants/permissions";
import { getStatusBadgeClass } from "#/lib/statusColorMap";
import { Link } from "@tanstack/react-router";
import { VALID_TRANSITIONS } from "#/lib/eventTransitions";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "#/components/ui/dropdown-menu";
import { navigate } from "#/lib/navigate";

type Props = {
    toEditPage: "/events/$eventId/edit";
    onStatusChange: (eventId: number, status: EventStatus) => void;
};

export const createEventColumns = ({
    toEditPage,
    onStatusChange,
}: Props): ColumnDef<OrganizerEvent>[] => [
        {
            accessorKey: "title",
            header: "NAME",
            cell: ({ row }) => (
                <button
                    className="text-sm font-medium hover:underline cursor-pointer text-left"
                    onClick={() => navigate({ to: String(row.original.id) })}
                >
                    {row.original.title}
                </button>
            )
        },
        {
            accessorKey: "venue",
            header: "VENUE",
        },
        {
            accessorKey: "registeredCount",
            header: "REGISTRATIONS",
        },

        {
            header: "STATUS",
            cell: ({ row }) => (
                <Badge className={getStatusBadgeClass(row.original.status)}>{row.original.status}</Badge>
            ),
        },

        {
            id: "actions",
            header: "ACTIONS",
            cell: ({ row }) => {

                const event = row.original;
                const nextStatuses = VALID_TRANSITIONS[event.status] ?? [];

                return (
                    <div className="flex items-center gap-2">
                        <Can permission={Permissions.EVENTS_UPDATE}>
                            <Link
                                to={toEditPage}
                                params={{ eventId: String(event.id) }}
                            >
                                <PencilIcon className="h-4 w-4" />
                            </Link>
                        </Can>

                        <Can permission={Permissions.EVENTS_UPDATE}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                        <MoreVerticalIcon className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {nextStatuses.length === 0 && (
                                        <DropdownMenuItem disabled>
                                            No transitions available
                                        </DropdownMenuItem>
                                    )}
                                    {nextStatuses.map((s) => (
                                        <DropdownMenuItem
                                            key={s}
                                            onClick={() => onStatusChange(event.id, s)}
                                        >
                                            Mark as {s}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </Can>
                    </div>
                );
            },
        },
    ];

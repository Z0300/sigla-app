import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { PaginatedResponse } from "#/types";
import { TablePagination } from "#/components/pagination";
import { Loader2Icon } from "lucide-react";
import type { OrganizerEvent } from "#/types/event";

interface OrganizerEventsTableProps {
    data?: PaginatedResponse<OrganizerEvent> | undefined;
    columns: ColumnDef<OrganizerEvent>[];
    isLoading?: boolean;
    page: number;
    pageSize: number;
    onPageChange: (page: number, size?: number) => void;
}

export function EventTable({
    data,
    columns,
    isLoading,
    page,
    pageSize,
    onPageChange,
}: OrganizerEventsTableProps) {
    const events = data?.data ?? []
    const totalPages = data?.meta?.totalPages ?? 0

    const table = useReactTable({
        data: events,
        columns,
        pageCount: totalPages,
        manualPagination: true,
        getCoreRowModel: getCoreRowModel(),
        state: {
            pagination: {
                pageIndex: page,
                pageSize,
            },
        },
        onPaginationChange: (updater) => {
            const next = typeof updater === "function"
                ? updater({ pageIndex: page, pageSize })
                : updater
            onPageChange(next.pageIndex, next.pageSize)
        },
    });

    return (
        <div className="flex flex-col gap-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center py-8">
                                    <Loader2Icon className="h-4 w-4 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && (data?.data ?? []).length === 0 && (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center py-4">
                                    No data found
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading &&
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>

            {!isLoading && data && data.meta.totalElements > data.meta.size && (
                <TablePagination
                    table={table}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={onPageChange}
                />
            )}
        </div>
    );
}

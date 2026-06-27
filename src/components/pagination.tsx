"use client";

import type { Table } from "@tanstack/react-table";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

interface TablePaginationProps<TData> {
  table: Table<TData>;
  page: number;
  pageSize: number;
  onPageChange: (page: number, size?: number) => void;
}

export function TablePagination<TData>({
  table,
  page,
  pageSize,
  onPageChange,
}: TablePaginationProps<TData>) {

  const totalPages = table.getPageCount()
  const canPrev = page > 0
  const canNext = page < totalPages - 1

  return (
    <div className="flex items-center justify-between px-4">
      <div className="hidden flex-1 text-sm text-muted-foreground lg:flex"></div>
      <div className="flex w-full items-center gap-8 lg:w-fit">
        <div className="hidden items-center gap-2 lg:flex">
          <Label htmlFor="rows-per-page" className="text-sm font-medium">
            Rows per page
          </Label>

          <Select
            value={`${pageSize}`}
            onValueChange={(value) => onPageChange(0, Number(value))}
          >
            <SelectTrigger id="rows-per-page" size="sm" className="w-20">
              <SelectValue />
            </SelectTrigger>

            <SelectContent side="top">
              {[20, 30, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-fit items-center justify-center text-sm font-medium">
          Page {page + 1} of {table.getPageCount()}
        </div>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(0)}
            disabled={!canPrev}
          >
            <ChevronsLeftIcon />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(page - 1)}
            disabled={!canPrev}
          >
            <ChevronLeftIcon />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(page + 1)}
            disabled={!canNext}
          >
            <ChevronRightIcon />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => onPageChange(totalPages - 1)}
            disabled={!canNext}
          >
            <ChevronsRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}

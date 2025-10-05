"use client";

import * as React from "react";
import type { Table as TanStackTable } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";
import type { Order } from "@/db/schema";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
    table: TanStackTable<TData>;
    actionBar?: React.ReactNode;
    children?: React.ReactNode;
}

// Helper function to create URL-safe slug
function createOrderSlug(order: Order): string {
    const sn = order.sn.toString();
    const custPo = order.custPo.replace(/\s+/g, '-');
    const partNumber = order.partNumber.replace(/\s+/g, '-');
    return `${sn}-${custPo}-${partNumber}`;
}

export function DataTable<TData>({
                                     table,
                                     actionBar,
                                     children,
                                 }: DataTableProps<TData>) {
    const router = useRouter();

    const handleRowClick = React.useCallback((row: any, columnId: string) => {
        // Only navigate if clicking on specific columns
        const clickableColumns = ["customer", "custPo"];
        if (!clickableColumns.includes(columnId)) return;

        // Check if the data has the required fields for Order
        if (row.original && 'sn' in row.original && 'custPo' in row.original && 'partNumber' in row.original) {
            const slug = createOrderSlug(row.original as Order);
            router.push(`/order/${slug}`);
        }
    }, [router]);

    return (
        <div className="w-full space-y-2.5 overflow-auto">
            {children}
            {actionBar}
            <div className="overflow-hidden rounded-md border">
                <div className="relative overflow-x-auto">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        const isPinned = header.column.getIsPinned();
                                        const pinnedOffset = isPinned
                                            ? `${header.column.getStart(isPinned)}px`
                                            : undefined;

                                        return (
                                            <TableHead
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                style={{
                                                    width:
                                                        header.getSize() !== 150
                                                            ? header.getSize()
                                                            : undefined,
                                                    ...(isPinned && {
                                                        position: "sticky",
                                                        [isPinned]: pinnedOffset,
                                                        zIndex: 1,
                                                    }),
                                                }}
                                                className={cn(
                                                    isPinned && "bg-background/10 backdrop-blur-md shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                                                )}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : React.createElement(
                                                        React.Fragment,
                                                        {},
                                                        header.column.columnDef.header instanceof Function
                                                            ? header.column.columnDef.header(header.getContext())
                                                            : header.column.columnDef.header,
                                                    )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="hover:bg-muted/50"
                                    >
                                        {row.getVisibleCells().map((cell) => {
                                            const isClickable = cell.column.id === "customer" || cell.column.id === "custPo";
                                            const isPinned = cell.column.getIsPinned();
                                            const pinnedOffset = isPinned
                                                ? `${cell.column.getStart(isPinned)}px`
                                                : undefined;

                                            return (
                                                <TableCell
                                                    key={cell.id}
                                                    style={{
                                                        width:
                                                            cell.column.getSize() !== 150
                                                                ? cell.column.getSize()
                                                                : undefined,
                                                        ...(isPinned && {
                                                            position: "sticky",
                                                            [isPinned]: pinnedOffset,
                                                            zIndex: 1,
                                                        }),
                                                    }}
                                                    className={cn(
                                                        isClickable && "cursor-pointer hover:bg-accent",
                                                        isPinned && "bg-background/10 backdrop-blur-md shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                                                    )}
                                                    onClick={isClickable ? () => handleRowClick(row, cell.column.id) : undefined}
                                                >
                                                    {React.createElement(
                                                        React.Fragment,
                                                        {},
                                                        cell.column.columnDef.cell instanceof Function
                                                            ? cell.column.columnDef.cell(cell.getContext())
                                                            : cell.column.columnDef.cell,
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={table.getAllColumns().length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <DataTablePagination table={table} />
        </div>
    );
}
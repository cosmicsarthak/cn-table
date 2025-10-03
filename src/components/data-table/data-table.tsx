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

  const handleRowClick = (row: any) => {
    // Check if the data has the required fields for Order
    if (row.original && 'sn' in row.original && 'custPo' in row.original && 'partNumber' in row.original) {
      const slug = createOrderSlug(row.original as Order);
      router.push(`/order/${slug}`);
    }
  };

  return (
      <div className="w-full space-y-2.5 overflow-auto">
        {children}
        {actionBar}
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                          <TableHead
                              key={header.id}
                              colSpan={header.colSpan}
                              style={{
                                width:
                                    header.getSize() !== 150
                                        ? header.getSize()
                                        : undefined,
                              }}
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
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleRowClick(row)}
                      >
                        {row.getVisibleCells().map((cell) => (
                            <TableCell
                                key={cell.id}
                                style={{
                                  width:
                                      cell.column.getSize() !== 150
                                          ? cell.column.getSize()
                                          : undefined,
                                }}
                            >
                              {React.createElement(
                                  React.Fragment,
                                  {},
                                  cell.column.columnDef.cell instanceof Function
                                      ? cell.column.columnDef.cell(cell.getContext())
                                      : cell.column.columnDef.cell,
                              )}
                            </TableCell>
                        ))}
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
        <DataTablePagination table={table} />
      </div>
  );
}
"use client";

import type { Table } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Order } from "@/db/schema";
import { exportTableToCSV } from "@/lib/export";

import { CreateOrderSheet } from "./create-order-sheet";
import { DeleteOrdersDialog } from "./delete-orders-dialog";

interface OrdersTableToolbarActionsProps {
    table: Table<Order>;
}

export function OrdersTableToolbarActions({
                                              table,
                                          }: OrdersTableToolbarActionsProps) {
    return (
        <div className="flex items-center gap-2">
            {table.getFilteredSelectedRowModel().rows.length > 0 ? (
                <DeleteOrdersDialog
                    orders={table
                        .getFilteredSelectedRowModel()
                        .rows.map((row) => row.original)}
                    onSuccess={() => table.toggleAllRowsSelected(false)}
                />
            ) : null}
            <CreateOrderSheet />
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    exportTableToCSV(table, {
                        filename: "orders",
                        excludeColumns: ["select", "actions"],
                    })
                }
            >
                <Download />
                Export
            </Button>
        </div>
    );
}
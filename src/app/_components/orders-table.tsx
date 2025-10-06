"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list";
import { DataTableFilterMenu } from "@/components/data-table/data-table-filter-menu";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Order, Customer } from "@/db/schema";
import { useDataTable } from "@/hooks/use-data-table";
import type { DataTableRowAction } from "@/types/data-table";
import type {
    getPoValueRange,
    getOrderCustomerCounts,
    getOrderStatusCounts,
    getOrders,
} from "../_lib/queries";
import { CreateOrderSheet } from "./create-order-sheet";
import { DeleteOrdersDialog } from "./delete-orders-dialog";
import { useFeatureFlags } from "./feature-flags-provider";
import { OrdersTableActionBar } from "./orders-table-action-bar";
import { getOrdersTableColumns } from "./orders-table-columns";
import { UpdateOrderSheet } from "./update-order-sheet";

interface OrdersTableProps {
    promises: Promise<
        [
            Awaited<ReturnType<typeof getOrders>>,
            Awaited<ReturnType<typeof getOrderStatusCounts>>,
            Awaited<ReturnType<typeof getOrderCustomerCounts>>,
            Awaited<ReturnType<typeof getPoValueRange>>,
        ]
    >;
    customers: Pick<Customer, "id" | "name">[];
}

export function OrdersTable({ promises, customers }: OrdersTableProps) {
    const { enableAdvancedFilter, filterFlag } = useFeatureFlags();

    const [
        { data, pageCount },
        statusCounts,
        customerCounts,
        poValueRange,
    ] = React.use(promises);

    const [rowAction, setRowAction] =
        React.useState<DataTableRowAction<Order> | null>(null);

    const columns = React.useMemo(
        () =>
            getOrdersTableColumns({
                statusCounts,
                customerCounts,
                poValueRange,
                setRowAction,
            }),
        [statusCounts, customerCounts, poValueRange],
    );

    const { table, shallow, debounceMs, throttleMs } = useDataTable({
        data,
        columns,
        pageCount,
        enableAdvancedFilter,
        initialState: {
            sorting: [{ id: "poDate", desc: true }],
            columnPinning: { right: ["actions"], left: ["select"] },
        },
        getRowId: (originalRow) => String(originalRow.sn),
        shallow: false,
        clearOnDefault: true,
    });

    return (
        <>
            <DataTable
                table={table}
                actionBar={<OrdersTableActionBar table={table} />}
            >
                {enableAdvancedFilter ? (
                    <DataTableAdvancedToolbar table={table}>
                        <DataTableSortList table={table} align="start" />
                        {filterFlag === "advancedFilters" ? (
                            <DataTableFilterList
                                table={table}
                                shallow={shallow}
                                debounceMs={debounceMs}
                                throttleMs={throttleMs}
                                align="start"
                            />
                        ) : (
                            <DataTableFilterMenu
                                table={table}
                                shallow={shallow}
                                debounceMs={debounceMs}
                                throttleMs={throttleMs}
                            />
                        )}
                    </DataTableAdvancedToolbar>
                ) : (
                    <DataTableToolbar table={table}>
                        <DataTableSortList table={table} align="end" />
                    </DataTableToolbar>
                )}
            </DataTable>

            {/* Floating Action Button for Create Order */}
            <div className="fixed bottom-6 right-6 z-50">
                <CreateOrderSheet customers={customers}>
                    <Button
                        size="lg"
                        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                        aria-label="Create new order"
                        title="Create new order"
                    >
                        <Plus className="h-6 w-6" />
                    </Button>
                </CreateOrderSheet>
            </div>

            <UpdateOrderSheet
                open={rowAction?.variant === "update"}
                onOpenChange={() => setRowAction(null)}
                order={rowAction?.row.original ?? null}
                customers={customers}
            />
            <CreateOrderSheet
                open={rowAction?.variant === "duplicate"}
                onOpenChange={() => setRowAction(null)}
                defaultValues={rowAction?.row.original ?? undefined}
                customers={customers}
            />
            <DeleteOrdersDialog
                open={rowAction?.variant === "delete"}
                onOpenChange={() => setRowAction(null)}
                orders={rowAction?.row.original ? [rowAction?.row.original] : []}
                showTrigger={false}
                onSuccess={() => rowAction?.row.toggleSelected(false)}
            />
        </>
    );
}
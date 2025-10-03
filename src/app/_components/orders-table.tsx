"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list";
import { DataTableFilterMenu } from "@/components/data-table/data-table-filter-menu";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import type { Order } from "@/db/schema";
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
}

export function OrdersTable({ promises }: OrdersTableProps) {
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
            sorting: [{ id: "createdAt", desc: true }],
            columnPinning: { right: ["actions"] },
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
            <UpdateOrderSheet
                open={rowAction?.variant === "update"}
                onOpenChange={() => setRowAction(null)}
                order={rowAction?.row.original ?? null}
            />
            <CreateOrderSheet
                open={rowAction?.variant === "duplicate"}
                onOpenChange={() => setRowAction(null)}
                defaultValues={rowAction?.row.original ?? undefined}
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

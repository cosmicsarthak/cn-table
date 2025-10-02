"use client";

import { SelectTrigger } from "@radix-ui/react-select";
import type { Table } from "@tanstack/react-table";
import { CheckCircle2, Download, Trash2, DollarSign } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import {
    DataTableActionBar,
    DataTableActionBarAction,
    DataTableActionBarSelection,
} from "@/components/data-table/data-table-action-bar";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { type Order } from "@/db/schema";
import { exportTableToCSV } from "@/lib/export";
import { deleteOrders, updateOrders } from "../_lib/actions";
import { statusValues, yesNoValues } from "../_lib/validations";

const actions = [
    "update-status",
    "update-payment",
    "export",
    "delete",
] as const;

type Action = (typeof actions)[number];

interface OrdersTableActionBarProps {
    table: Table<Order>;
}

export function OrdersTableActionBar({ table }: OrdersTableActionBarProps) {
    const rows = table.getFilteredSelectedRowModel().rows;
    const [isPending, startTransition] = React.useTransition();
    const [currentAction, setCurrentAction] = React.useState<Action | null>(null);

    const getIsActionPending = React.useCallback(
        (action: Action) => isPending && currentAction === action,
        [isPending, currentAction],
    );

    const onOrderUpdate = React.useCallback(
        ({
             field,
             value,
         }: {
            field: "status" | "paymentReceived";
            value: Order["status"] | Order["paymentReceived"];
        }) => {
            setCurrentAction(
                field === "status" ? "update-status" : "update-payment",
            );
            startTransition(async () => {
                const { error } = await updateOrders({
                    sns: rows.map((row) => row.original.sn),
                    [field]: value,
                });

                if (error) {
                    toast.error(error);
                    return;
                }
                toast.success("Orders updated");
            });
        },
        [rows],
    );

    const onOrderExport = React.useCallback(() => {
        setCurrentAction("export");
        startTransition(() => {
            exportTableToCSV(table, {
                excludeColumns: ["select", "actions"],
                onlySelected: true,
            });
        });
    }, [table]);

    const onOrderDelete = React.useCallback(() => {
        setCurrentAction("delete");
        startTransition(async () => {
            const { error } = await deleteOrders({
                sns: rows.map((row) => row.original.sn),
            });

            if (error) {
                toast.error(error);
                return;
            }
            table.toggleAllRowsSelected(false);
        });
    }, [rows, table]);

    return (
        <DataTableActionBar table={table} visible={rows.length > 0}>
            <DataTableActionBarSelection table={table} />
            <Separator
                orientation="vertical"
                className="hidden data-[orientation=vertical]:h-5 sm:block"
            />
            <div className="flex items-center gap-1.5">
                <Select
                    onValueChange={(value: Order["status"]) =>
                        onOrderUpdate({ field: "status", value })
                    }
                >
                    <SelectTrigger asChild>
                        <DataTableActionBarAction
                            size="icon"
                            tooltip="Update status"
                            isPending={getIsActionPending("update-status")}
                        >
                            <CheckCircle2 />
                        </DataTableActionBarAction>
                    </SelectTrigger>
                    <SelectContent align="center" className="max-h-[300px] overflow-y-auto">
                        <SelectGroup>
                            {[...statusValues].map((status) => (
                                <SelectItem key={status} value={status} className="text-xs">
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select
                    onValueChange={(value: Order["paymentReceived"]) =>
                        onOrderUpdate({ field: "paymentReceived", value })
                    }
                >
                    <SelectTrigger asChild>
                        <DataTableActionBarAction
                            size="icon"
                            tooltip="Update payment status"
                            isPending={getIsActionPending("update-payment")}
                        >
                            <DollarSign />
                        </DataTableActionBarAction>
                    </SelectTrigger>
                    <SelectContent align="center">
                        <SelectGroup>
                            {[...yesNoValues].map((value) => (
                                <SelectItem key={value} value={value}>
                                    {value}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <DataTableActionBarAction
                    size="icon"
                    tooltip="Export orders"
                    isPending={getIsActionPending("export")}
                    onClick={onOrderExport}
                >
                    <Download />
                </DataTableActionBarAction>
                <DataTableActionBarAction
                    size="icon"
                    tooltip="Delete orders"
                    isPending={getIsActionPending("delete")}
                    onClick={onOrderDelete}
                >
                    <Trash2 />
                </DataTableActionBarAction>
            </div>
        </DataTableActionBar>
    );
}
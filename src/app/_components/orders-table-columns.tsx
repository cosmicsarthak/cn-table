"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
    CalendarIcon,
    CircleDashed,
    DollarSign,
    Ellipsis,
    Package,
    User,
    Building2,
    FileText,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { type Order } from "@/db/schema";
import { getErrorMessage } from "@/lib/handle-error";
import type { DataTableRowAction } from "@/types/data-table";

import { updateOrder } from "../_lib/actions";
import { getStatusIcon, getStatusVariant } from "../_lib/utils";
import { statusValues, yesNoValues } from "../_lib/validations";

interface GetOrdersTableColumnsProps {
    statusCounts: Record<string, number>;
    customerCounts: Record<string, number>;
    poValueRange: { min: number; max: number };
    setRowAction: React.Dispatch<
        React.SetStateAction<DataTableRowAction<Order> | null>
    >;
}

export function getOrdersTableColumns({
                                          statusCounts,
                                          customerCounts,
                                          poValueRange,
                                          setRowAction,
                                      }: GetOrdersTableColumnsProps): ColumnDef<Order>[] {
    return [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="translate-y-0.5"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-0.5"
                />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 40,
        },
        {
            id: "sn",
            accessorKey: "sn",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="S/N" />
            ),
            cell: ({ row }) => <div className="w-16">{row.getValue("sn")}</div>,
            enableSorting: true,
            enableHiding: false,
        },
        {
            id: "partNumber",
            accessorKey: "partNumber",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Part Number" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center gap-2">
            <span className="max-w-[12rem] truncate font-medium">
              {row.getValue("partNumber")}
            </span>
                    </div>
                );
            },
            meta: {
                label: "Part Number",
                placeholder: "Search part numbers...",
                variant: "text",
                icon: Package,
            },
            enableColumnFilter: true,
        },
        {
            id: "description",
            accessorKey: "description",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Description" />
            ),
            cell: ({ row }) => (
                <div className="max-w-[20rem] truncate">{row.getValue("description")}</div>
            ),
            enableColumnFilter: false,
        },
        {
            id: "qty",
            accessorKey: "qty",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Qty" />
            ),
            cell: ({ row }) => <div className="w-16 text-right">{row.getValue("qty")}</div>,
            meta: {
                label: "Quantity",
                variant: "number",
            },
            enableColumnFilter: true,
        },
        {
            id: "customer",
            accessorKey: "customer",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Customer" />
            ),
            cell: ({ row }) => (
                <div className="max-w-[12rem] truncate">{row.getValue("customer")}</div>
            ),
            meta: {
                label: "Customer",
                placeholder: "Search customers...",
                variant: "text",
                icon: User,
            },
            enableColumnFilter: true,
        },
        {
            id: "custPo",
            accessorKey: "custPo",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Cust PO" />
            ),
            cell: ({ row }) => <div className="w-24">{row.getValue("custPo")}</div>,
            meta: {
                label: "Customer PO",
                placeholder: "Search customer PO...",
                variant: "text",
                icon: FileText,
            },
            enableColumnFilter: true,
        },
        {
            id: "status",
            accessorKey: "status",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Status" />
            ),
            cell: ({ cell }) => {
                const status = cell.getValue<Order["status"]>();
                const Icon = getStatusIcon(status);
                const variant = getStatusVariant(status);

                return (
                    <Badge variant={variant === "success" ? "default" : variant} className="py-1 [&>svg]:size-3.5 max-w-[14rem]">
                        <Icon />
                        <span className="capitalize truncate">{status}</span>
                    </Badge>
                );
            },
            meta: {
                label: "Status",
                variant: "multiSelect",
                options: [...statusValues].map((status) => ({
                    label: status,
                    value: status,
                    count: statusCounts[status] || 0,
                    icon: getStatusIcon(status),
                })),
                icon: CircleDashed,
            },
            enableColumnFilter: true,
        },
        {
            id: "poValue",
            accessorKey: "poValue",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="PO Value" />
            ),
            cell: ({ row }) => {
                const value = row.getValue<number>("poValue");
                const currency = row.original.currency;
                return (
                    <div className="w-24 text-right font-medium">
                        {currency} {value.toFixed(2)}
                    </div>
                );
            },
            meta: {
                label: "PO Value",
                variant: "range",
                range: [poValueRange.min, poValueRange.max],
                unit: "$",
                icon: DollarSign,
            },
            enableColumnFilter: true,
        },
        {
            id: "supplier",
            accessorKey: "supplier",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Supplier" />
            ),
            cell: ({ row }) => (
                <div className="max-w-[12rem] truncate">{row.getValue("supplier")}</div>
            ),
            meta: {
                label: "Supplier",
                placeholder: "Search suppliers...",
                variant: "text",
                icon: Building2,
            },
            enableColumnFilter: true,
        },
        {
            id: "paymentReceived",
            accessorKey: "paymentReceived",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Payment" />
            ),
            cell: ({ row }) => {
                const payment = row.getValue<string>("paymentReceived");
                return (
                    <Badge variant={payment === "Yes" ? "default" : "secondary"}>
                        {payment}
                    </Badge>
                );
            },
            meta: {
                label: "Payment Received",
                variant: "multiSelect",
                options: [...yesNoValues].map((value) => ({
                    label: value,
                    value: value,
                })),
            },
            enableColumnFilter: true,
        },
        {
            id: "poDate",
            accessorKey: "poDate",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="PO Date" />
            ),
            cell: ({ cell }) => <div className="w-24">{cell.getValue<string>()}</div>,
            meta: {
                label: "PO Date",
                variant: "dateRange", // Changed from "text" to "dateRange"
                icon: CalendarIcon,
            },
            enableColumnFilter: true,
        },
        {
            id: "actions",
            cell: function Cell({ row }) {
                const [isUpdatePending, startUpdateTransition] = React.useTransition();

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                aria-label="Open menu"
                                variant="ghost"
                                className="flex size-8 p-0 data-[state=open]:bg-muted"
                            >
                                <Ellipsis className="size-4" aria-hidden="true" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                                onSelect={() => setRowAction({ row, variant: "update" })}
                            >
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                                    <DropdownMenuRadioGroup
                                        value={row.original.status}
                                        onValueChange={(value) => {
                                            startUpdateTransition(() => {
                                                toast.promise(
                                                    updateOrder({
                                                        sn: row.original.sn,
                                                        status: value as Order["status"],
                                                    }),
                                                    {
                                                        loading: "Updating...",
                                                        success: "Status updated",
                                                        error: (err) => getErrorMessage(err),
                                                    },
                                                );
                                            });
                                        }}
                                    >
                                        {[...statusValues].map((status) => (
                                            <DropdownMenuRadioItem
                                                key={status}
                                                value={status}
                                                disabled={isUpdatePending}
                                                className="text-xs"
                                            >
                                                {status}
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onSelect={() => setRowAction({ row, variant: "duplicate" })}
                            >
                                Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onSelect={() => setRowAction({ row, variant: "delete" })}
                            >
                                Delete
                                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            size: 40,
        },
    ];
}
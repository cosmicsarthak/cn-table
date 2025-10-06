"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/db/schema";
import { getStatusVariant } from "@/app/_lib/utils";
import { format } from "date-fns";

interface CustomerOrdersTableProps {
    orders: Order[];
}

export function CustomerOrdersTable({ orders }: CustomerOrdersTableProps) {
    const router = useRouter();

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
                <p className="text-muted-foreground">No orders found for this customer.</p>
            </div>
        );
    }

    const handleRowClick = (order: Order) => {
        const slug = `${order.sn}-${order.custPo.replace(/\s+/g, '-')}-${order.partNumber}`;
        router.push(`/order/${slug}`);
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>SN</TableHead>
                        <TableHead>Part Number</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Customer PO</TableHead>
                        <TableHead>PO Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">PO Value</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow
                            key={order.sn}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleRowClick(order)}
                        >
                            <TableCell className="font-medium">{order.sn}</TableCell>
                            <TableCell>{order.partNumber}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{order.description}</TableCell>
                            <TableCell>{order.custPo}</TableCell>
                            <TableCell>
                                {order.poDate ? format(new Date(order.poDate), "yyyy-MM-dd") : "-"}
                            </TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(order.status)} className="text-xs">
                                    {order.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {order.currency} {order.poValue.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">{order.qty}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
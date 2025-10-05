"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Order } from "@/db/schema";
import { getStatusIcon, getStatusVariant } from "@/app/_lib/utils";
import { UpdateOrderSheet } from "@/app/_components/update-order-sheet";

interface OrderDetailPageProps {
    order: Order;
}

export function OrderDetailPage({ order }: OrderDetailPageProps) {
    const router = useRouter();
    const [isEditOpen, setIsEditOpen] = React.useState(false);

    const StatusIcon = getStatusIcon(order.status);
    const statusVariant = getStatusVariant(order.status);

    return (
        <>
            <div className="container py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/")}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Order #{order.sn}</h1>
                            <p className="text-muted-foreground">
                                {order.partNumber} • {order.customer}
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => setIsEditOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Order
                    </Button>
                </div>

                {/* Status Badge */}
                <Badge
                    variant={statusVariant === "success" ? "default" : statusVariant}
                    className="py-2 px-4 text-base [&>svg]:size-4"
                >
                    <StatusIcon />
                    <span className="capitalize">{order.status}</span>
                </Badge>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Part Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Part Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <DetailRow label="Part Number" value={order.partNumber} bold />
                            <DetailRow label="Description" value={order.description} />
                            <DetailRow label="Quantity" value={order.qty.toString()} />
                        </CardContent>
                    </Card>

                    {/* Customer & PO Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer & PO</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <DetailRow label="Customer" value={order.customer} />
                            <DetailRow label="Customer PO" value={order.custPo} bold />
                            <DetailRow label="PO Date" value={order.poDate} />
                            <DetailRow label="Payment Terms" value={order.term} />
                        </CardContent>
                    </Card>

                    {/* Financial Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <DetailRow
                                label="Currency"
                                value={order.currency}
                            />
                            <DetailRow
                                label="PO Value"
                                value={`${order.currency} ${order.poValue.toFixed(2)}`}
                                bold
                            />
                            <DetailRow
                                label="Costs"
                                value={`${order.currency} ${order.costs.toFixed(2)}`}
                            />
                            {order.customsDutyB !== null && (
                                <DetailRow
                                    label="Customs Duty (B)"
                                    value={`${order.currency} ${order.customsDutyB.toFixed(2)}`}
                                />
                            )}
                            {order.freightCostC !== null && (
                                <DetailRow
                                    label="Freight Cost (C)"
                                    value={`${order.currency} ${order.freightCostC.toFixed(2)}`}
                                />
                            )}
                            {order.grossProfit !== null && (
                                <DetailRow
                                    label="Gross Profit"
                                    value={`${order.currency} ${order.grossProfit.toFixed(2)}`}
                                />
                            )}
                            {order.profitPercent !== null && (
                                <DetailRow
                                    label="Profit Margin(Profit %)"
                                    value={`${order.profitPercent.toFixed(2)}%`}
                                />
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Payment Received</span>
                                <Badge variant={order.paymentReceived === "Yes" ? "default" : "secondary"}>
                                    {order.paymentReceived}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Investor Paid</span>
                                <Badge variant={order.investorPaid === "Yes" ? "default" : "secondary"}>
                                    {order.investorPaid}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Supplier Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Supplier</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <DetailRow label="Supplier" value={order.supplier} />
                            <DetailRow label="Supplier PO" value={order.supplierPo} />
                            <DetailRow label="Supplier PO Date" value={order.supplierPoDate} />
                        </CardContent>
                    </Card>

                    {/* Shipping & Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping & Dates</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {order.awbToUae && (
                                <DetailRow label="AWB to UAE" value={order.awbToUae} />
                            )}
                            {order.targetDate && (
                                <DetailRow label="Target Date" value={order.targetDate} />
                            )}
                            {order.dispatchDate && (
                                <DetailRow label="Dispatch Date" value={order.dispatchDate} />
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Information */}
                {(order.remarks || order.stability) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {order.remarks && (
                                <DetailRow label="Remarks" value={order.remarks} />
                            )}
                            {order.stability && (
                                <DetailRow
                                    label="Stability"
                                    value={`${order.stability}/10`}
                                />
                            )}
                            <DetailRow label="Last Edited" value={order.lastEdited} />
                        </CardContent>
                    </Card>
                )}
            </div>

            <UpdateOrderSheet
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                order={order}
            />
        </>
    );
}

function DetailRow({
                       label,
                       value,
                       bold = false,
                   }: {
    label: string;
    value: string;
    bold?: boolean;
}) {
    return (
        <div className="flex justify-between items-start gap-4">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className={`text-sm text-right ${bold ? "font-semibold" : ""}`}>
                {value}
            </span>
        </div>
    );
}
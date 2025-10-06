"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Customer } from "@/db/schema";

import { DeleteCustomerDialog, UpdateCustomerDialog } from "./customer-action-dialogs";

interface CustomerWithOrders extends Customer {
    orderCount: number;
}

interface CustomerGridProps {
    customers: CustomerWithOrders[];
}

export function CustomerGrid({ customers }: CustomerGridProps) {
    const router = useRouter();

    if (customers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No customers found. Add your first customer to get started.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {customers.map((customer) => (
                <Card
                    key={customer.id}
                    className="group relative cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
                    onClick={() => router.push(`/customers/${encodeURIComponent(customer.name)}`)}
                >
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <CardTitle className="text-lg line-clamp-2">{customer.name}</CardTitle>
                            <div
                                className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <UpdateCustomerDialog customer={customer} />
                                <DeleteCustomerDialog customer={customer} />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                                {customer.orderCount} {customer.orderCount === 1 ? "order" : "orders"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                {new Date(customer.createdAt).toISOString().split("T")[0]}
              </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
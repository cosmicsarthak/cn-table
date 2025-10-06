// src/app/customers/[customerId]/page.tsx
import { notFound } from "next/navigation";
import * as React from "react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { getCustomerByName, getCustomerOrders } from "../_lib/queries";
import { CustomerOrdersTable } from "../_components/customer-orders-table";

interface CustomerDetailPageProps {
    params: {
        customerId: string;
    };
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
    const customerName = decodeURIComponent(params.customerId);

    const [customer, orders] = await Promise.all([
        getCustomerByName(customerName),
        getCustomerOrders(customerName),
    ]);

    if (!customer) {
        notFound();
    }

    return (
        <Shell>
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/customers">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">{customer.name}</h1>
                        <p className="text-muted-foreground">
                            {orders.length} {orders.length === 1 ? "order" : "orders"}
                        </p>
                    </div>
                </div>

                <CustomerOrdersTable orders={orders} />
            </div>
        </Shell>
    );
}
// src/app/customers/page.tsx
import * as React from "react";
import { Shell } from "@/components/shell";
import { Input } from "@/components/ui/input";

import { CreateCustomerDialog } from "./_components/create-customer-dialog";
import { CustomerGrid } from "./_components/customer-grid";
import { getCustomers } from "./_lib/queries";

export default async function CustomersPage() {
    const customers = await getCustomers();

    return (
        <Shell>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Customers</h1>
                        <p className="text-muted-foreground">
                            Manage your customers and view their orders
                        </p>
                    </div>
                    <CreateCustomerDialog />
                </div>

                <div className="flex items-center gap-4">
                    <Input
                        placeholder="Search customers..."
                        className="max-w-sm"
                        type="search"
                    />
                </div>

                <CustomerGrid customers={customers} />
            </div>
        </Shell>
    );
}
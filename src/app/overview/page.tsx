// app/overview/page.tsx
import * as React from "react";
import { OverviewSkeleton } from "@/components/ui/overview-skeleton";
import { getOrders } from "../_lib/queries";
import { OverviewClient } from "./overview-client";

export default async function OverviewPage() {
    // Fetch all orders server-side using the same pattern as orders table
    const { data: orders } = await getOrders({
        page: 1,
        perPage: 10000, // Get all orders for overview calculations
        sort: [{ id: "createdAt", desc: true }],
        partNumber: "",
        customer: "",
        supplier: "",
        custPo: "",
        status: [],
        term: [],
        currency: [],
        paymentReceived: [],
        poValue: [],
        poDate: [],
        filters: [],
        joinOperator: "and",
        filterFlag: undefined,
    });

    return (
        <React.Suspense
            fallback={
                <OverviewSkeleton
                    rowCount={4}
                    columnCount={3}
                    filterCount={1}
                    cellWidths={["20rem", "20rem", "20rem"]}
                    withPagination={false}
                    shrinkZero
                />
            }
        >
            <OverviewClient orders={orders} />
        </React.Suspense>
    );
}
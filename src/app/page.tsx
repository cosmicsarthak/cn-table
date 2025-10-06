// app/page.tsx
import * as React from "react";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Shell } from "@/components/shell";
import { getValidFilters } from "@/lib/data-table";
import type { SearchParams } from "@/types";

import { FeatureFlagsProvider } from "./_components/feature-flags-provider";
import { OrdersTable } from "./_components/orders-table";
import {
    getPoValueRange,
    getOrderCustomerCounts,
    getOrderStatusCounts,
    getOrders,
} from "./_lib/queries";
import { searchParamsCache } from "./_lib/validations";
import { getCustomersForDropdown } from "./customers/_lib/queries";

interface IndexPageProps {
    searchParams: Promise<SearchParams>;
}

export default async function IndexPage(props: IndexPageProps) {
    const searchParams = await props.searchParams;
    const search = searchParamsCache.parse(searchParams);

    const validFilters = getValidFilters(search.filters);

    const promises = Promise.all([
        getOrders({
            ...search,
            filters: validFilters,
        }),
        getOrderStatusCounts(),
        getOrderCustomerCounts(),
        getPoValueRange(),
    ]);

    // Fetch customers for the dropdown
    const customers = await getCustomersForDropdown();

    return (
        <Shell className="gap-2 relative">
            <FeatureFlagsProvider>
                <React.Suspense
                    fallback={
                        <DataTableSkeleton
                            columnCount={10}
                            filterCount={3}
                            cellWidths={[
                                "4rem",
                                "10rem",
                                "20rem",
                                "6rem",
                                "10rem",
                                "12rem",
                                "10rem",
                                "8rem",
                                "8rem",
                                "4rem",
                            ]}
                            shrinkZero
                        />
                    }
                >
                    <OrdersTable promises={promises} customers={customers} />
                </React.Suspense>
            </FeatureFlagsProvider>
        </Shell>
    );
}
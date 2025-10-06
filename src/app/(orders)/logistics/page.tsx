// app/page.tsx
import * as React from "react";
import { Plus } from "lucide-react";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { getValidFilters } from "@/lib/data-table";
import type { SearchParams } from "@/types";

import { FeatureFlagsProvider } from "@/app/_components/feature-flags-provider";
import { OrdersTable } from "@/app/_components/orders-table";
import { CreateOrderSheet } from "@/app/_components/create-order-sheet";

import {
    getPoValueRange,
    getOrderCustomerCounts,
    getOrderStatusCounts,
    getOrders,
} from "@/app/_lib/queries";
import { searchParamsCache } from "@/app/_lib/validations";
import { getCustomersForDropdown } from "@/app/customers/_lib/queries";

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

                {/* Floating Action Button */}
                <div className="fixed bottom-6 right-6 z-50">
                    <CreateOrderSheet customers={customers}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="lg"
                                    className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                                    aria-label="Create new order"
                                >
                                    <Plus className="h-6 w-6" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                                <p>Create New Order</p>
                            </TooltipContent>
                        </Tooltip>
                    </CreateOrderSheet>
                </div>
            </FeatureFlagsProvider>
        </Shell>
    );
}
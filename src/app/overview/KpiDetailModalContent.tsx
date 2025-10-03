// app/overview/KpiDetailModalContent.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
    DialogClose,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { Order } from "@/db/schema";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type KpiModalContentProps = {
    title: string;
    description: string;
    orders: Order[];
    ctaLink: string;
};

export function KpiDetailModalContent({
                                          title,
                                          description,
                                          orders,
                                          ctaLink,
                                      }: KpiModalContentProps) {
    const router = useRouter();

    const handleRowClick = (rowData: Order) => {
        // Navigate to the orders page with the serial number selected
        // You can customize this to navigate to a detail page if needed
        router.push(`/?sn=${rowData.sn}`);
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription className="mt-1 text-sm leading-6">
                    {description}
                </DialogDescription>
                <div className="mt-4 max-h-96 overflow-y-auto border rounded-lg">
                    {orders.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                                >
                                    SN
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                                >
                                    Cust PO
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                                >
                                    Part Number
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                                >
                                    PO Date
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                                >
                                    Customer
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                                >
                                    Status
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                                >
                                    Description
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {orders.map((order) => (
                                <tr
                                    key={order.sn}
                                    onClick={() => handleRowClick(order)}
                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                                >
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-50">
                                        {order.sn}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {order.custPo}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {order.partNumber}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {order.poDate}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {order.customer}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {order.status}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                                        {order.description}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="p-4 text-sm text-gray-500">
                            No orders found for this KPI.
                        </p>
                    )}
                </div>
            </DialogHeader>
            <DialogFooter className="mt-6">
                <DialogClose asChild>
                    <Button
                        className="mt-2 w-full sm:mt-0 sm:w-fit"
                        variant="secondary"
                    >
                        Go back
                    </Button>
                </DialogClose>
                <DialogClose asChild>
                    <Link href={ctaLink}>
                        <Button type="button" className="w-full sm:w-fit">
                            View Full List
                        </Button>
                    </Link>
                </DialogClose>
            </DialogFooter>
        </>
    );
}
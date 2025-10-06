import React from 'react';
import { Button } from '@/components/ui/button';
import {
    DialogClose,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Order {
    sn: number;
    custPo: string;
    partNumber: string;
    poDate: string;
    customer: string;
    status: string;
    description: string;
    costs: number;
    currency: string;
}

interface SPPModalContentProps {
    orders: Order[];
    totalSPP: number;
}

function createOrderSlug(order: Order): string {
    const sn = order.sn.toString();
    const custPo = order.custPo.replace(/\s+/g, '-');
    const partNumber = order.partNumber.replace(/\s+/g, '-');
    return `${sn}-${custPo}-${partNumber}`;
}

export function SPPModalContent({ orders, totalSPP }: SPPModalContentProps) {
    const router = useRouter();

    // Category 1: Order yet to be processed
    const yetToProcessOrders = orders.filter(
        (o) => o.status === 'Order yet to be processed'
    );
    const yetToProcessTotal = yetToProcessOrders.reduce((sum, o) => sum + o.costs, 0);

    // Category 2: Order processed
    const processedOrders = orders.filter(
        (o) => o.status === 'Order processed'
    );
    const processedTotal = processedOrders.reduce((sum, o) => sum + o.costs, 0);

    // Category 3: Payment pending to Supplier
    const paymentPendingOrders = orders.filter(
        (o) => o.status === 'Payment pending to Supplier'
    );
    const paymentPendingTotal = paymentPendingOrders.reduce((sum, o) => sum + o.costs, 0);

    const handleRowClick = (order: Order) => {
        const slug = createOrderSlug(order);
        router.push(`/order/${slug}`);
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        });
    };

    const renderOrderTable = (categoryOrders: Order[], emptyMessage: string) => {
        if (categoryOrders.length === 0) {
            return (
                <p className="p-4 text-sm text-gray-500 text-center">
                    {emptyMessage}
                </p>
            );
        }

        return (
            <div className="overflow-y-auto border rounded-lg max-h-60">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            SN
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Cust PO
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Part Number
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Customer
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Status
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Costs
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {categoryOrders.map((order) => (
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
                                {order.customer}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                {order.status}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-50 text-right font-medium">
                                {formatCurrency(order.costs)}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle>Supplier Pending Payments Breakdown</DialogTitle>
                <DialogDescription className="mt-1 text-sm leading-6">
                    Total amount owed to suppliers: <span className="font-bold text-lg">{formatCurrency(totalSPP)}</span>
                </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-8 max-h-[60vh] overflow-y-auto">
                {/* Category 1: Order yet to be processed */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                            1. Order yet to be processed
                        </h3>
                        <span className="text-base font-bold text-gray-900 dark:text-gray-50">
                            {formatCurrency(yetToProcessTotal)}
                        </span>
                    </div>
                    {renderOrderTable(yetToProcessOrders, 'No orders yet to be processed')}
                    <Link href="/sales?sort=[{%22id%22:%22sn%22,%22desc%22:true}]&status=Order+yet+to+be+processed">
                        <Button variant="outline" className="w-full">
                            See in Detail
                        </Button>
                    </Link>
                </div>

                {/* Category 2: Order processed */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                            2. Order processed
                        </h3>
                        <span className="text-base font-bold text-gray-900 dark:text-gray-50">
                            {formatCurrency(processedTotal)}
                        </span>
                    </div>
                    {renderOrderTable(processedOrders, 'No orders processed')}
                    <Link href="/sales?sort=[{%22id%22:%22sn%22,%22desc%22:true}]&status=Order+processed">
                        <Button variant="outline" className="w-full">
                            See in Detail
                        </Button>
                    </Link>
                </div>

                {/* Category 3: Payment pending to Supplier */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                            3. Payment pending to Supplier
                        </h3>
                        <span className="text-base font-bold text-gray-900 dark:text-gray-50">
                            {formatCurrency(paymentPendingTotal)}
                        </span>
                    </div>
                    {renderOrderTable(paymentPendingOrders, 'No payments pending to supplier')}
                    <Link href="/sales?sort=[{%22id%22:%22sn%22,%22desc%22:true}]&status=Payment+pending+to+Supplier">
                        <Button variant="outline" className="w-full">
                            See in Detail
                        </Button>
                    </Link>
                </div>
            </div>

            <DialogFooter className="mt-6">
                <DialogClose asChild>
                    <Button variant="secondary" className="w-full sm:w-fit">
                        Close
                    </Button>
                </DialogClose>
            </DialogFooter>
        </>
    );
}
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
    poValue: number;
    currency: string;
}

interface ARModalContentProps {
    orders: Order[];
    totalAR: number;
}

function createOrderSlug(order: Order): string {
    const sn = order.sn.toString();
    const custPo = order.custPo.replace(/\s+/g, '-');
    const partNumber = order.partNumber.replace(/\s+/g, '-');
    return `${sn}-${custPo}-${partNumber}`;
}

export function ARModalContent({ orders, totalAR }: ARModalContentProps) {
    const router = useRouter();

    // Category A: Delivered orders with payment not received
    const deliveredOrders = orders.filter(
        (o) => o.status === 'Delivered'
    );
    const deliveredTotal = deliveredOrders.reduce((sum, o) => sum + o.poValue, 0);

    // Category B: Orders in Transit (Transit to UAE, Ready for Dispatch, Received in UAE)
    const transitStatuses = ['Transit to UAE', 'Ready for Dispatch', 'Received in UAE'];
    const transitOrders = orders.filter(
        (o) => transitStatuses.includes(o.status)
    );
    const transitTotal = transitOrders.reduce((sum, o) => sum + o.poValue, 0);

    // Category C: Orders to be Processed
    const processingStatuses = ['Order yet to be processed', 'Order processed'];
    const processingOrders = orders.filter(
        (o) => processingStatuses.includes(o.status)
    );
    const processingTotal = processingOrders.reduce((sum, o) => sum + o.poValue, 0);

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
                            PO Value
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
                                {formatCurrency(order.poValue)}
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
                <DialogTitle>Accounts Receivable Breakdown</DialogTitle>
                <DialogDescription className="mt-1 text-sm leading-6">
                    Total amount owed by customers: <span className="font-bold text-lg">{formatCurrency(totalAR)}</span>
                </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-8 max-h-[60vh] overflow-y-auto">
                {/* Category A: Orders Delivered */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                            A. Orders Delivered
                        </h3>
                        <span className="text-base font-bold text-gray-900 dark:text-gray-50">
              {formatCurrency(deliveredTotal)}
            </span>
                    </div>
                    {renderOrderTable(deliveredOrders, 'No delivered orders with pending payments')}
                    <Link href="/sales?sort=[{%22id%22:%22sn%22,%22desc%22:true}]&paymentReceived=No&status=Delivered">
                        <Button variant="outline" className="w-full">
                            See in Detail
                        </Button>
                    </Link>
                </div>

                {/* Category B: Orders in Transit */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                            B. Orders in Transit
                        </h3>
                        <span className="text-base font-bold text-gray-900 dark:text-gray-50">
              {formatCurrency(transitTotal)}
            </span>
                    </div>
                    {renderOrderTable(transitOrders, 'No orders in transit with pending payments')}
                    <Link href="/sales?sort=[{%22id%22:%22sn%22,%22desc%22:true}]&paymentReceived=No&status=Transit+to+UAE,Ready+for+Dispatch,Received+in+UAE">
                        <Button variant="outline" className="w-full">
                            See in Detail
                        </Button>
                    </Link>
                </div>

                {/* Category C: Orders to be Processed */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                            C. Orders to be Processed
                        </h3>
                        <span className="text-base font-bold text-gray-900 dark:text-gray-50">
              {formatCurrency(processingTotal)}
            </span>
                    </div>
                    {renderOrderTable(processingOrders, 'No orders to be processed with pending payments')}
                    <Link href="/sales?sort=[{%22id%22:%22sn%22,%22desc%22:true}]&paymentReceived=No&status=Order+yet+to+be+processed,Order+processed">
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
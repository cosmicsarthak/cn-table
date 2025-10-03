// app/overview/overview-client.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    CardProps,
    ProgressBarCard,
} from "@/components/ui/overview/DashboardProgressBarCard";
import { ProgressBarProps } from "@/extra-components/ProgressBar";
import Link from "next/link";
import { useMemo, useState } from "react";
import { KpiDetailModalContent } from "./KpiDetailModalContent";
import { StackedBarChartTrem } from "./StackedBarChartTrem";
import { StackedBarChartTremGrossProfit } from "./StackedBarChartTremGrossProfit";
import type { Order } from "@/db/schema";

type KpiCardData = CardProps & {
    filteredOrders: Order[];
    variant?: ProgressBarProps["variant"];
};

interface OverviewClientProps {
    orders: Order[];
}

export function OverviewClient({ orders }: OverviewClientProps) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [selectedMonth, setSelectedMonth] = useState<string>(
        currentMonth.toString().padStart(2, "0")
    );
    const [selectedYear, setSelectedYear] = useState<string>(
        currentYear.toString()
    );

    const years = useMemo(() => {
        const yearsArray: { label: string; value: string }[] = [];
        for (let year = currentYear; year >= 2010; year--) {
            yearsArray.push({ label: year.toString(), value: year.toString() });
        }
        return yearsArray;
    }, [currentYear]);

    const months = useMemo(() => {
        return [
            { label: "January", value: "01" },
            { label: "February", value: "02" },
            { label: "March", value: "03" },
            { label: "April", value: "04" },
            { label: "May", value: "05" },
            { label: "June", value: "06" },
            { label: "July", value: "07" },
            { label: "August", value: "08" },
            { label: "September", value: "09" },
            { label: "October", value: "10" },
            { label: "November", value: "11" },
            { label: "December", value: "12" },
        ];
    }, []);

    const kpiCards: KpiCardData[] = useMemo(() => {
        if (orders.length === 0) {
            return [];
        }

        const selectedMonthNumber = parseInt(selectedMonth, 10) - 1;
        const selectedYearNumber = parseInt(selectedYear, 10);

        const isSelectedMonthAndYear = (order: Order) => {
            const dateToCheck = order.poDate ? new Date(order.poDate) : null;
            if (!dateToCheck) return false;
            return (
                dateToCheck.getMonth() === selectedMonthNumber &&
                dateToCheck.getFullYear() === selectedYearNumber
            );
        };

        const allDelivered = orders.filter((o) => o.status === "Delivered");
        const relevantOrdersThisMonth = orders.filter(isSelectedMonthAndYear);
        const allDeliveredThisMonth = allDelivered.filter(isSelectedMonthAndYear);

        // KPI Calculations
        const overdueOrdersArray = orders.filter(
            (o) =>
                o.status &&
                o.status !== "Delivered" &&
                o.status !== "Cancelled" &&
                o.targetDate &&
                new Date(o.targetDate) < now
        );
        const overdueOrders = overdueOrdersArray.length;

        const targetDateAchievedArray = allDelivered.filter(
            (o) =>
                o.dispatchDate &&
                o.targetDate &&
                new Date(o.dispatchDate) <= new Date(o.targetDate)
        );
        const targetDateAchieved = targetDateAchievedArray.length;

        const targetDateNotAchievedArray = allDelivered.filter(
            (o) =>
                o.dispatchDate &&
                o.targetDate &&
                new Date(o.dispatchDate) > new Date(o.targetDate)
        );
        const targetDateNotAchieved = targetDateNotAchievedArray.length;

        const totalDeliveredInMonth = allDeliveredThisMonth.length;
        const targetAchievedInMonthArray = allDeliveredThisMonth.filter(
            (o) =>
                o.dispatchDate &&
                o.targetDate &&
                new Date(o.dispatchDate) <= new Date(o.targetDate)
        );
        const targetAchievedInMonth = targetAchievedInMonthArray.length;
        const percentTargetAchieved =
            totalDeliveredInMonth > 0
                ? (targetAchievedInMonth / totalDeliveredInMonth) * 100
                : 0;

        const targetNotAchievedInMonthArray = allDeliveredThisMonth.filter(
            (o) =>
                o.dispatchDate &&
                o.targetDate &&
                new Date(o.dispatchDate) > new Date(o.targetDate)
        );
        const targetNotAchievedInMonth = targetNotAchievedInMonthArray.length;
        const percentTargetNotAchieved =
            totalDeliveredInMonth > 0
                ? (targetNotAchievedInMonth / totalDeliveredInMonth) * 100
                : 0;

        const monthlyTotalProfit = relevantOrdersThisMonth.reduce(
            (sum, o) => sum + (o.netProfit || 0),
            0
        );

        const monthlyUnrealizedProfitArray = relevantOrdersThisMonth.filter(
            (o) => o.status !== "Delivered"
        );
        const monthlyUnrealizedProfit = monthlyUnrealizedProfitArray.reduce(
            (sum, o) => sum + (o.netProfit || 0),
            0
        );

        const monthlyRealizedProfitArray = relevantOrdersThisMonth.filter(
            (o) => o.status === "Delivered"
        );
        const monthlyRealizedProfit = monthlyRealizedProfitArray.reduce(
            (sum, o) => sum + (o.netProfit || 0),
            0
        );

        const supplierPendingPaymentsArray = orders.filter(
            (o) => o.status === "Payment pending to Supplier"
        );
        const supplierPendingPayments = supplierPendingPaymentsArray.reduce(
            (sum, o) => sum + o.costs,
            0
        );

        const accountsReceivableArray = orders.filter(
            (o) => o.paymentReceived?.toLowerCase() !== "yes"
        );
        const accountsReceivable = accountsReceivableArray.reduce(
            (sum, o) => sum + o.poValue,
            0
        );

        const monthlyTarget = 50;
        const deficitExcess = targetAchievedInMonth - monthlyTarget;

        return [
            {
                title: "Number of Overdue Orders",
                value: overdueOrders.toString(),
                valueDescription: "Orders past target date",
                data: [
                    {
                        title: "Overdue",
                        current: overdueOrders,
                        allowed: orders.length,
                        percentage: (overdueOrders / orders.length) * 100,
                        unit: "n",
                    },
                ],
                ctaLink: `/?page=1&status=Order+yet+to+be+processed,Order+processed,Payment+pending+to+Supplier,Supplier+Paid,Long+LT+-+Awaiting+ESD,Long+LT+-+ESD+Provided,Ready+for+Dispatch,Issue,Hold,Received+in+UAE,Need+to+Collect,Transit+to+UAE,AWB+Shared+to+Supplier,Awaiting+AWB+from+FF,Ready+for+Collection+from+Supplier,Awaiting+Collection+Details&targetDate=1643653800000,${Date.now()}`,
                filteredOrders: overdueOrdersArray,
                ctaText: "View List",
                variant: "error" as const,
            },
            {
                title: "Target Date Achieved (All Time)",
                value: targetDateAchieved.toString(),
                valueDescription: "Delivered on or before target🛣️",
                data: [
                    {
                        title: "On-Time",
                        current: targetDateAchieved,
                        allowed: allDelivered.length,
                        percentage:
                            allDelivered.length > 0
                                ? (targetDateAchieved / allDelivered.length) * 100
                                : 0,
                        unit: "n",
                    },
                ],
                ctaLink: "/?status=Delivered",
                filteredOrders: targetDateAchievedArray,
                ctaText: "View List",
                variant: "default" as const,
            },
            {
                title: "Target Date Not Achieved (All Time)",
                value: targetDateNotAchieved.toString(),
                valueDescription: "Delivered after target date",
                data: [
                    {
                        title: "Late",
                        current: targetDateNotAchieved,
                        allowed: allDelivered.length,
                        percentage:
                            allDelivered.length > 0
                                ? (targetDateNotAchieved / allDelivered.length) * 100
                                : 0,
                        unit: "n",
                    },
                ],
                ctaLink: "/?status=Delivered",
                filteredOrders: targetDateNotAchievedArray,
                ctaText: "View List",
                variant: "default" as const,
            },
            {
                title: "% Target Achieved (This Month)",
                value: `${percentTargetAchieved.toFixed(1)}%`,
                valueDescription: "On-time deliveries this month",
                data: [
                    {
                        title: "On-Time",
                        current: targetAchievedInMonth,
                        allowed: totalDeliveredInMonth,
                        percentage: percentTargetAchieved,
                        unit: "n",
                    },
                ],
                ctaLink: "/?status=Delivered",
                filteredOrders: targetAchievedInMonthArray,
                ctaText: "View List",
                variant: "success" as const,
            },
            {
                title: "% Target Not Achieved (This Month)",
                value: `${percentTargetNotAchieved.toFixed(1)}%`,
                valueDescription: "Late deliveries this month",
                data: [
                    {
                        title: "Late",
                        current: targetNotAchievedInMonth,
                        allowed: totalDeliveredInMonth,
                        percentage: percentTargetNotAchieved,
                        unit: "n",
                    },
                ],
                ctaLink: "/?status=Delivered",
                filteredOrders: targetNotAchievedInMonthArray,
                ctaText: "View List",
                variant: "error" as const,
            },
            {
                title: "Monthly Total Profit",
                value: monthlyTotalProfit.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                }),
                valueDescription: "Total profit for this month",
                data: [
                    {
                        title: "Profit",
                        current: monthlyTotalProfit.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                        }),
                        allowed: monthlyTotalProfit.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                        }),
                        percentage: 100,
                        unit: "",
                    },
                ],
                ctaLink: "/",
                filteredOrders: relevantOrdersThisMonth,
                ctaText: "View List",
                variant: "default" as const,
            },
            {
                title: "Monthly Realized Profit",
                value: monthlyRealizedProfit.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                }),
                valueDescription: "From delivered orders this month",
                data: [
                    {
                        title: "Realized",
                        current: monthlyRealizedProfit.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                        }),
                        allowed: monthlyTotalProfit.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                        }),
                        percentage:
                            monthlyTotalProfit > 0
                                ? (monthlyRealizedProfit / monthlyTotalProfit) * 100
                                : 0,
                        unit: "$",
                    },
                ],
                ctaLink: "/?status=Delivered",
                filteredOrders: monthlyRealizedProfitArray,
                ctaText: "View List",
                variant: "success" as const,
            },
            {
                title: "Monthly Unrealized Profit",
                value: monthlyUnrealizedProfit.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                }),
                valueDescription: "From pending orders this month",
                data: [
                    {
                        title: "Unrealized",
                        current: monthlyUnrealizedProfit.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                        }),
                        allowed: monthlyTotalProfit.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                        }),
                        percentage:
                            monthlyTotalProfit > 0
                                ? (monthlyUnrealizedProfit / monthlyTotalProfit) * 100
                                : 0,
                        unit: "$",
                    },
                ],
                ctaLink: "/",
                filteredOrders: monthlyUnrealizedProfitArray,
                ctaText: "View List",
                variant: "error" as const,
            },
            {
                title: "Accounts Receivable",
                value: accountsReceivable.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                }),
                valueDescription: "Total amount owed by customers",
                data: [
                    {
                        title: "AR",
                        current: accountsReceivable.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                        }),
                        allowed: accountsReceivable.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                        }),
                        percentage: 100,
                        unit: "$",
                    },
                ],
                ctaLink: "/?page=1&paymentReceived=No",
                filteredOrders: accountsReceivableArray,
                ctaText: "View List",
                variant: "error" as const,
            },
            {
                title: "Supplier Pending Payments",
                value: supplierPendingPayments.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                }),
                valueDescription: "Total amount owed to suppliers",
                data: [
                    {
                        title: "SPP",
                        current: supplierPendingPayments,
                        allowed: supplierPendingPayments,
                        percentage: supplierPendingPayments > 0 ? 100 : 0,
                        unit: "$",
                    },
                ],
                ctaLink: "/?page=1&status=Payment+pending+to+Supplier",
                filteredOrders: supplierPendingPaymentsArray,
                ctaText: "View List",
                variant: "warning" as const,
            },
            {
                title: "Monthly On-Time Goal (Deficit/Excess)",
                value: `${deficitExcess >= 0 ? "+" : ""}${deficitExcess}`,
                valueDescription: `Against a target of ${monthlyTarget}`,
                data: [
                    {
                        title: "Performance",
                        current: targetAchievedInMonth,
                        allowed: monthlyTarget,
                        percentage:
                            monthlyTarget > 0
                                ? (targetAchievedInMonth / monthlyTarget) * 100
                                : 100,
                        unit: "n",
                    },
                ],
                ctaLink: "/",
                filteredOrders: targetAchievedInMonthArray,
                ctaText: "View List",
                variant: "default" as const,
            },
        ];
    }, [orders, selectedMonth, selectedYear]);

    return (
        <section aria-labelledby="overview-main-content">
            <nav className="mb-8">
                <h2 className="mb-2 text-base font-medium text-gray-500 dark:text-gray-50">
                    Jump to:
                </h2>
                <ul className="flex flex-wrap gap-x-4 gap-y-3 text-sm">
                    <li>
                        <Link
                            href="#operational-overview-section"
                            className="rounded-xl bg-gray-200 px-3 py-2 text-gray-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                            Operational Performance Overview
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="#yearly-profits-chart-section"
                            className="rounded-xl bg-gray-200 px-3 py-2 text-gray-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                            Yearly Profits Chart
                        </Link>
                    </li>
                </ul>
            </nav>

            <h1
                id="operational-overview-section"
                className="scroll-mt-10 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
            >
                Operational Performance Overview
            </h1>
            <div className="mb-8 mt-4 flex gap-4">
                <div className="flex-1">
                    <Label htmlFor="month-select" className="font-medium">
                        Select Month
                    </Label>
                    <Select
                        name="month-select"
                        value={selectedMonth}
                        onValueChange={(value) => setSelectedMonth(value)}
                    >
                        <SelectTrigger id="month-select" className="mt-2">
                            <SelectValue placeholder="Select Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1">
                    <Label htmlFor="year-select" className="font-medium">
                        Select Year
                    </Label>
                    <Select
                        name="year-select"
                        value={selectedYear}
                        onValueChange={(value) => setSelectedYear(value)}
                    >
                        <SelectTrigger id="year-select" className="mt-2">
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-8 sm:mt-6 sm:grid-cols-2 lg:mt-8 xl:grid-cols-3">
                {kpiCards.map((card) => (
                    <Dialog key={card.title}>
                        <ProgressBarCard
                            title={card.title}
                            change="-"
                            value={card.value}
                            valueDescription={card.valueDescription}
                            ctaDescription="Review all underlying data."
                            ctaText={card.ctaText}
                            ctaLink={card.ctaLink}
                            data={card.data}
                            variant={card.variant}
                            triggerButton={
                                <DialogTrigger asChild>
                                    <Button variant="secondary" className="mt-6 w-full">
                                        {card.ctaText}
                                    </Button>
                                </DialogTrigger>
                            }
                        />
                        <DialogContent className="sm:max-w-4xl">
                            <KpiDetailModalContent
                                title={card.title}
                                description={card.valueDescription}
                                orders={card.filteredOrders}
                                ctaLink={card.ctaLink}
                            />
                        </DialogContent>
                    </Dialog>
                ))}
            </div>

            <div className={"my-20 mt-36 border-t border-gray-300 py-10"}>
                <h1
                    id="yearly-profits-chart-section"
                    className="mb-6 scroll-mt-10 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
                >
                    Yearly Profits Chart
                </h1>
                <StackedBarChartTrem orders={orders} loading={false} error={null} />
                <div className={"my-20 h-1 w-full"}>
                    <hr />
                </div>
                <StackedBarChartTremGrossProfit
                    orders={orders}
                    loading={false}
                    error={null}
                />
            </div>
        </section>
    );
}
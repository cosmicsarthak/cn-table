// page.tsx
"use client"
import { StackedBarChartTrem } from "./StackedBarChartTrem"
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { OverviewSkeleton } from "@/components/ui/overview-skeleton"
import {
  CardProps,
  ProgressBarCard,
} from "@/components/ui/overview/DashboardProgressBarCard"
import Link from "next/link" // Import Link for internal navigation
import { useEffect, useMemo, useState } from "react"
import { KpiDetailModalContent } from "./KpiDetailModalContent"

import { Label } from "@/components/ui/label"
import { ProgressBarProps } from "@/extra-components/ProgressBar" // Import ProgressBarProps
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StackedBarChartTremGrossProfit } from "./StackedBarChartTremGrossProfit"

// The custom parser (parseAsUnixMsDateRange) should be in a separate utility file,
// not directly in page.tsx, to avoid Next.js entry export errors.
// It would be imported and used where you define your search params with nuqs.

// Defines the shape of a single order object, based on OrderDetailsPageClient.tsx
export interface Order {
  sn: number
  partNumber: string
  description: string
  qty: number // Mixed types in CSV (e.g., "10 FT")
  poDate: string
  term: string
  customer: string
  custPo: string
  status: string
  remarks: string
  currency: string
  poValue: number
  costs: number
  customsDutyB: number | null
  freightCostC: number | null
  grossProfit: number | null
  profitPercent: number | null
  netProfit: number | null
  profitPercentAfterCost: number | null
  paymentReceived: string
  investorPaid: string
  targetDate: string
  dispatchDate: string
  supplierPoDate: string
  supplier: string
  supplierPo: string
  awbToUae: string
  haInvDate: string
  haInv: string
  anPoDate: string
  anPo: string
  anInvDate: string
  anInv: string
  audited: string
  stability: number
  lastEdited: string
  [key: string]: any // Allow for other properties
}

// Defines the structure for data points used in the ProgressBarCard
export type KpiEntry = {
  title: string
  percentage: number
  current: number
  allowed: number
  unit?: string
}

// New type definition for KPI card data, extending CardProps and adding filteredOrders
export type KpiCardData = CardProps & {
  filteredOrders: Order[]
  variant?: ProgressBarProps["variant"] // Added variant to KpiCardData
}

/**
 * Fetches all order data from the API endpoint.
 * @returns A promise that resolves to an array of orders.
 */
async function fetchAllOrders(): Promise<Order[]> {
  try {
    const apiUrl = `https://hissan-aeroflow-hono-turso.sameem-hassan.workers.dev/orders`
    const response = await fetch(apiUrl)
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`)
      return []
    }
    // Ensure the response is parsed as JSON.
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error fetching all orders:", error)
    return []
  }
}

// Main component for the Overview page
export default function Overview() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const now = new Date()
  const currentMonth = now.getMonth() + 1 // 1-indexed month
  const currentYear = now.getFullYear()

  const [selectedMonth, setSelectedMonth] = useState<string>(
    currentMonth.toString().padStart(2, "0"), // Current month (1-indexed, padded)
  )
  const [selectedYear, setSelectedYear] = useState<string>(
    currentYear.toString(),
  )

  // Generate years from 2010 to current year in descending order
  const years = useMemo(() => {
    const yearsArray: { label: string; value: string }[] = []
    for (let year = currentYear; year >= 2010; year--) {
      yearsArray.push({ label: year.toString(), value: year.toString() })
    }
    return yearsArray
  }, [currentYear])

  // Generate months array
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
    ]
  }, [])

  // Effect to fetch order data when the component mounts
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const fetchedOrders = await fetchAllOrders()
        setOrders(fetchedOrders)
      } catch (e: any) {
        setError("Failed to load order data.")
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // useMemo to calculate all KPIs from the report table when orders data changes
  // Explicitly type kpiCards as an array of KpiCardData
  const kpiCards: KpiCardData[] = useMemo(() => {
    if (orders.length === 0) {
      return []
    }

    const selectedMonthNumber = parseInt(selectedMonth, 10) - 1 // 0-indexed for Date object
    const selectedYearNumber = parseInt(selectedYear, 10)

    // Helper to check if an order's poDate is in the current selected month and year
    const isSelectedMonthAndYear = (order: Order) => {
      const dateToCheck = order.poDate ? new Date(order.poDate) : null

      if (!dateToCheck) {
        return false
      }
      return (
        dateToCheck.getMonth() === selectedMonthNumber &&
        dateToCheck.getFullYear() === selectedYearNumber
      )
    }

    const allDelivered = orders.filter((o) => o.status === "Delivered")

    // Filter for all orders that have a relevant date (targetDate or dispatchDate if delivered) in the selected month.
    const relevantOrdersThisMonth = orders.filter(isSelectedMonthAndYear)

    // Filter only delivered orders that fall in "this month" based on their dispatch/target date.
    const allDeliveredThisMonth = allDelivered.filter(isSelectedMonthAndYear)

    // --- KPI Calculations ---

    // 1. Number of Overdue Orders
    const overdueOrdersArray = orders.filter(
      (o) =>
        o.status &&
        o.status !== "Delivered" &&
        o.status !== "Cancelled" &&
        o.targetDate &&
        new Date(o.targetDate) < now,
    )
    const overdueOrders = overdueOrdersArray.length

    // 2. Target Date Achieved (All Time)
    const targetDateAchievedArray = allDelivered.filter(
      (o) =>
        o.dispatchDate &&
        o.targetDate &&
        new Date(o.dispatchDate) <= new Date(o.targetDate),
    )
    const targetDateAchieved = targetDateAchievedArray.length

    // 3. Target Date Not Achieved (All Time)
    const targetDateNotAchievedArray = allDelivered.filter(
      (o) =>
        o.dispatchDate &&
        o.targetDate &&
        new Date(o.dispatchDate) > new Date(o.targetDate),
    )
    const targetDateNotAchieved = targetDateNotAchievedArray.length

    // 4. % Target Achieved (This Month)
    // We base this on `allDeliveredThisMonth` for consistency with "delivered" targets.
    const totalDeliveredInMonth = allDeliveredThisMonth.length
    // Corrected: Filter `allDeliveredThisMonth` for on-time deliveries
    const targetAchievedInMonthArray = allDeliveredThisMonth.filter(
      (o) =>
        o.dispatchDate &&
        o.targetDate &&
        new Date(o.dispatchDate) <= new Date(o.targetDate),
    )
    const targetAchievedInMonth = targetAchievedInMonthArray.length
    const percentTargetAchieved =
      totalDeliveredInMonth > 0
        ? (targetAchievedInMonth / totalDeliveredInMonth) * 100
        : 0

    // 5. % Target Not Achieved (This Month)
    // We base this on `allDeliveredThisMonth` for consistency with "delivered" targets.
    // Corrected: Filter `allDeliveredThisMonth` for late deliveries
    const targetNotAchievedInMonthArray = allDeliveredThisMonth.filter(
      (o) =>
        o.dispatchDate &&
        o.targetDate &&
        new Date(o.dispatchDate) > new Date(o.targetDate),
    )
    const targetNotAchievedInMonth = targetNotAchievedInMonthArray.length
    const percentTargetNotAchieved =
      totalDeliveredInMonth > 0
        ? (targetNotAchievedInMonth / totalDeliveredInMonth) * 100
        : 0

    // 6. Monthly Total Profit (based on relevantOrdersThisMonth)
    const monthlyTotalProfit = relevantOrdersThisMonth.reduce(
      (sum, o) => sum + (o.netProfit || 0),
      0,
    )

    // 7. Monthly Unrealized Profit (based on relevantOrdersThisMonth and not delivered)
    const monthlyUnrealizedProfitArray = relevantOrdersThisMonth.filter(
      (o) => o.status !== "Delivered",
    )
    const monthlyUnrealizedProfit = monthlyUnrealizedProfitArray.reduce(
      (sum, o) => sum + (o.netProfit || 0),
      0,
    )

    // 8. Monthly Realized Profit (based on relevantOrdersThisMonth and delivered)
    const monthlyRealizedProfitArray = relevantOrdersThisMonth.filter(
      (o) => o.status === "Delivered",
    )
    const monthlyRealizedProfit = monthlyRealizedProfitArray.reduce(
      (sum, o) => sum + (o.netProfit || 0),
      0,
    )

    // 9. Supplier Pending Payments Value
    const supplierPendingPaymentsArray = orders.filter(
      (o) => o.status === "Payment pending to Supplier",
    )
    const supplierPendingPayments = supplierPendingPaymentsArray.reduce(
      (sum, o) => sum + o.costs,
      0,
    )

    // 10. Accounts Receivable Value
    const accountsReceivableArray = orders.filter(
      (o) => o.paymentReceived?.toLowerCase() !== "yes",
    )
    const accountsReceivable = accountsReceivableArray.reduce(
      (sum, o) => sum + o.poValue,
      0,
    )

    // 11. Monthly On-Time Goal (Deficit/Excess) (Assuming target is 50 for demo)
    const monthlyTarget = 50
    const deficitExcess = targetAchievedInMonth - monthlyTarget

    // --- Card Definitions ---
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
        ctaLink: `/filter?page=1&status=Order+yet+to+be+processed,Order+processed,Payment+pending+to+Supplier,Supplier+Paid,Long+LT+-+Awaiting+ESD,Long+LT+-+ESD+Provided,Ready+for+Dispatch,Issue,Hold,Received+in+UAE,Need+to+Collect,Transit+to+UAE,AWB+Shared+to+Supplier,Awaiting+AWB+from+FF,Ready+for+Collection+from+Supplier,Awaiting+Collection+Details&targetDate=1643653800000,${Date.now()}`,
        filteredOrders: overdueOrdersArray,
        ctaText: "View List",
        variant: "error", // Added variant
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
        ctaLink: "/orders?dispatchStatus=OnTime",
        filteredOrders: targetDateAchievedArray,
        ctaText: "View List",
        variant: "default", // Added variant
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
        ctaLink: "/orders?dispatchStatus=Late",
        filteredOrders: targetDateNotAchievedArray,
        ctaText: "View List",
        variant: "default", // Added variant
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
        ctaLink: "/orders?dispatchStatus=OnTime&timeframe=thisMonth",
        filteredOrders: targetAchievedInMonthArray,
        ctaText: "View List",
        variant: "success", // Added variant
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
        ctaLink: "/orders?dispatchStatus=Late&timeframe=thisMonth",
        filteredOrders: targetNotAchievedInMonthArray,
        ctaText: "View List",
        variant: "error", // Added variant
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
        ctaLink: "/orders?profit=monthlyTotal",
        filteredOrders: relevantOrdersThisMonth,
        ctaText: "View List",
        variant: "default", // Added variant
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
        ctaLink: "/orders?profit=monthlyRealized",
        filteredOrders: monthlyRealizedProfitArray,
        ctaText: "View List",
        variant: "success", // Added variant
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
        ctaLink: "/orders?profit=monthlyUnrealized",
        filteredOrders: monthlyUnrealizedProfitArray,
        ctaText: "View List",
        variant: "error", // Added variant
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
        ctaLink: "/filter?page=1&paymentReceived=No",
        filteredOrders: accountsReceivableArray,
        ctaText: "View List",
        variant: "error", // Added variant
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
        ctaLink: "/filter?page=1&status=Payment+pending+to+Supplier",
        filteredOrders: supplierPendingPaymentsArray,
        ctaText: "View List",
        variant: "warning", // Added variant
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
        ctaLink: "/orders?goal=monthlyOnTime",
        filteredOrders: targetAchievedInMonthArray, // This now correctly uses the 'this month' achieved array
        ctaText: "View List",
        variant: "default", // Added variant
      },
    ]
  }, [orders, selectedMonth, selectedYear]) // Added selectedMonth and selectedYear to dependencies

  if (loading) {
    return (
      <div>
        <OverviewSkeleton
          rowCount={4}
          columnCount={3}
          filterCount={1}
          cellWidths={["20rem", "20rem", "20rem"]}
          withPagination={false}
          shrinkZero
        />
      </div>
    )
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>
  }

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

      {/* Operational Performance Overview Section */}
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
              change="-" // Static value as change is not calculated
              value={card.value}
              valueDescription={card.valueDescription}
              ctaDescription="Review all underlying data."
              ctaText={card.ctaText} // Pass ctaText for the button label
              ctaLink={card.ctaLink} // Pass the dynamic ctaLink
              data={card.data}
              variant={card.variant} // Pass the variant here
              // Pass the DialogTrigger as a prop to the ProgressBarCard
              triggerButton={
                <DialogTrigger asChild>
                  <Button variant="secondary" className="mt-6 w-full">
                    {card.ctaText}
                  </Button>
                </DialogTrigger>
              }
            />
            {/* Adjusted sm:max-w-4xl for a larger modal on desktop */}
            <DialogContent className="sm:max-w-4xl">
              {/* This is the content that will appear inside the modal */}
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

      {/* Yearly Profits Chart Section */}
      <div className={"my-20 mt-36 border-t border-gray-300 py-10"}>
        <h1
          id="yearly-profits-chart-section"
          className="mb-6 scroll-mt-10 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Yearly Profits Chart
        </h1>
        {/* Pass the fetched orders data to StackedBarChartTrem */}
        <StackedBarChartTrem orders={orders} loading={loading} error={error} />
        <div className={"my-20 h-1 w-full"}>
          <hr />
        </div>
        <StackedBarChartTremGrossProfit
          orders={orders}
          loading={loading}
          error={error}
        />
      </div>
    </section>
  )
}

"use client"

import React, { useMemo, useState } from "react"
import { BarChart } from "@/extra-components/BarChart"
import { Order } from "@/app/overview/page" // Import the Order type

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Define props for StackedBarChartTrem to receive orders, loading, and error
interface StackedBarChartTremProps {
  orders: Order[]
  loading: boolean
  error: string | null
}

export const StackedBarChartTrem: React.FC<StackedBarChartTremProps> = ({
                                                                          orders,
                                                                          loading,
                                                                          error,
                                                                        }) => {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString())

  // Generate years from 2010 to current year in descending order
  const years = useMemo(() => {
    const yearsArray: { label: string; value: string }[] = []
    for (let year = currentYear; year >= 2010; year--) {
      yearsArray.push({ label: year.toString(), value: year.toString() })
    }
    return yearsArray
  }, [currentYear])

  // Process orders data to create chartdata for the stacked bar chart
  const { chartdata, categories } = useMemo(() => {
    const dataMap = new Map<string, { [key: string]: any }>()
    const customerSet = new Set<string>()

    // Helper to get month name abbreviation
    const getMonthAbbreviation = (date: Date) => {
      const options: Intl.DateTimeFormatOptions = { month: 'short', year: '2-digit' };
      return date.toLocaleDateString('en-US', options).replace(' ', ' ');
    };

    // Generate all months for the selected year
    const allMonths: { date: string, _sortDate: number }[] = [];
    for (let month = 0; month < 12; month++) {
      const date = new Date(parseInt(selectedYear), month, 1);
      allMonths.push({
        date: getMonthAbbreviation(date),
        _sortDate: date.getTime(),
      });
    }

    // Initialize dataMap with all months and zero values for all potential customers
    allMonths.forEach(month => {
      dataMap.set(month.date, { ...month });
    });

    // Filter orders for the selected year before processing
    const filteredOrders = orders.filter(order => {
      if (order.poDate) {
        const poDate = new Date(order.poDate);
        return poDate.getFullYear().toString() === selectedYear;
      }
      return false;
    });

    filteredOrders.forEach((order) => {
      const poDate = new Date(order.poDate);
      const monthYearKey = getMonthAbbreviation(poDate);
      const customer = order.customer || "Unknown Customer";
      const netProfit = order.netProfit || 0;

      // Add customer to the set of categories
      customerSet.add(customer);

      if (!dataMap.has(monthYearKey)) {
        // This case should ideally not happen if allMonths covers all relevant dates
        dataMap.set(monthYearKey, { date: monthYearKey, _sortDate: poDate.getTime() });
      }
      const monthData = dataMap.get(monthYearKey)!;
      monthData[customer] = (monthData[customer] || 0) + netProfit;
      dataMap.set(monthYearKey, monthData);
    });

    // Convert map to array and sort by chronological date
    const processedChartData = Array.from(dataMap.values()).sort((a, b) =>
      a._sortDate - b._sortDate
    ).map(({ _sortDate, ...rest }) => rest); // Remove the temporary sortDate property

    // Convert customerSet to an array for categories, and ensure "Unknown Customer" is included if present
    const customerCategories = Array.from(customerSet).sort();

    return { chartdata: processedChartData, categories: customerCategories };
  }, [orders, selectedYear]); // Depend on orders and selectedYear

  if (loading) {
    return <div className="p-4 text-center">Loading chart data...</div>
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>
  }

  // Custom tooltip for BarChart to show sum of netProfit
  const valueFormatter = (number: number) =>
    `$ ${Intl.NumberFormat("us").format(number).toString()}`

  return (
    <div className="flex flex-col gap-16">
      <div className="col-span-full sm:col-span-3 mb-8">
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
      <div className="flex flex-col gap-4">
        <p className="mx-auto font-mono text-sm font-medium">Stacked <span className={"bg-black font-bold p-2 uppercase rounded-xl border text-white"}>Net Profit</span> for <span className={"font-bold"}>{selectedYear}</span></p>
        <BarChart
          type="stacked"
          className="h-80" // Increased height for better visibility
          data={chartdata}
          index="date" // Use 'date' as the index for month-year
          categories={categories} // Dynamically determined categories (customers)
          valueFormatter={valueFormatter} // Formatter for tooltip values
          showLegend={true} // Show legend for customer categories
          yAxisWidth={80} // Adjust Y-axis width if needed
        />
      </div>
    </div>
  )
}

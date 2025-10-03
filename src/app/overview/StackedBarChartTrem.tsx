"use client"

import React, { useMemo, useState } from "react"
import { BarChart } from "@/extra-components/BarChart"
import type { Order } from "@/db/schema" // Use Order type from schema

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

  const years = useMemo(() => {
    const yearsArray: { label: string; value: string }[] = []
    for (let year = currentYear; year >= 2010; year--) {
      yearsArray.push({ label: year.toString(), value: year.toString() })
    }
    return yearsArray
  }, [currentYear])

  const { chartdata, categories } = useMemo(() => {
    const dataMap = new Map<string, { [key: string]: any }>()
    const customerSet = new Set<string>()

    const getMonthAbbreviation = (date: Date) => {
      const options: Intl.DateTimeFormatOptions = { month: 'short', year: '2-digit' };
      return date.toLocaleDateString('en-US', options).replace(' ', ' ');
    };

    const allMonths: { date: string, _sortDate: number }[] = [];
    for (let month = 0; month < 12; month++) {
      const date = new Date(parseInt(selectedYear), month, 1);
      allMonths.push({
        date: getMonthAbbreviation(date),
        _sortDate: date.getTime(),
      });
    }

    allMonths.forEach(month => {
      dataMap.set(month.date, { ...month });
    });

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

      customerSet.add(customer);

      if (!dataMap.has(monthYearKey)) {
        dataMap.set(monthYearKey, { date: monthYearKey, _sortDate: poDate.getTime() });
      }
      const monthData = dataMap.get(monthYearKey)!;
      monthData[customer] = (monthData[customer] || 0) + netProfit;
      dataMap.set(monthYearKey, monthData);
    });

    const processedChartData = Array.from(dataMap.values()).sort((a, b) =>
        a._sortDate - b._sortDate
    ).map(({ _sortDate, ...rest }) => rest);

    const customerCategories = Array.from(customerSet).sort();

    return { chartdata: processedChartData, categories: customerCategories };
  }, [orders, selectedYear]);

  if (loading) {
    return <div className="p-4 text-center">Loading chart data...</div>
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>
  }

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
          <p className="mx-auto font-mono text-sm font-medium">
            Stacked <span className="bg-black font-bold p-2 uppercase rounded-xl border text-white">Net Profit</span> for <span className="font-bold">{selectedYear}</span>
          </p>
          <BarChart
              type="stacked"
              className="h-80"
              data={chartdata}
              index="date"
              categories={categories}
              valueFormatter={valueFormatter}
              showLegend={true}
              yAxisWidth={80}
          />
        </div>
      </div>
  )
}
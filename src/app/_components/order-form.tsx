"use client";

import type * as React from "react";
import { useEffect, useState } from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { statusValues, termValues, currencyValues, yesNoValues } from "../_lib/validations";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { getCustomersForDropdown } from "@/app/customers/_lib/queries";
import type { Customer } from "@/db/schema";

interface OrderFormProps<T extends FieldValues>
    extends Omit<React.ComponentPropsWithRef<"form">, "onSubmit"> {
    children: React.ReactNode;
    form: UseFormReturn<T>;
    onSubmit: (data: T) => void;
}

export function OrderForm<T extends FieldValues>({
                                                     form,
                                                     onSubmit,
                                                     children,
                                                 }: OrderFormProps<T>) {
    const [customers, setCustomers] = useState<Pick<Customer, "id" | "name">[]>([]);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);

    // Load customers on mount
    useEffect(() => {
        async function loadCustomers() {
            try {
                const data = await getCustomersForDropdown();
                setCustomers(data);
            } catch (error) {
                console.error("Failed to load customers:", error);
            } finally {
                setIsLoadingCustomers(false);
            }
        }
        loadCustomers();
    }, []);

    // Watch financial fields for automatic calculation
    const poValue = form.watch("poValue" as FieldPath<T>);
    const costs = form.watch("costs" as FieldPath<T>);
    const customsDutyB = form.watch("customsDutyB" as FieldPath<T>);
    const freightCostC = form.watch("freightCostC" as FieldPath<T>);

    // Calculate profits whenever financial fields change
    useEffect(() => {
        const poVal = Number(poValue) || 0;
        const costVal = Number(costs) || 0;
        const dutyVal = Number(customsDutyB) || 0;
        const freightVal = Number(freightCostC) || 0;

        const grossProfit = poVal - costVal;
        const netProfit = poVal - (costVal + freightVal + dutyVal);
        const profitPercent = poVal !== 0 ? ((poVal - costVal) / poVal) * 100 : 0;
        const profitPercentAfterCost = poVal !== 0
            ? ((poVal - (costVal + freightVal + dutyVal)) / poVal) * 100
            : 0;

        // Update calculated fields
        form.setValue("grossProfit" as FieldPath<T>, parseFloat(grossProfit.toFixed(2)) as any);
        form.setValue("netProfit" as FieldPath<T>, parseFloat(netProfit.toFixed(2)) as any);
        form.setValue("profitPercent" as FieldPath<T>, parseFloat(profitPercent.toFixed(2)) as any);
        form.setValue("profitPercentAfterCost" as FieldPath<T>, parseFloat(profitPercentAfterCost.toFixed(2)) as any);
    }, [poValue, costs, customsDutyB, freightCostC, form]);

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4 px-4"
            >
                {/* Part Information */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Part Information</h3>

                    <FormField
                        control={form.control}
                        name={"partNumber" as FieldPath<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Part Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="C20207000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={"description" as FieldPath<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter part description"
                                        className="resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={"qty" as FieldPath<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="1"
                                        step="1"
                                        min="0"
                                        {...field}
                                        value={field.value || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(value === "" ? "" : Number(value));
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Customer & PO Information */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Customer & PO</h3>

                    <FormField
                        control={form.control}
                        name={"customer" as FieldPath<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Customer</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={isLoadingCustomers}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingCustomers ? "Loading customers..." : "Select customer"} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectGroup>
                                            {customers.map((customer) => (
                                                <SelectItem key={customer.id} value={customer.name}>
                                                    {customer.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={"custPo" as FieldPath<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Customer PO</FormLabel>
                                <FormControl>
                                    <Input placeholder="PO 9075" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={"poDate" as FieldPath<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>PO Date</FormLabel>
                                <FormControl>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-full justify-start text-left font-normal ${
                                                    !field.value && "text-muted-foreground"
                                                }`}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value
                                                    ? format(new Date(field.value), "yyyy-MM-dd")
                                                    : "Select date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={(date) =>
                                                    field.onChange(
                                                        date ? format(date, "yyyy-MM-dd") : ""
                                                    )
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={"term" as FieldPath<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Payment Terms</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select terms" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectGroup>
                                            {termValues.map((term) => (
                                                <SelectItem key={term} value={term}>
                                                    {term}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Financial Information */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Financial</h3>

                    <FormField
                        control={form.control}
                        name={"currency" as FieldPath<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Currency</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value || "USD"}
                                    disabled
                                >
                                    <FormControl>
                                        <SelectTrigger className="bg-muted">
                                            <SelectValue placeholder="USD (Default)" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectGroup>
                                            {currencyValues.map((currency) => (
                                                <SelectItem key={currency} value={currency}>
                                                    {currency}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={"poValue" as FieldPath<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>PO Value</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="100"
                                        step="0.01"
                                        min="0"
                                        {...field}
                                        value={field.value || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(value === "" ? "" : Number(value));
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={"costs" as FieldPath<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Costs</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="70"
                                        step="0.01"
                                        min="0"
                                        {...field}
                                        value={field.value || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(value === "" ? "" : Number(value));
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={"customsDutyB" as FieldPath<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Customs Duty (B)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        step="0.01"
                                        min="0"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(value === "" ? null : Number(value));
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={"freightCostC" as FieldPath<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Freight Cost (C)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        step="0.01"
                                        min="0"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(value === "" ? null : Number(value));
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Calculated Fields - Read Only */}
                    <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                        <p className="text-xs font-medium text-muted-foreground">Calculated Values</p>

                        <FormField
                            control={form.control}
                            name={"grossProfit" as FieldPath<T>}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gross Profit</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value ?? ""}
                                            disabled
                                            className="bg-background"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name={"profitPercent" as FieldPath<T>}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Profit Percent (%)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value ?? ""}
                                            disabled
                                            className="bg-background"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name={"netProfit" as FieldPath<T>}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Net Profit</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value ?? ""}
                                            disabled
                                            className="bg-background"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name={"profitPercentAfterCost" as FieldPath<T>}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Profit Percent After Cost (%)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value ?? ""}
                                            disabled
                                            className="bg-background"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Payment Status */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Payment Status</h3>

                    <FormField
                        control={form.control}
                        name={"paymentReceived" as FieldPath<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Payment Received</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectGroup>
                                            {yesNoValues.map((value) => (
                                                <SelectItem key={value} value={value}>
                                                    {value}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={"investorPaid" as FieldPath<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Investor Paid</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectGroup>
                                            {yesNoValues.map((value) => (
                                                <SelectItem key={value} value={value}>
                                                    {value}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Supplier Information */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Supplier</h3>

                    <FormField
                        control={form.control}
                        name={"supplier" as FieldPath<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Supplier</FormLabel>
                                <FormControl>
                                    <Input placeholder="GMF AeroAsia Tbk" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={"supplierPo" as FieldPath<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Supplier PO</FormLabel>
                                <FormControl>
                                    <Input placeholder="PO240001" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={"supplierPoDate" as FieldPath<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Supplier PO Date</FormLabel>
                                <FormControl>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-full justify-start text-left font-normal ${
                                                    !field.value && "text-muted-foreground"
                                                }`}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value
                                                    ? format(new Date(field.value), "yyyy-MM-dd")
                                                    : "Select date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={(date) =>
                                                    field.onChange(
                                                        date ? format(date, "yyyy-MM-dd") : ""
                                                    )
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Status & Shipping */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Status & Shipping</h3>

                    <FormField
                        control={form.control}
                        name={"status" as FieldPath<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="max-h-[300px] overflow-y-auto">
                                        <SelectGroup>
                                            {[...statusValues].map((status) => (
                                                <SelectItem key={status} value={status} className="text-xs">
                                                    {status}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={"awbToUae" as FieldPath<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>AWB to UAE</FormLabel>
                                <FormControl>
                                    <Input placeholder="8453242781" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={"targetDate" as FieldPath<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Target Date</FormLabel>
                                <FormControl>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-full justify-start text-left font-normal ${
                                                    !field.value && "text-muted-foreground"
                                                }`}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value
                                                    ? format(new Date(field.value), "yyyy-MM-dd")
                                                    : "Select date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={(date) =>
                                                    field.onChange(
                                                        date ? format(date, "yyyy-MM-dd") : ""
                                                    )
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={"dispatchDate" as FieldPath<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dispatch Date</FormLabel>
                                <FormControl>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-full justify-start text-left font-normal ${
                                                    !field.value && "text-muted-foreground"
                                                }`}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value
                                                    ? format(new Date(field.value), "yyyy-MM-dd")
                                                    : "Select date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={(date) =>
                                                    field.onChange(
                                                        date ? format(date, "yyyy-MM-dd") : ""
                                                    )
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Additional</h3>

                    <FormField
                        control={form.control}
                        name={"remarks" as FieldPath<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Remarks</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter any remarks"
                                        className="resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={"stability" as FieldPath<T>}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Stability</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="10"
                                        step="0.1"
                                        min="0"
                                        max="10"
                                        {...field}
                                        value={field.value || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(value === "" ? "" : Number(value));
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {children}
            </form>
        </Form>
    );
}
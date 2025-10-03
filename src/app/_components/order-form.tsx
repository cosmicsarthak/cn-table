"use client";

import type * as React from "react";
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
                                <FormControl>
                                    <Input placeholder="TTK" {...field} />
                                </FormControl>
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
                                    <Input type="text" placeholder="12/9/2024" {...field} />
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select currency" />
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
                                    <Input type="text" placeholder="12/9/2024" {...field} />
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
                                    <Input type="text" placeholder="12/31/2024" {...field} />
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
                                    <Input type="text" placeholder="12/31/2024" {...field} />
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
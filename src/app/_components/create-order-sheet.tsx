"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Plus } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

import { createOrder } from "../_lib/actions";
import type { CreateOrderSchema } from "../_lib/validations";
import { createOrderSchema } from "../_lib/validations";
import { OrderForm } from "./order-form";
import type { Order, Customer } from "@/db/schema";

interface CreateOrderSheetProps extends React.ComponentPropsWithRef<typeof Sheet> {
    defaultValues?: Order;
    customers: Pick<Customer, "id" | "name">[];
    children?: React.ReactNode;
}

export function CreateOrderSheet({
                                     defaultValues,
                                     customers,
                                     children,
                                     ...props
                                 }: CreateOrderSheetProps) {
    const [open, setOpen] = React.useState(false);
    const [isPending, startTransition] = React.useTransition();

    // Determine if we're using the sheet with a trigger or controlled mode
    const isControlled = props.open !== undefined;
    const hasCustomTrigger = Boolean(children);
    const sheetOpen = isControlled ? props.open : open;
    const setSheetOpen = isControlled ? props.onOpenChange : setOpen;

    const form = useForm<CreateOrderSchema>({
        resolver: zodResolver(createOrderSchema),
        defaultValues: defaultValues ? {
            partNumber: defaultValues.partNumber ?? "",
            description: defaultValues.description ?? "",
            qty: defaultValues.qty ?? 1,
            poDate: defaultValues.poDate ?? "",
            term: defaultValues.term,
            customer: defaultValues.customer ?? "",
            custPo: defaultValues.custPo ?? "",
            status: defaultValues.status,
            remarks: defaultValues.remarks ?? "",
            currency: defaultValues.currency || "USD",
            poValue: defaultValues.poValue ?? 0,
            costs: defaultValues.costs ?? 0,
            customsDutyB: defaultValues.customsDutyB ?? null,
            freightCostC: defaultValues.freightCostC ?? null,
            grossProfit: defaultValues.grossProfit ?? null,
            profitPercent: defaultValues.profitPercent ?? null,
            netProfit: defaultValues.netProfit ?? null,
            profitPercentAfterCost: defaultValues.profitPercentAfterCost ?? null,
            paymentReceived: defaultValues.paymentReceived,
            investorPaid: defaultValues.investorPaid,
            targetDate: defaultValues.targetDate ?? "",
            dispatchDate: defaultValues.dispatchDate ?? "",
            supplierPoDate: defaultValues.supplierPoDate ?? "",
            supplier: defaultValues.supplier ?? "",
            supplierPo: defaultValues.supplierPo ?? "",
            awbToUae: defaultValues.awbToUae ?? "",
            stability: defaultValues.stability ?? 10,
        } : {
            partNumber: "",
            description: "",
            qty: 1,
            poDate: "",
            term: "PREPAY",
            customer: "",
            custPo: "",
            status: "Order yet to be processed",
            remarks: "",
            currency: "USD",
            poValue: 0,
            costs: 0,
            customsDutyB: null,
            freightCostC: null,
            grossProfit: null,
            profitPercent: null,
            netProfit: null,
            profitPercentAfterCost: null,
            paymentReceived: "No",
            investorPaid: "No",
            targetDate: "",
            dispatchDate: "",
            supplierPoDate: "",
            supplier: "",
            supplierPo: "",
            awbToUae: "",
            stability: 10,
        },
    });

    // Reset form when defaultValues change or sheet opens
    React.useEffect(() => {
        if (sheetOpen && defaultValues) {
            form.reset({
                partNumber: defaultValues.partNumber ?? "",
                description: defaultValues.description ?? "",
                qty: defaultValues.qty ?? 1,
                poDate: defaultValues.poDate ?? "",
                term: defaultValues.term,
                customer: defaultValues.customer ?? "",
                custPo: defaultValues.custPo ?? "",
                status: defaultValues.status,
                remarks: defaultValues.remarks ?? "",
                currency: defaultValues.currency || "USD",
                poValue: defaultValues.poValue ?? 0,
                costs: defaultValues.costs ?? 0,
                customsDutyB: defaultValues.customsDutyB ?? null,
                freightCostC: defaultValues.freightCostC ?? null,
                grossProfit: defaultValues.grossProfit ?? null,
                profitPercent: defaultValues.profitPercent ?? null,
                netProfit: defaultValues.netProfit ?? null,
                profitPercentAfterCost: defaultValues.profitPercentAfterCost ?? null,
                paymentReceived: defaultValues.paymentReceived,
                investorPaid: defaultValues.investorPaid,
                targetDate: defaultValues.targetDate ?? "",
                dispatchDate: defaultValues.dispatchDate ?? "",
                supplierPoDate: defaultValues.supplierPoDate ?? "",
                supplier: defaultValues.supplier ?? "",
                supplierPo: defaultValues.supplierPo ?? "",
                awbToUae: defaultValues.awbToUae ?? "",
                stability: defaultValues.stability ?? 10,
            });
        }
    }, [sheetOpen, defaultValues, form]);

    function onSubmit(input: CreateOrderSchema) {
        startTransition(async () => {
            const poValue = input.poValue || 0;
            const costs = input.costs || 0;
            const customsDutyB = input.customsDutyB || 0;
            const freightCostC = input.freightCostC || 0;

            const grossProfit = poValue - costs;
            const netProfit = poValue - (costs + freightCostC + customsDutyB);
            const profitPercent = poValue !== 0 ? ((poValue - costs) / poValue) * 100 : 0;
            const profitPercentAfterCost = poValue !== 0
                ? ((poValue - (costs + freightCostC + customsDutyB)) / poValue) * 100
                : 0;

            const { error } = await createOrder({
                ...input,
                grossProfit: parseFloat(grossProfit.toFixed(2)),
                netProfit: parseFloat(netProfit.toFixed(2)),
                profitPercent: parseFloat(profitPercent.toFixed(2)),
                profitPercentAfterCost: parseFloat(profitPercentAfterCost.toFixed(2)),
            });

            if (error) {
                toast.error(error);
                return;
            }

            form.reset();
            setSheetOpen?.(false);
            toast.success("Order created successfully");
        });
    }

    const sheetContent = (
        <SheetContent className="flex flex-col gap-6 sm:max-w-2xl overflow-y-auto">
            <SheetHeader className="text-left">
                <SheetTitle>
                    {defaultValues ? "Duplicate Order" : "Create Order"}
                </SheetTitle>
                <SheetDescription>
                    {defaultValues
                        ? "Review and modify the details to create a new order based on this one"
                        : "Fill in the details below to create a new order. Profit calculations will be computed automatically."
                    }
                </SheetDescription>
            </SheetHeader>
            <OrderForm form={form} onSubmit={onSubmit} customers={customers}>
                <SheetFooter className="gap-2 pt-2 sm:space-x-0">
                    <SheetClose asChild>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </SheetClose>
                    <Button disabled={isPending}>
                        {isPending && <Loader className="animate-spin" />}
                        Create
                    </Button>
                </SheetFooter>
            </OrderForm>
        </SheetContent>
    );

    // If controlled (used with duplicate), don't show trigger
    if (isControlled) {
        return (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                {sheetContent}
            </Sheet>
        );
    }

    // If custom trigger is provided (like FAB), use it
    if (hasCustomTrigger) {
        return (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                    {children}
                </SheetTrigger>
                {sheetContent}
            </Sheet>
        );
    }

    // Otherwise show default trigger button
    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus />
                    New order
                </Button>
            </SheetTrigger>
            {sheetContent}
        </Sheet>
    );
}
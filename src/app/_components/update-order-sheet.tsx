"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
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
} from "@/components/ui/sheet";
import type { Order } from "@/db/schema";

import { updateOrder } from "../_lib/actions";
import { type UpdateOrderSchema, updateOrderSchema } from "../_lib/validations";
import { OrderForm } from "./order-form";

interface UpdateOrderSheetProps
    extends React.ComponentPropsWithRef<typeof Sheet> {
    order: Order | null;
}

export function UpdateOrderSheet({ order, ...props }: UpdateOrderSheetProps) {
    const [isPending, startTransition] = React.useTransition();

    const form = useForm<UpdateOrderSchema>({
        resolver: zodResolver(updateOrderSchema),
        defaultValues: {
            partNumber: order?.partNumber ?? "",
            description: order?.description ?? "",
            qty: order?.qty ?? 0,
            poDate: order?.poDate ?? "",
            term: order?.term,
            customer: order?.customer ?? "",
            custPo: order?.custPo ?? "",
            status: order?.status,
            remarks: order?.remarks ?? "",
            currency: order?.currency,
            poValue: order?.poValue ?? 0,
            costs: order?.costs ?? 0,
            customsDutyB: order?.customsDutyB ?? null,
            freightCostC: order?.freightCostC ?? null,
            paymentReceived: order?.paymentReceived,
            investorPaid: order?.investorPaid,
            targetDate: order?.targetDate ?? "",
            dispatchDate: order?.dispatchDate ?? "",
            supplierPoDate: order?.supplierPoDate ?? "",
            supplier: order?.supplier ?? "",
            supplierPo: order?.supplierPo ?? "",
            awbToUae: order?.awbToUae ?? "",
            stability: order?.stability ?? 10,
        },
    });

    function onSubmit(input: UpdateOrderSchema) {
        startTransition(async () => {
            if (!order) return;

            const { error } = await updateOrder({
                sn: order.sn,
                ...input,
            });

            if (error) {
                toast.error(error);
                return;
            }

            form.reset(input);
            props.onOpenChange?.(false);
            toast.success("Order updated");
        });
    }

    return (
        <Sheet {...props}>
            <SheetContent className="flex flex-col gap-6 sm:max-w-2xl overflow-y-auto">
                <SheetHeader className="text-left">
                    <SheetTitle>Update Order</SheetTitle>
                    <SheetDescription>
                        Update the order details and save the changes
                    </SheetDescription>
                </SheetHeader>
                <OrderForm form={form} onSubmit={onSubmit}>
                    <SheetFooter className="gap-2 pt-2 sm:space-x-0">
                        <SheetClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </SheetClose>
                        <Button disabled={isPending}>
                            {isPending && (
                                <Loader
                                    className="mr-2 size-4 animate-spin"
                                    aria-hidden="true"
                                />
                            )}
                            Save
                        </Button>
                    </SheetFooter>
                </OrderForm>
            </SheetContent>
        </Sheet>
    );
}
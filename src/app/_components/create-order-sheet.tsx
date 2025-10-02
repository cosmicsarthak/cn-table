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

export function CreateOrderSheet() {
    const [open, setOpen] = React.useState(false);
    const [isPending, startTransition] = React.useTransition();

    const form = useForm<CreateOrderSchema>({
        resolver: zodResolver(createOrderSchema),
        defaultValues: {
            remarks: "",
            targetDate: "",
            dispatchDate: "",
            awbToUae: "",
            stability: 10,
        },
    });

    function onSubmit(input: CreateOrderSchema) {
        startTransition(async () => {
            const { error } = await createOrder(input);

            if (error) {
                toast.error(error);
                return;
            }

            form.reset();
            setOpen(false);
            toast.success("Order created");
        });
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus />
                    New order
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col gap-6 sm:max-w-2xl overflow-y-auto">
                <SheetHeader className="text-left">
                    <SheetTitle>Create Order</SheetTitle>
                    <SheetDescription>
                        Fill in the details below to create a new order
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
                            {isPending && <Loader className="animate-spin" />}
                            Create
                        </Button>
                    </SheetFooter>
                </OrderForm>
            </SheetContent>
        </Sheet>
    );
}
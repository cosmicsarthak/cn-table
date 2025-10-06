"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Pencil, Trash } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Customer } from "@/db/schema";

import { deleteCustomer, updateCustomer } from "../_lib/actions";
import { updateCustomerSchema, type UpdateCustomerSchema } from "../_lib/validations";

interface UpdateCustomerDialogProps {
    customer: Customer;
    onSuccess?: () => void;
}

export function UpdateCustomerDialog({ customer, onSuccess }: UpdateCustomerDialogProps) {
    const [open, setOpen] = React.useState(false);
    const [isPending, startTransition] = React.useTransition();

    const form = useForm<UpdateCustomerSchema>({
        resolver: zodResolver(updateCustomerSchema),
        defaultValues: {
            name: customer.name,
        },
    });

    React.useEffect(() => {
        if (open) {
            form.reset({ name: customer.name });
        }
    }, [open, customer.name, form]);

    function onSubmit(input: UpdateCustomerSchema) {
        startTransition(async () => {
            const { error } = await updateCustomer({
                id: customer.id,
                ...input,
            });

            if (error) {
                toast.error(error);
                return;
            }

            setOpen(false);
            toast.success("Customer updated successfully");
            onSuccess?.();
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Customer</DialogTitle>
                    <DialogDescription>
                        Update the customer name. Customer names must be unique.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Customer Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter customer name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="gap-2 sm:space-x-0">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button disabled={isPending}>
                                {isPending && <Loader className="animate-spin" />}
                                Update
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

interface DeleteCustomerDialogProps {
    customer: Customer;
    onSuccess?: () => void;
}

export function DeleteCustomerDialog({ customer, onSuccess }: DeleteCustomerDialogProps) {
    const [open, setOpen] = React.useState(false);
    const [isPending, startTransition] = React.useTransition();

    function onDelete() {
        startTransition(async () => {
            const { error } = await deleteCustomer({ id: customer.id });

            if (error) {
                toast.error(error);
                return;
            }

            setOpen(false);
            toast.success("Customer deleted successfully");
            onSuccess?.();
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Trash className="h-4 w-4 text-destructive" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Customer</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <span className="font-semibold">{customer.name}</span>?
                        This action cannot be undone. Note: Orders associated with this customer will not be deleted.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:space-x-0">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={onDelete} disabled={isPending}>
                        {isPending && <Loader className="animate-spin" />}
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
"use server";

import { eq } from "drizzle-orm";
import { revalidateTag, unstable_noStore } from "next/cache";
import { db } from "@/db/index";
import { customers } from "@/db/schema";
import { getErrorMessage } from "@/lib/handle-error";

import { checkCustomerExists } from "./queries";
import type { CreateCustomerSchema, UpdateCustomerSchema } from "./validations";

export async function createCustomer(input: CreateCustomerSchema) {
    unstable_noStore();
    try {
        // Check if customer already exists (case-insensitive)
        const exists = await checkCustomerExists(input.name);

        if (exists) {
            return {
                data: null,
                error: "A customer with this name already exists (customer names are case-insensitive)",
            };
        }

        await db.insert(customers).values({
            name: input.name,
        });

        revalidateTag("customers");
        revalidateTag("customers-list");
        revalidateTag("customers-dropdown");

        return {
            data: null,
            error: null,
        };
    } catch (err) {
        return {
            data: null,
            error: getErrorMessage(err),
        };
    }
}

export async function updateCustomer(input: UpdateCustomerSchema & { id: number }) {
    unstable_noStore();
    try {
        // Get the current customer
        const currentCustomer = await db
            .select()
            .from(customers)
            .where(eq(customers.id, input.id))
            .limit(1)
            .then((res) => res[0]);

        if (!currentCustomer) {
            return {
                data: null,
                error: "Customer not found",
            };
        }

        // If name is being changed, check if new name already exists
        if (input.name.toLowerCase() !== currentCustomer.name.toLowerCase()) {
            const exists = await checkCustomerExists(input.name);
            if (exists) {
                return {
                    data: null,
                    error: "A customer with this name already exists (customer names are case-insensitive)",
                };
            }
        }

        await db
            .update(customers)
            .set({
                name: input.name,
                updatedAt: new Date(),
            })
            .where(eq(customers.id, input.id));

        revalidateTag("customers");
        revalidateTag("customers-list");
        revalidateTag("customers-dropdown");
        revalidateTag(`customer-${currentCustomer.name}`);
        revalidateTag(`customer-orders-${currentCustomer.name}`);

        return {
            data: null,
            error: null,
        };
    } catch (err) {
        return {
            data: null,
            error: getErrorMessage(err),
        };
    }
}

export async function deleteCustomer(input: { id: number }) {
    unstable_noStore();
    try {
        // Get customer name before deleting
        const customer = await db
            .select()
            .from(customers)
            .where(eq(customers.id, input.id))
            .limit(1)
            .then((res) => res[0]);

        if (!customer) {
            return {
                data: null,
                error: "Customer not found",
            };
        }

        await db.delete(customers).where(eq(customers.id, input.id));

        revalidateTag("customers");
        revalidateTag("customers-list");
        revalidateTag("customers-dropdown");
        revalidateTag(`customer-${customer.name}`);
        revalidateTag(`customer-orders-${customer.name}`);

        return {
            data: null,
            error: null,
        };
    } catch (err) {
        return {
            data: null,
            error: getErrorMessage(err),
        };
    }
}
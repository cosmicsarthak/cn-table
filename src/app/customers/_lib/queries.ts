// src/app/customers/_lib/queries.ts
import "server-only";

import { asc, count, eq, like, sql } from "drizzle-orm";
import { db } from "@/db";
import { customers, orders } from "@/db/schema";
import { unstable_cache } from "@/lib/unstable-cache";

export async function getCustomers() {
    return await unstable_cache(
        async () => {
            try {
                const data = await db
                    .select({
                        id: customers.id,
                        name: customers.name,
                        createdAt: customers.createdAt,
                        updatedAt: customers.updatedAt,
                        orderCount: count(orders.sn),
                    })
                    .from(customers)
                    .leftJoin(orders, eq(customers.name, orders.customer))
                    .groupBy(customers.id)
                    .orderBy(asc(customers.name));

                return data;
            } catch (err) {
                console.error("Error fetching customers:", err);
                return [];
            }
        },
        ["customers-list"],
        {
            revalidate: 60,
            tags: ["customers"],
        }
    )();
}

export async function getCustomerByName(name: string) {
    return await unstable_cache(
        async () => {
            try {
                const customer = await db
                    .select()
                    .from(customers)
                    .where(eq(customers.name, name))
                    .limit(1)
                    .then((res) => res[0] ?? null);

                return customer;
            } catch (err) {
                console.error("Error fetching customer:", err);
                return null;
            }
        },
        [`customer-${name}`],
        {
            revalidate: 60,
            tags: ["customers"],
        }
    )();
}

export async function getCustomerOrders(customerName: string) {
    return await unstable_cache(
        async () => {
            try {
                const data = await db
                    .select()
                    .from(orders)
                    .where(eq(orders.customer, customerName))
                    .orderBy(asc(orders.poDate));

                return data;
            } catch (err) {
                console.error("Error fetching customer orders:", err);
                return [];
            }
        },
        [`customer-orders-${customerName}`],
        {
            revalidate: 60,
            tags: ["orders", "customers"],
        }
    )();
}

export async function checkCustomerExists(name: string) {
    try {
        // Normalize the input: trim and convert to lowercase
        const normalizedName = name.trim().toLowerCase();

        // Check if any customer exists with this name (case-insensitive)
        const existing = await db
            .select({ id: customers.id })
            .from(customers)
            .where(sql`LOWER(TRIM(${customers.name})) = ${normalizedName}`)
            .limit(1);

        return existing.length > 0;
    } catch (err) {
        console.error("Error checking customer existence:", err);
        return false;
    }
}

export async function getCustomersForDropdown() {
    return await unstable_cache(
        async () => {
            try {
                const data = await db
                    .select({
                        id: customers.id,
                        name: customers.name,
                    })
                    .from(customers)
                    .orderBy(asc(customers.name));

                return data;
            } catch (err) {
                console.error("Error fetching customers for dropdown:", err);
                return [];
            }
        },
        ["customers-dropdown"],
        {
            revalidate: 300,
            tags: ["customers"],
        }
    )();
}
"use server";

import { asc, desc, eq, inArray, not } from "drizzle-orm";
import { revalidateTag, unstable_noStore } from "next/cache";
import { db } from "@/db/index";
import { type Order, orders } from "@/db/schema";
import { takeFirstOrThrow } from "@/db/utils";

import { getErrorMessage } from "@/lib/handle-error";

import { generateRandomOrder } from "./utils";
import type { CreateOrderSchema, UpdateOrderSchema } from "./validations";

export async function seedOrders(input: { count: number }) {
    const count = input.count ?? 100;

    try {
        const allOrders: Order[] = [];

        for (let i = 0; i < count; i++) {
            allOrders.push(generateRandomOrder(i + 1));
        }

        await db.delete(orders);

        console.log("📦 Inserting orders", allOrders.length);

        await db.insert(orders).values(allOrders).onConflictDoNothing();
    } catch (err) {
        console.error(err);
    }
}

export async function createOrder(input: CreateOrderSchema) {
    unstable_noStore();
    try {
        await db.transaction(async (tx) => {
            const maxSn = await tx
                .select({ sn: orders.sn })
                .from(orders)
                .orderBy(desc(orders.sn))
                .limit(1)
                .then((res) => res[0]?.sn ?? 0);

            // Calculate profits
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

            const newOrder = await tx
                .insert(orders)
                .values({
                    sn: maxSn + 1,
                    ...input,
                    grossProfit: parseFloat(grossProfit.toFixed(2)),
                    netProfit: parseFloat(netProfit.toFixed(2)),
                    profitPercent: parseFloat(profitPercent.toFixed(2)),
                    profitPercentAfterCost: parseFloat(profitPercentAfterCost.toFixed(2)),
                    lastEdited: new Date().toLocaleString(),
                })
                .returning({ sn: orders.sn })
                .then(takeFirstOrThrow);

            // Delete the oldest order to keep the total number constant
            await tx.delete(orders).where(
                eq(
                    orders.sn,
                    (
                        await tx
                            .select({
                                sn: orders.sn,
                            })
                            .from(orders)
                            .limit(1)
                            .where(not(eq(orders.sn, newOrder.sn)))
                            .orderBy(asc(orders.createdAt))
                            .then(takeFirstOrThrow)
                    ).sn,
                ),
            );
        });

        revalidateTag("orders");
        revalidateTag("order-status-counts");
        revalidateTag("order-customer-counts");

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

export async function updateOrder(input: UpdateOrderSchema & { sn: number }) {
    unstable_noStore();
    try {
        const data = await db
            .update(orders)
            .set({
                ...input,
                lastEdited: new Date().toLocaleString(),
            })
            .where(eq(orders.sn, input.sn))
            .returning({
                status: orders.status,
            })
            .then(takeFirstOrThrow);

        revalidateTag("orders");
        if (data.status === input.status) {
            revalidateTag("order-status-counts");
        }

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

export async function updateOrders(input: {
    sns: number[];
    status?: Order["status"];
    paymentReceived?: Order["paymentReceived"];
    investorPaid?: Order["investorPaid"];
}) {
    unstable_noStore();
    try {
        const data = await db
            .update(orders)
            .set({
                status: input.status,
                paymentReceived: input.paymentReceived,
                investorPaid: input.investorPaid,
                lastEdited: new Date().toLocaleString(),
            })
            .where(inArray(orders.sn, input.sns))
            .returning({
                status: orders.status,
            })
            .then(takeFirstOrThrow);

        revalidateTag("orders");
        if (data.status === input.status) {
            revalidateTag("order-status-counts");
        }

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

export async function deleteOrder(input: { sn: number }) {
    unstable_noStore();
    try {
        await db.transaction(async (tx) => {
            await tx.delete(orders).where(eq(orders.sn, input.sn));

            // Create a new order for the deleted one
            const maxSn = await tx
                .select({ sn: orders.sn })
                .from(orders)
                .orderBy(desc(orders.sn))
                .limit(1)
                .then((res) => res[0]?.sn ?? 0);

            await tx.insert(orders).values(generateRandomOrder(maxSn + 1));
        });

        revalidateTag("orders");
        revalidateTag("order-status-counts");
        revalidateTag("order-customer-counts");

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

export async function deleteOrders(input: { sns: number[] }) {
    unstable_noStore();
    try {
        await db.transaction(async (tx) => {
            await tx.delete(orders).where(inArray(orders.sn, input.sns));

            // Create new orders for the deleted ones
            const maxSn = await tx
                .select({ sn: orders.sn })
                .from(orders)
                .orderBy(desc(orders.sn))
                .limit(1)
                .then((res) => res[0]?.sn ?? 0);

            await tx
                .insert(orders)
                .values(
                    input.sns.map((_, index) => generateRandomOrder(maxSn + index + 1)),
                );
        });

        revalidateTag("orders");
        revalidateTag("order-status-counts");
        revalidateTag("order-customer-counts");

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
"use server";

import { asc, eq, inArray, not } from "drizzle-orm";
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
      // Get the next serial number
      const maxSn = await tx
          .select({ sn: orders.sn })
          .from(orders)
          .orderBy(asc(orders.sn))
          .limit(1)
          .then((res) => res[0]?.sn ?? 0);

      const newOrder = await tx
          .insert(orders)
          .values({
            sn: maxSn + 1,
            partNumber: input.partNumber,
            description: input.description,
            qty: input.qty,
            poDate: input.poDate,
            term: input.term,
            customer: input.customer,
            custPo: input.custPo,
            status: input.status,
            remarks: input.remarks,
            currency: input.currency,
            poValue: input.poValue,
            costs: input.costs,
            customsDutyB: input.customsDutyB,
            freightCostC: input.freightCostC,
            paymentReceived: input.paymentReceived,
            investorPaid: input.investorPaid,
            targetDate: input.targetDate,
            dispatchDate: input.dispatchDate,
            supplierPoDate: input.supplierPoDate,
            supplier: input.supplier,
            supplierPo: input.supplierPo,
            awbToUae: input.awbToUae,
            stability: input.stability,
            lastEdited: new Date().toLocaleString(),
            // Calculated fields can be null initially
            grossProfit: input.poValue - input.costs,
            profitPercent: ((input.poValue - input.costs) / input.poValue) * 100,
          })
          .returning({
            id: orders.id,
          })
          .then(takeFirstOrThrow);

      // Delete an order to keep the total number constant
      await tx.delete(orders).where(
          eq(
              orders.id,
              (
                  await tx
                      .select({
                        id: orders.id,
                      })
                      .from(orders)
                      .limit(1)
                      .where(not(eq(orders.id, newOrder.id)))
                      .orderBy(asc(orders.createdAt))
                      .then(takeFirstOrThrow)
              ).id,
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

export async function updateOrder(input: UpdateOrderSchema & { id: string }) {
  unstable_noStore();
  try {
    const data = await db
        .update(orders)
        .set({
          ...input,
          lastEdited: new Date().toLocaleString(),
        })
        .where(eq(orders.id, input.id))
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
  ids: string[];
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
        .where(inArray(orders.id, input.ids))
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

export async function deleteOrder(input: { id: string }) {
  unstable_noStore();
  try {
    await db.transaction(async (tx) => {
      await tx.delete(orders).where(eq(orders.id, input.id));

      // Create a new order for the deleted one
      const maxSn = await tx
          .select({ sn: orders.sn })
          .from(orders)
          .orderBy(asc(orders.sn))
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

export async function deleteOrders(input: { ids: string[] }) {
  unstable_noStore();
  try {
    await db.transaction(async (tx) => {
      await tx.delete(orders).where(inArray(orders.id, input.ids));

      // Create new orders for the deleted ones
      const maxSn = await tx
          .select({ sn: orders.sn })
          .from(orders)
          .orderBy(asc(orders.sn))
          .limit(1)
          .then((res) => res[0]?.sn ?? 0);

      await tx
          .insert(orders)
          .values(
              input.ids.map((_, index) => generateRandomOrder(maxSn + index + 1)),
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
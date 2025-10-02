import "server-only";

import {
    and,
    asc,
    count,
    desc,
    gt,
    gte,
    ilike,
    inArray,
    lte,
    sql,
} from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";

import { filterColumns } from "@/lib/filter-columns";
import { unstable_cache } from "@/lib/unstable-cache";

import type { GetOrdersSchema } from "./validations";

export async function getOrders(input: GetOrdersSchema) {
    return await unstable_cache(
        async () => {
            try {
                const offset = (input.page - 1) * input.perPage;
                const advancedTable =
                    input.filterFlag === "advancedFilters" ||
                    input.filterFlag === "commandFilters";

                const advancedWhere = filterColumns({
                    table: orders,
                    filters: input.filters,
                    joinOperator: input.joinOperator,
                });

                const where = advancedTable
                    ? advancedWhere
                    : and(
                        input.partNumber
                            ? ilike(orders.partNumber, `%${input.partNumber}%`)
                            : undefined,
                        input.customer
                            ? ilike(orders.customer, `%${input.customer}%`)
                            : undefined,
                        input.supplier
                            ? ilike(orders.supplier, `%${input.supplier}%`)
                            : undefined,
                        input.status.length > 0
                            ? inArray(orders.status, input.status)
                            : undefined,
                        input.term.length > 0
                            ? inArray(orders.term, input.term)
                            : undefined,
                        input.currency.length > 0
                            ? inArray(orders.currency, input.currency)
                            : undefined,
                        input.paymentReceived.length > 0
                            ? inArray(orders.paymentReceived, input.paymentReceived)
                            : undefined,
                        input.poValue.length > 0
                            ? and(
                                input.poValue[0]
                                    ? gte(orders.poValue, input.poValue[0])
                                    : undefined,
                                input.poValue[1]
                                    ? lte(orders.poValue, input.poValue[1])
                                    : undefined,
                            )
                            : undefined,
                        input.poDate.length > 0
                            ? and(
                                input.poDate[0]
                                    ? gte(orders.poDate, input.poDate[0])
                                    : undefined,
                                input.poDate[1]
                                    ? lte(orders.poDate, input.poDate[1])
                                    : undefined,
                            )
                            : undefined,
                    );

                const orderBy =
                    input.sort.length > 0
                        ? input.sort.map((item) =>
                            item.desc ? desc(orders[item.id]) : asc(orders[item.id]),
                        )
                        : [desc(orders.createdAt)];

                const { data, total } = await db.transaction(async (tx) => {
                    const data = await tx
                        .select()
                        .from(orders)
                        .limit(input.perPage)
                        .offset(offset)
                        .where(where)
                        .orderBy(...orderBy);

                    const total = await tx
                        .select({
                            count: count(),
                        })
                        .from(orders)
                        .where(where)
                        .execute()
                        .then((res) => res[0]?.count ?? 0);

                    return {
                        data,
                        total,
                    };
                });

                const pageCount = Math.ceil(total / input.perPage);
                return { data, pageCount };
            } catch (_err) {
                return { data: [], pageCount: 0 };
            }
        },
        [JSON.stringify(input)],
        {
            revalidate: 1,
            tags: ["orders"],
        },
    )();
}

export async function getOrderStatusCounts() {
    return unstable_cache(
        async () => {
            try {
                return await db
                    .select({
                        status: orders.status,
                        count: count(),
                    })
                    .from(orders)
                    .groupBy(orders.status)
                    .having(gt(count(orders.status), 0))
                    .then((res) =>
                        res.reduce(
                            (acc, { status, count }) => {
                                acc[status] = count;
                                return acc;
                            },
                            {} as Record<string, number>,
                        ),
                    );
            } catch (_err) {
                return {};
            }
        },
        ["order-status-counts"],
        {
            revalidate: 3600,
        },
    )();
}

export async function getOrderCustomerCounts() {
    return unstable_cache(
        async () => {
            try {
                return await db
                    .select({
                        customer: orders.customer,
                        count: count(),
                    })
                    .from(orders)
                    .groupBy(orders.customer)
                    .having(gt(count(), 0))
                    .then((res) =>
                        res.reduce(
                            (acc, { customer, count }) => {
                                acc[customer] = count;
                                return acc;
                            },
                            {} as Record<string, number>,
                        ),
                    );
            } catch (_err) {
                return {};
            }
        },
        ["order-customer-counts"],
        {
            revalidate: 3600,
        },
    )();
}

export async function getPoValueRange() {
    return unstable_cache(
        async () => {
            try {
                return await db
                    .select({
                        min: sql<number>`min(${orders.poValue})`,
                        max: sql<number>`max(${orders.poValue})`,
                    })
                    .from(orders)
                    .then((res) => res[0] ?? { min: 0, max: 0 });
            } catch (_err) {
                return { min: 0, max: 0 };
            }
        },
        ["po-value-range"],
        {
            revalidate: 3600,
        },
    )();
}
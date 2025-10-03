import "server-only";

import {
    and,
    asc,
    count,
    desc,
    gte,
    inArray,
    like,
    lte,
    max,
    min,
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

                // SQLite uses LIKE instead of ILIKE (case-insensitive search)
                const where = advancedTable
                    ? advancedWhere
                    : and(
                        input.partNumber
                            ? like(orders.partNumber, `%${input.partNumber}%`)
                            : undefined,
                        input.customer
                            ? like(orders.customer, `%${input.customer}%`)
                            : undefined,
                        input.supplier
                            ? like(orders.supplier, `%${input.supplier}%`)
                            : undefined,
                        input.custPo
                            ? like(orders.custPo, `%${input.custPo}%`)
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
                    // SQLite doesn't support HAVING with aggregate comparison the same way
                    // We'll filter in JS instead
                    .then((res) =>
                        res.reduce(
                            (acc, { status, count: cnt }) => {
                                if (cnt > 0) {
                                    acc[status] = cnt;
                                }
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
                    .then((res) =>
                        res.reduce(
                            (acc, { customer, count: cnt }) => {
                                if (cnt > 0) {
                                    acc[customer] = cnt;
                                }
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
                        min: min(orders.poValue),
                        max: max(orders.poValue),
                    })
                    .from(orders)
                    .then((res) => ({
                        min: res[0]?.min ?? 0,
                        max: res[0]?.max ?? 0,
                    }));
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
import * as React from "react";
import { notFound } from "next/navigation";
import { OrderDetailPage } from "./order-detail-client";
import { getOrderBySlug } from "@/app/_lib/queries";

interface OrderPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function OrderPage(props: OrderPageProps) {
    const params = await props.params;
    const order = await getOrderBySlug(params.slug);

    if (!order) {
        notFound();
    }

    return <OrderDetailPage order={order} />;
}
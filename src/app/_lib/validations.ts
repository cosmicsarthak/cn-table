import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import * as z from "zod";
import { flagConfig } from "@/config/flag";
import { type Order } from "@/db/schema";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";

// Status options from your data.ts
const statusValues = [
  "Order yet to be processed",
  "Order processed",
  "Cancelled",
  "Payment pending to Supplier",
  "Supplier Paid",
  "Long LT - Awaiting ESD",
  "Long LT - ESD Provided",
  "Awaiting Collection Details",
  "Ready for Collection from Supplier",
  "Awaiting AWB from FF",
  "AWB Shared to Supplier",
  "Transit to UAE",
  "Need to Collect",
  "Received in UAE",
  "Hold",
  "Issue",
  "Ready for Dispatch",
  "Delivered",
] as const;

const termValues = ["PREPAY", "NET 7", "NET 30"] as const;
const currencyValues = ["USD", "EUR", "AED", "INR"] as const;
const yesNoValues = ["Yes", "No"] as const;

export const searchParamsCache = createSearchParamsCache({
  filterFlag: parseAsStringEnum(
      flagConfig.featureFlags.map((flag) => flag.value),
  ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Order>().withDefault([
    { id: "sn", desc: true },
  ]),
  partNumber: parseAsString.withDefault(""),
  customer: parseAsString.withDefault(""),
  supplier: parseAsString.withDefault(""),
  custPo: parseAsString.withDefault(""),
  status: parseAsArrayOf(z.string()).withDefault([]),
  term: parseAsArrayOf(z.string()).withDefault([]),
  currency: parseAsArrayOf(z.string()).withDefault([]),
  paymentReceived: parseAsArrayOf(z.string()).withDefault([]),
  poValue: parseAsArrayOf(z.coerce.number()).withDefault([]),
  poDate: parseAsArrayOf(z.coerce.number()).withDefault([]), // Add this
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export const createOrderSchema = z.object({
  partNumber: z.string().min(1, "Part number is required"),
  description: z.string().min(1, "Description is required"),
  qty: z.number().positive("Quantity must be positive"),
  poDate: z.string().min(1, "PO date is required"),
  term: z.enum(termValues),
  customer: z.string().min(1, "Customer is required"),
  custPo: z.string().min(1, "Customer PO is required"),
  status: z.enum(statusValues),
  remarks: z.string().default(""),
  currency: z.enum(currencyValues),
  poValue: z.number().min(0, "PO value must be non-negative"),
  costs: z.number().min(0, "Costs must be non-negative"),
  customsDutyB: z.number().min(0).optional().nullable(),
  freightCostC: z.number().min(0).optional().nullable(),
  paymentReceived: z.enum(yesNoValues),
  investorPaid: z.enum(yesNoValues),
  targetDate: z.string().default(""),
  dispatchDate: z.string().default(""),
  supplierPoDate: z.string().min(1, "Supplier PO date is required"),
  supplier: z.string().min(1, "Supplier is required"),
  supplierPo: z.string().min(1, "Supplier PO is required"),
  awbToUae: z.string().default(""),
  stability: z.number().default(10),
});

export const updateOrderSchema = z.object({
  partNumber: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  qty: z.number().positive().optional(),
  poDate: z.string().optional(),
  term: z.enum(termValues).optional(),
  customer: z.string().min(1).optional(),
  custPo: z.string().min(1).optional(),
  status: z.enum(statusValues).optional(),
  remarks: z.string().optional(),
  currency: z.enum(currencyValues).optional(),
  poValue: z.number().min(0).optional(),
  costs: z.number().min(0).optional(),
  customsDutyB: z.number().min(0).optional().nullable(),
  freightCostC: z.number().min(0).optional().nullable(),
  paymentReceived: z.enum(yesNoValues).optional(),
  investorPaid: z.enum(yesNoValues).optional(),
  targetDate: z.string().optional(),
  dispatchDate: z.string().optional(),
  supplierPoDate: z.string().optional(),
  supplier: z.string().min(1).optional(),
  supplierPo: z.string().min(1).optional(),
  awbToUae: z.string().optional(),
  stability: z.number().optional(),
});

export type GetOrdersSchema = Awaited<
    ReturnType<typeof searchParamsCache.parse>
>;
export type CreateOrderSchema = z.infer<typeof createOrderSchema>;
export type UpdateOrderSchema = z.infer<typeof updateOrderSchema>;

// Export the constant arrays for use in components
export { statusValues, termValues, currencyValues, yesNoValues };
import { sql } from "drizzle-orm";
import {integer, real, serial, text, timestamp, varchar} from "drizzle-orm/pg-core";
import { pgTable } from "@/db/utils";

export const orders = pgTable("orders", {
  sn: serial("sn").primaryKey(),  // Autoincrements starting from 1 // only for postgreSQL
  partNumber: varchar("part_number", { length: 255 }).notNull(),
  description: text("description").notNull(),
  qty: real("qty").notNull(),
  poDate: varchar("po_date", { length: 50 }).notNull(),
  term: varchar("term", { length: 50 }).notNull(),
  customer: varchar("customer", { length: 255 }).notNull(),
  custPo: varchar("cust_po", { length: 255 }).notNull(),
  status: varchar("status", { length: 255 }).notNull(),
  remarks: text("remarks").notNull().default(""),
  currency: varchar("currency", { length: 3 }).notNull(),
  poValue: real("po_value").notNull(),
  costs: real("costs").notNull(),
  customsDutyB: real("customs_duty_b"),
  freightCostC: real("freight_cost_c"),
  grossProfit: real("gross_profit"),
  profitPercent: real("profit_percent"),
  netProfit: real("net_profit"),
  profitPercentAfterCost: real("profit_percent_after_cost"),
  paymentReceived: varchar("payment_received", { length: 50 }).notNull(),
  investorPaid: varchar("investor_paid", { length: 50 }).notNull(),
  targetDate: varchar("target_date", { length: 50 }).notNull().default(""),
  dispatchDate: varchar("dispatch_date", { length: 50 }).notNull().default(""),
  supplierPoDate: varchar("supplier_po_date", { length: 50 }).notNull(),
  supplier: varchar("supplier", { length: 255 }).notNull(),
  supplierPo: varchar("supplier_po", { length: 255 }).notNull(),
  awbToUae: varchar("awb_to_uae", { length: 255 }).notNull().default(""),
  haInvDate: varchar("ha_inv_date", { length: 50 }).notNull().default(""),
  haInv: varchar("ha_inv", { length: 255 }).notNull().default(""),
  anPoDate: varchar("an_po_date", { length: 50 }).notNull().default(""),
  anPo: varchar("an_po", { length: 255 }).notNull().default(""),
  anInvDate: varchar("an_inv_date", { length: 50 }).notNull().default(""),
  anInv: varchar("an_inv", { length: 255 }).notNull().default(""),
  audited: varchar("audited", { length: 10 }).notNull().default(""),
  stability: real("stability").notNull(),
  lastEdited: varchar("last_edited", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
      .default(sql`current_timestamp`)
      .$onUpdate(() => new Date()),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
import { sql } from "drizzle-orm";
import { integer, real, text } from "drizzle-orm/sqlite-core";
import { sqliteTable } from "@/db/utils";

export const orders = sqliteTable("orders", {
  // SQLite uses INTEGER PRIMARY KEY for autoincrement
  sn: integer("sn").primaryKey({ autoIncrement: true }),
  partNumber: text("part_number").notNull(),
  description: text("description").notNull(),
  qty: real("qty").notNull(),
  poDate: text("po_date").notNull(),
  term: text("term").notNull(),
  customer: text("customer").notNull(),
  custPo: text("cust_po").notNull(),
  status: text("status").notNull(),
  remarks: text("remarks").notNull().default(""),
  currency: text("currency").notNull(),
  poValue: real("po_value").notNull(),
  costs: real("costs").notNull(),
  customsDutyB: real("customs_duty_b"),
  freightCostC: real("freight_cost_c"),
  grossProfit: real("gross_profit"),
  profitPercent: real("profit_percent"),
  netProfit: real("net_profit"),
  profitPercentAfterCost: real("profit_percent_after_cost"),
  paymentReceived: text("payment_received").notNull(),
  investorPaid: text("investor_paid").notNull(),
  targetDate: text("target_date").notNull().default(""),
  dispatchDate: text("dispatch_date").notNull().default(""),
  supplierPoDate: text("supplier_po_date").notNull(),
  supplier: text("supplier").notNull(),
  supplierPo: text("supplier_po").notNull(),
  awbToUae: text("awb_to_uae").notNull().default(""),
  haInvDate: text("ha_inv_date").notNull().default(""),
  haInv: text("ha_inv").notNull().default(""),
  anPoDate: text("an_po_date").notNull().default(""),
  anPo: text("an_po").notNull().default(""),
  anInvDate: text("an_inv_date").notNull().default(""),
  anInv: text("an_inv").notNull().default(""),
  audited: text("audited").notNull().default(""),
  stability: real("stability").notNull(),
  lastEdited: text("last_edited").notNull(),
  // SQLite stores timestamps as TEXT, INTEGER (unix), or REAL
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
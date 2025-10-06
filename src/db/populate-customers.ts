// Run this after updating schema.ts
// Command: pnpm drizzle-kit generate && pnpm drizzle-kit push

// Then run this script to populate customers from existing orders
// src/db/populate-customers.ts

import { db } from "@/db/index";
import { customers, orders } from "@/db/schema";
import { sql } from "drizzle-orm";

async function populateCustomers() {
    console.log("🔄 Populating customers table from existing orders...");

    try {
        // Get unique customer names from orders
        const uniqueCustomers = await db
            .selectDistinct({ customer: orders.customer })
            .from(orders);

        console.log(`Found ${uniqueCustomers.length} unique customers`);

        // Insert unique customers
        for (const { customer } of uniqueCustomers) {
            try {
                await db.insert(customers).values({
                    name: customer,
                }).onConflictDoNothing();

                console.log(`✅ Added customer: ${customer}`);
            } catch (error) {
                console.log(`⚠️  Skipped duplicate: ${customer}`);
            }
        }

        console.log("✨ Customer population complete!");
    } catch (error) {
        console.error("❌ Population failed:", error);
        throw error;
    }
}

populateCustomers()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(() => {
        process.exit(0);
    });
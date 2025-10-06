import { db } from "@/db";
import { customers } from "@/db/schema";
import { env } from "@/env.js";

async function populateCustomers() {
    console.log("🌱 Populating customers...");

    try {
        console.log("🔄 Connecting to database:", env.DATABASE_URL);

        // Check for existing customers
        const existing = await db.select().from(customers);
        if (existing.length > 0) {
            console.log(`✅ ${existing.length} customers already exist. Skipping population.`);
            return;
        }

        // Customer data
        const data = [
            { name: "Alpha Distributors" },
            { name: "Beta Logistics" },
            { name: "Cosmic Traders" },
            { name: "Nova Supplies" },
            { name: "Vertex Retail" },
        ];

        await db.insert(customers).values(data);
        console.log("✅ Customers populated successfully.");
        console.log("✨ Population complete!");
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

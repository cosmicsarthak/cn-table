import { db } from "@/db/index";
import { orders } from "@/db/schema";
import { generateRandomOrder } from "@/app/_lib/utils";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Clear existing orders
    await db.delete(orders);
    console.log("✅ Cleared existing orders");

    // Generate and insert orders
    const orderCount = 100;
    const allOrders = [];

    for (let i = 1; i <= orderCount; i++) {
      allOrders.push(generateRandomOrder(i));
    }

    await db.insert(orders).values(allOrders);
    console.log(`✅ Inserted ${orderCount} orders`);

    console.log("✨ Seeding complete!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

seed()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(() => {
      process.exit(0);
    });
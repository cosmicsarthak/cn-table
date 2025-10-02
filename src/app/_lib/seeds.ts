import { db } from "@/db/index";
import { type Order, orders } from "@/db/schema";

import { generateRandomOrder } from "./utils";

export async function seedTasks(input: { count: number }) {
  const count = input.count ?? 100;

  try {
    const allTasks: Order[] = [];

    for (let i = 0; i < count; i++) {
      allTasks.push(generateRandomOrder(i));
    }

    await db.delete(orders);

    console.log("📝 Inserting tasks", allTasks.length);

    await db.insert(orders).values(allTasks).onConflictDoNothing();
  } catch (err) {
    console.error(err);
  }
}

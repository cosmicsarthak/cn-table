import { defineConfig } from "drizzle-kit";
import { env } from "@/env.js";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: env.DATABASE_URL,
    ...(env.DATABASE_AUTH_TOKEN && { authToken: env.DATABASE_AUTH_TOKEN }),
  },
});
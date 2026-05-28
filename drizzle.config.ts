import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  out: "./src/db/migrations",
  dbCredentials: {
    url: "./sqlite.db"
  }
})

import "dotenv/config"
import { sql } from "drizzle-orm"
import db from "./index"

const resetDatabase = async () => {
  try {
    console.log("Clearing database...")
    await db.run(sql`DROP TABLE IF EXISTS tasks;`)
    await db.run(sql`DROP TABLE IF EXISTS __drizzle_migrations;`)
    console.log("Database cleared successfully.")
  } catch (error) {
    console.error("Error clearing database:", error)
  } finally {
    process.exit()
  }
}

resetDatabase()

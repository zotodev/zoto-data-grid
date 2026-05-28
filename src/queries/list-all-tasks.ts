import db from "@/db"
import { tasks } from "@/db/schema"

export async function listAllTasks() {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const rows = await db.select().from(tasks)

  return {
    data: rows
  }
}

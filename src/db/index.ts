import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema"

const db = drizzle({ connection: { url: "file:./sqlite.db" }, schema })

export type Db = typeof db

export default db

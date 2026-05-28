// import { createServerFn } from "@tanstack/react-start"
// import { and, asc, desc, eq, type SQL } from "drizzle-orm"
// import { buildCursorPayload, buildKeysetWhere, decodeCursor, encodeCursor } from "@/lib/server-grid-filters/cursor"
// import {
//   buildDrizzleOrderBy,
//   buildDrizzleWhere,
//   type DrizzleColumnMap,
//   type VariantMap
// } from "@/lib/server-grid-filters/drizzle"

// export type JoinedTransactionRow = {
//   id: number
//   description: string
//   type: string
//   status: string
//   category: string
//   amount: number
//   transactedAt: Date
//   merchantName: string | null
//   userName: string
//   userEmail: string
//   roleName: string
//   roleLevel: number
// }

// const JOINED_COLUMN_MAP: DrizzleColumnMap = {
//   id: transactions.id,
//   description: transactions.description,
//   type: transactions.type,
//   status: transactions.status,
//   category: transactions.category,
//   amount: transactions.amount,
//   transactedAt: transactions.transactedAt,
//   merchantName: transactions.merchantName,
//   userName: users.name,
//   userEmail: users.email,
//   roleName: roles.title,
//   roleLevel: roles.level
// }

// const JOINED_VARIANTS: VariantMap = {
//   id: "number",
//   description: "short-text",
//   type: "select",
//   status: "select",
//   category: "select",
//   amount: "number",
//   transactedAt: "date",
//   merchantName: "short-text",
//   userName: "short-text",
//   userEmail: "short-text",
//   roleName: "short-text",
//   roleLevel: "number"
// } satisfies Record<string, CellOpts["variant"]>

// const DEFAULT_SORT = [{ id: "transactedAt", desc: true }]

// export const getJoinedTransactionsPageFn = createServerFn()
//   .inputValidator((data: ServerPageParams) => data)
//   .handler(async (ctx): Promise<ServerPageResult<JoinedTransactionRow>> => {
//     const { pageParam, pageSize, sorting, filters } = ctx.data

//     const effectiveSort = sorting.length ? sorting : DEFAULT_SORT
//     const lastDesc = effectiveSort[effectiveSort.length - 1]?.desc ?? true
//     const sortingWithId = [...effectiveSort, { id: "id", desc: lastDesc }]

//     const filterWhere = buildDrizzleWhere(filters, JOINED_COLUMN_MAP, JOINED_VARIANTS)

//     const decoded = pageParam ? decodeCursor(pageParam) : null
//     const keysetWhere = decoded
//       ? buildKeysetWhere(decoded, sortingWithId, JOINED_COLUMN_MAP, JOINED_VARIANTS)
//       : undefined

//     const where: SQL | undefined =
//       filterWhere && keysetWhere ? and(filterWhere, keysetWhere) : (filterWhere ?? keysetWhere)

//     const orderBy = buildDrizzleOrderBy(effectiveSort, JOINED_COLUMN_MAP)
//     const finalOrderBy = [...orderBy, lastDesc ? desc(transactions.id) : asc(transactions.id)]

//     const rows = await db
//       .select({
//         id: transactions.id,
//         description: transactions.description,
//         type: transactions.type,
//         status: transactions.status,
//         category: transactions.category,
//         amount: transactions.amount,
//         transactedAt: transactions.transactedAt,
//         merchantName: transactions.merchantName,
//         userName: users.name,
//         userEmail: users.email,
//         roleName: roles.title,
//         roleLevel: roles.level
//       })
//       .from(transactions)
//       .innerJoin(users, eq(transactions.createdBy, users.id))
//       .innerJoin(roles, eq(users.roleId, roles.id))
//       .where(where)
//       .orderBy(...finalOrderBy)
//       .limit(pageSize + 1)

//     const hasMore = rows.length > pageSize
//     const pageRows = hasMore ? rows.slice(0, pageSize) : rows
//     const last = pageRows[pageRows.length - 1]
//     const nextCursor =
//       hasMore && last
//         ? encodeCursor(buildCursorPayload(last as unknown as Record<string, unknown>, sortingWithId))
//         : undefined

//     return { data: pageRows, nextCursor }
//   })

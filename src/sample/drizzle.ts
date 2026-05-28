// import type { ColumnFiltersState, SortingState } from "@tanstack/react-table"
// import {
//   type AnyColumn,
//   and,
//   asc,
//   desc,
//   eq,
//   gt,
//   gte,
//   inArray,
//   isNotNull,
//   isNull,
//   like,
//   lt,
//   lte,
//   ne,
//   notInArray,
//   notLike,
//   or,
//   type SQL
// } from "drizzle-orm"

// import type { CellOpts, FilterValue } from "@/components/data-grid/types/data-grid"

// export type DrizzleColumnMap = Record<string, AnyColumn>
// export type VariantMap = Record<string, CellOpts["variant"]>

// function coerceScalar(value: unknown, variant: CellOpts["variant"]): unknown {
//   if (variant === "number") {
//     if (typeof value === "number") return value
//     if (typeof value === "string" && value !== "") {
//       const n = Number(value)
//       return Number.isNaN(n) ? undefined : n
//     }
//     return undefined
//   }
//   if (variant === "date" || variant === "datetime") {
//     if (value instanceof Date) return value
//     if (typeof value === "string" && value !== "") {
//       const d = new Date(value)
//       return Number.isNaN(d.getTime()) ? undefined : d
//     }
//     if (typeof value === "number") return new Date(value)
//     return undefined
//   }
//   if (variant === "checkbox") {
//     if (typeof value === "boolean") return value
//     if (typeof value === "string") {
//       const v = value.toLowerCase()
//       if (v === "true" || v === "1" || v === "yes") return true
//       if (v === "false" || v === "0" || v === "no") return false
//     }
//     return undefined
//   }
//   // strings, urls, selects
//   if (value == null) return undefined
//   return String(value)
// }

// function coerceArray(value: unknown, variant: CellOpts["variant"]): unknown[] | undefined {
//   if (!Array.isArray(value)) return undefined
//   const out: unknown[] = []
//   for (const item of value) {
//     const c = coerceScalar(item, variant)
//     if (c !== undefined) out.push(c)
//   }
//   return out.length ? out : undefined
// }

// function filterToSql(column: AnyColumn, filterValue: FilterValue, variant: CellOpts["variant"]): SQL | undefined {
//   const { operator, value, endValue } = filterValue

//   // Operators that don't need a value
//   switch (operator) {
//     case "isEmpty":
//       return isNull(column)
//     case "isNotEmpty":
//       return isNotNull(column)
//     case "isTrue":
//       return eq(column, true)
//     case "isFalse":
//       return eq(column, false)
//   }

//   // String operators use raw string value
//   if (operator === "contains" || operator === "notContains" || operator === "startsWith" || operator === "endsWith") {
//     if (typeof value !== "string" || value === "") return undefined
//     const pattern =
//       operator === "contains" || operator === "notContains"
//         ? `%${value}%`
//         : operator === "startsWith"
//           ? `${value}%`
//           : `%${value}`
//     return operator === "notContains" ? notLike(column, pattern) : like(column, pattern)
//   }

//   // Array operators
//   if (operator === "isAnyOf" || operator === "isNoneOf") {
//     const arr = coerceArray(value, variant)
//     if (!arr) return undefined
//     return operator === "isAnyOf" ? inArray(column, arr) : notInArray(column, arr)
//   }

//   // Single-value comparison operators
//   const coerced = coerceScalar(value, variant)
//   if (coerced === undefined) return undefined

//   switch (operator) {
//     case "equals":
//     case "is":
//       return eq(column, coerced)
//     case "notEquals":
//     case "isNot":
//       return ne(column, coerced)
//     case "lessThan":
//     case "before":
//       return lt(column, coerced)
//     case "lessThanOrEqual":
//     case "onOrBefore":
//       return lte(column, coerced)
//     case "greaterThan":
//     case "after":
//       return gt(column, coerced)
//     case "greaterThanOrEqual":
//     case "onOrAfter":
//       return gte(column, coerced)
//     case "isBetween": {
//       const end = coerceScalar(endValue, variant)
//       if (end === undefined) return gte(column, coerced)
//       return and(gte(column, coerced), lte(column, end))
//     }
//     default:
//       return undefined
//   }
// }

// export function buildDrizzleWhere(
//   filters: ColumnFiltersState,
//   columnMap: DrizzleColumnMap,
//   variantByColumn: VariantMap
// ): SQL | undefined {
//   const parts: SQL[] = []
//   for (const f of filters) {
//     const column = columnMap[f.id]
//     if (!column) continue
//     const fv = f.value as FilterValue | undefined
//     if (!fv) continue
//     const variant = variantByColumn[f.id] ?? "short-text"
//     const sqlPart = filterToSql(column, fv, variant)
//     if (sqlPart) parts.push(sqlPart)
//   }
//   if (parts.length === 0) return undefined
//   if (parts.length === 1) return parts[0]
//   return and(...parts)
// }

// export function buildDrizzleOrderBy(sorting: SortingState, columnMap: DrizzleColumnMap): SQL[] {
//   const out: SQL[] = []
//   for (const s of sorting) {
//     const column = columnMap[s.id]
//     if (!column) continue
//     out.push(s.desc ? desc(column) : asc(column))
//   }
//   return out
// }

// // Re-export `or` so the cursor builder can use the same drizzle instance.
// export { and, eq, gt, lt, or }

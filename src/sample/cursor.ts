// import type { SortingState } from "@tanstack/react-table";
// import { and, eq, gt, lt, or, type SQL } from "drizzle-orm";

// import type { CellOpts } from "@/components/data-grid/types/data-grid";

// import type { DrizzleColumnMap, VariantMap } from "./drizzle";

// function coerceForCompare(
//   value: unknown,
//   variant: CellOpts["variant"],
// ): unknown {
//   if (variant === "date" || variant === "datetime") {
//     if (value instanceof Date) return value;
//     if (typeof value === "string" && value !== "") {
//       const d = new Date(value);
//       return Number.isNaN(d.getTime()) ? undefined : d;
//     }
//     if (typeof value === "number") return new Date(value);
//     return undefined;
//   }
//   if (variant === "number") {
//     if (typeof value === "number") return value;
//     if (typeof value === "string") {
//       const n = Number(value);
//       return Number.isNaN(n) ? undefined : n;
//     }
//     return undefined;
//   }
//   if (variant === "checkbox") {
//     if (typeof value === "boolean") return value;
//     return undefined;
//   }
//   if (value == null) return undefined;
//   return value;
// }

// export function encodeCursor(payload: Record<string, unknown>): string {
//   const json = JSON.stringify(payload);
//   const base64 = Buffer.from(json, "utf8").toString("base64");
//   return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
// }

// export function decodeCursor<T = Record<string, unknown>>(
//   cursor: string,
// ): T | null {
//   try {
//     const padded = cursor + "=".repeat((4 - (cursor.length % 4)) % 4);
//     const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
//     const json = Buffer.from(base64, "base64").toString("utf8");
//     return JSON.parse(json) as T;
//   } catch {
//     return null;
//   }
// }

// /**
//  * Build a keyset-pagination WHERE clause.
//  *
//  * `sorting` must be the *effective* sort the query uses, including any id
//  * tie-breaker appended by the caller. `decoded` is the last-row snapshot
//  * from the previous page (one value per sort column).
//  */
// export function buildKeysetWhere(
//   decoded: Record<string, unknown>,
//   sorting: SortingState,
//   columnMap: DrizzleColumnMap,
//   variantByColumn: VariantMap,
// ): SQL | undefined {
//   const entries = sorting
//     .map((s) => {
//       const col = columnMap[s.id];
//       if (!col) return null;
//       const variant = variantByColumn[s.id] ?? "short-text";
//       const value = coerceForCompare(decoded[s.id], variant);
//       if (value === undefined) return null;
//       return { col, desc: !!s.desc, value };
//     })
//     .filter((x): x is NonNullable<typeof x> => x !== null);

//   if (entries.length === 0) return undefined;

//   const branches: SQL[] = [];
//   for (let i = 0; i < entries.length; i++) {
//     const conds: SQL[] = [];
//     for (let j = 0; j < i; j++) {
//       conds.push(eq(entries[j].col, entries[j].value));
//     }
//     const tip = entries[i];
//     conds.push(tip.desc ? lt(tip.col, tip.value) : gt(tip.col, tip.value));
//     const combined =
//       conds.length === 1 ? conds[0] : (and(...conds) as SQL);
//     branches.push(combined);
//   }

//   if (branches.length === 1) return branches[0];
//   return or(...branches) as SQL;
// }

// /**
//  * Build the cursor payload (last-row snapshot) for the next page.
//  * Includes one entry per sort column plus the id tie-breaker.
//  */
// export function buildCursorPayload<T extends Record<string, unknown>>(
//   row: T,
//   sorting: SortingState,
// ): Record<string, unknown> {
//   const payload: Record<string, unknown> = {};
//   for (const s of sorting) {
//     payload[s.id] = row[s.id];
//   }

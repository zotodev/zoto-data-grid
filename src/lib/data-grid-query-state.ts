import type { ColumnFiltersState, SortingState } from "@tanstack/react-table"

type StringKeyOf<T> = Extract<keyof T, string>

export type DataGridSorting<TColumnId extends string> = {
  id: TColumnId
  desc: boolean
}

export type DataGridFilter<TColumnId extends string> = {
  id: TColumnId
  value: unknown
}

type QueryParamMapper<TQueryParams extends object, TParamKey extends StringKeyOf<TQueryParams>, TValue> = {
  queryKey: TParamKey
  getValue: (value: TValue) => TQueryParams[TParamKey] | undefined
}

export type DataGridSortParamMapper<TQueryParams extends object, TColumnId extends string> = {
  [TParamKey in StringKeyOf<TQueryParams>]: QueryParamMapper<
    TQueryParams,
    TParamKey,
    DataGridSorting<TColumnId> | undefined
  >
}[StringKeyOf<TQueryParams>]

export type DataGridFilterParamMapper<TQueryParams extends object> = {
  [TParamKey in StringKeyOf<TQueryParams>]: QueryParamMapper<TQueryParams, TParamKey, unknown>
}[StringKeyOf<TQueryParams>]

export type DataGridFilterParamMap<TQueryParams extends object, TColumnId extends string> = Partial<
  Record<TColumnId, DataGridFilterParamMapper<TQueryParams>>
>

export type DataGridQueryParamsConfig<TQueryParams extends object, TColumnId extends string> = {
  sorting?: readonly DataGridSortParamMapper<TQueryParams, TColumnId>[]
  filters?: DataGridFilterParamMap<TQueryParams, TColumnId>
}

export function createDataGridQueryParams<
  TData,
  TQueryParams extends object,
  TColumnId extends string = StringKeyOf<TData>
>(config: DataGridQueryParamsConfig<TQueryParams, TColumnId>) {
  return (sorting: SortingState, columnFilters: ColumnFiltersState): Partial<TQueryParams> => {
    const queryParams: Partial<TQueryParams> = {}
    const firstSort = sorting[0] as DataGridSorting<TColumnId> | undefined

    for (const mapper of config.sorting ?? []) {
      setQueryParam(queryParams, mapper.queryKey, mapper.getValue(firstSort))
    }

    for (const filter of columnFilters as DataGridFilter<TColumnId>[]) {
      const mapper = config.filters?.[filter.id]

      if (!mapper) continue

      setQueryParam(queryParams, mapper.queryKey, mapper.getValue(filter.value))
    }

    return queryParams
  }
}

export function getStringQueryValue(value: unknown) {
  const candidate = Array.isArray(value) ? value[0] : value

  if (typeof candidate !== "string") return undefined

  const normalized = candidate.trim()

  return normalized || undefined
}

export function getDelimitedStringQueryValue(value: unknown, delimiter = ",") {
  if (!Array.isArray(value)) return getStringQueryValue(value)

  const normalized = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)

  return normalized.length > 0 ? normalized.join(delimiter) : undefined
}

export function getNumberQueryValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

function setQueryParam<TQueryParams extends object, TParamKey extends StringKeyOf<TQueryParams>>(
  queryParams: Partial<TQueryParams>,
  queryKey: TParamKey,
  value: TQueryParams[TParamKey] | undefined
) {
  if (value !== undefined) {
    queryParams[queryKey] = value
  }
}

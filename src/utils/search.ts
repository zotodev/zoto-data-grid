import z from "zod"

export function getDefaultsFromSchema<T extends z.ZodTypeAny>(schema: T): z.infer<T> {
  // By parsing an empty object, Zod applies all defaults/catch values.
  return schema.parse({})
}

//check filters are active
//biome-ignore lint/suspicious/noExplicitAny: required
function isDeepEqual(a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

//biome-ignore lint/suspicious/noExplicitAny: required
export function getActiveFilters<T extends z.ZodObject<any>>(schema: T) {
  const defaultValues = getDefaultsFromSchema(schema)

  return (searchParams: z.infer<T>): boolean => {
    return Object.entries(searchParams).some(([key, value]) => {
      if (value === undefined) return false
      const defaultValue = defaultValues[key as keyof typeof defaultValues]
      return !isDeepEqual(value, defaultValue)
    })
  }
}

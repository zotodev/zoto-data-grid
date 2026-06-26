/**
 * Pretend this module comes from an external / third-party source we don't
 * control. It throws a raw runtime error with no `code` and no nice shape —
 * exactly the kind of error `<FormError />` has to handle gracefully.
 */
export function divide(a: number, b: number): number {
  if (b === 0) throw new RangeError("Cannot divide by zero")
  return a / b
}

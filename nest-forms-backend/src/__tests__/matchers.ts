/**
 * Typed wrappers for asymmetric matchers.
 *
 * Built-in matchers like `expect.objectContaining()` return `any`, which
 * triggers @typescript-eslint/no-unsafe-assignment when used in toHaveBeenCalledWith
 * assertions. These helpers cast the result to the expected type so TypeScript is
 * satisfied without suppressing the lint rule at every call site.
 */

export const expectObjectContaining = <T extends object>(obj: Partial<T>): T =>
  expect.objectContaining<object>(obj) as T

export const expectArrayContaining = <T>(arr: T[]): T[] => {
  const expected: unknown[] = arr
  return expect.arrayContaining(expected) as T[]
}

export const expectStringContaining = (str: string): string =>
  expect.stringContaining(str) as string

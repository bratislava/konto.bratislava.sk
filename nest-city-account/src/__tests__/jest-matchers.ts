/**
 * Typed wrappers for Jest asymmetric matchers.
 *
 * Jest's built-in matchers like `expect.objectContaining()` return `any`, which
 * triggers @typescript-eslint/no-unsafe-assignment when used in toHaveBeenCalledWith
 * assertions. These helpers cast the result to the expected type so TypeScript is
 * satisfied without suppressing the lint rule at every call site.
 */

export const expectObjectContaining = <T extends object>(obj: Partial<T>): T =>
  expect.objectContaining(obj) as T

export const expectArrayContaining = <T>(arr: T[]): T[] => expect.arrayContaining(arr) as T[]

export const expectStringContaining = (str: string): string =>
  expect.stringContaining(str) as string

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- T must be caller-specified (e.g. expectAny<Date>(Date)) since expect.any()'s sample argument doesn't determine the resulting matcher's type
export const expectAny = <T>(sample: unknown): T => expect.any(sample) as T

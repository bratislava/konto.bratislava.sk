import { timingSafeEqual } from 'node:crypto'

/**
 * Constant-time string comparison to prevent timing attacks.
 * Empty/missing inputs always return false so a blank/unset secret can never
 * be matched (fail closed).
 */
export const timingSafeStringEqual = (
  expected: string | undefined | null,
  provided: string | undefined | null,
): boolean => {
  if (!expected || !provided) {
    return false
  }

  try {
    const expectedBuffer = Buffer.from(expected, 'utf-8')
    const providedBuffer = Buffer.from(provided, 'utf-8')
    // Compare against a same-length dummy on length mismatch so both paths cost the same.
    const dummyBuffer = Buffer.alloc(expectedBuffer.length)
    const compareBuffer =
      expectedBuffer.length === providedBuffer.length ? providedBuffer : dummyBuffer

    return timingSafeEqual(expectedBuffer, compareBuffer)
  } catch {
    return false
  }
}

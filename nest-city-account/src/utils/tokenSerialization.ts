import { z } from 'zod'

const TokenDataSchema = z.object({
  token: z.string().min(1, 'token must be a non-empty string'),
  clientId: z.string().min(1, 'clientId must be a non-empty string'),
})

export type TokenData = z.infer<typeof TokenDataSchema>

/**
 * Serializes token and clientId into a JSON string.
 */
export const serializeTokenData = (token: string, clientId: string): string => {
  return JSON.stringify({ token, clientId })
}

/**
 * Deserializes a JSON string into a TokenData object.
 * Validates that the input is valid JSON and contains both token and clientId as non-empty strings.
 *
 * @throws Error if the serialized string is not valid JSON or fails validation
 */
export const deserializeTokenData = (serialized: string): TokenData => {
  let parsed: unknown
  try {
    parsed = JSON.parse(serialized)
  } catch {
    throw new Error('Invalid serialized token data: not valid JSON')
  }

  const result = TokenDataSchema.safeParse(parsed)
  if (!result.success) {
    const messages = result.error.issues.map((issue) => issue.message).join(', ')
    throw new Error(`Invalid serialized token data: ${messages}`)
  }

  return result.data
}

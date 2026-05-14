export class ErrorWithName extends Error {
  name: string

  constructor(message: string, name: string) {
    super(message)
    this.name = name
  }
}

export const isError = (error: unknown): error is Error =>
  typeof error === 'object' &&
  error !== null &&
  'message' in error &&
  typeof error.message === 'string'

// Amplify errors have a name property that is matched to translation keys
export const isErrorWithoutName = (error: Error) =>
  isError(error) && !('name' in error && typeof error.name === 'string')

export const GENERIC_ERROR_MESSAGE = 'UNEXPECTED_ERROR'

// Structured snapshot of an unknown error for logging.
// Pino fails to serialize some Amplify errors (private `message`, non-enumerable props),
// so we extract the diagnostic fields explicitly.
export const errorToLogFields = (error: unknown) => {
  if (isError(error)) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      constructor: error.constructor.name,
    }
  }

  return { raw: safeStringify(error) }
}

const safeStringify = (value: unknown) => {
  if (typeof value !== 'object' || value === null) {
    return String(value)
  }
  try {
    return JSON.stringify(value, Object.getOwnPropertyNames(value))
  } catch {
    return String(value)
  }
}

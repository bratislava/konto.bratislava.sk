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

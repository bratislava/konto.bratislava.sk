// as a class so that we can instantiate when we need to throw something with code
// we treat it more as an interface when we use isErrorWithCode
// that is, the actual object can be instance of something else but we care only about the code and the message
export class ErrorWithCode extends Error {
  code: string

  constructor(message: string, code: string) {
    super(message)
    this.code = code
  }
}

export const isError = (error: unknown): error is Error =>
  typeof error === 'object' &&
  error !== null &&
  'message' in error &&
  typeof error.message === 'string'

// we don't need instance of ErrorWithCode - we just need to access the code property
// i.e. many of errors returned by amplify-js return code on their errors which we match with translation keys
export const isErrorWithCode = (error: unknown): error is ErrorWithCode =>
  isError(error) && 'code' in error && typeof error.code === 'string'

export const GENERIC_ERROR_MESSAGE = 'UNEXPECTED_ERROR'

// TODO refactor, get rid of Api error, make TaxApiError format the default and handle errors accordingly
// eslint-disable-next-line max-classes-per-file
import { ErrorObject } from 'ajv'

export class ApiError extends Error {
  errors: Array<ErrorObject>

  constructor(m: string, errors: Array<ErrorObject>) {
    super(m)
    // Set the prototype explicitly - workaround while target is es5, cosnsider bumping target so we don't have to deal with this
    Object.setPrototypeOf(this, ApiError.prototype)
    this.errors = errors
  }
}

export class TaxApiError extends Error {
  response?: Record<string, any>

  status?: number

  statusText?: string

  constructor(message?: string, responseJson?: Record<string, any>) {
    // TODO better error handling - this is to ensure logging in Faro
    super(`${String(message)} ${JSON.stringify(responseJson)}`)
    // Set the prototype explicitly - workaround while target is es5, cosnsider bumping target so we don't have to deal with this
    Object.setPrototypeOf(this, TaxApiError.prototype)
    this.response = responseJson
    this.status = typeof responseJson?.statusCode === 'number' ? responseJson.statusCode : undefined
    this.statusText =
      typeof responseJson?.statusText === 'string' ? responseJson.statusText : undefined
  }
}

export interface Identity {
  birthNumber: string
  identityCard: string
  turnstileToken: string
}

export interface LegalIdentity {
  ico: string
  birthNumber: string
  identityCard: string
  turnstileToken: string
}

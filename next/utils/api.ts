// TODO waiting on #305 to get merged, afterwards might move elsewhere
// frontend code for calling api endpoints grouped
// TODO refactor, get rid of Api error, make TaxApiError format the default and handle errors accordingly
// eslint-disable-next-line max-classes-per-file
import { ErrorObject } from 'ajv'

import logger from './logger'

export const API_ERROR_TEXT = 'API_ERROR'
export const UNAUTHORIZED_ERROR_TEXT = 'UNAUTHORIZED_ERROR'

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
  response: Record<string, any>

  status?: number

  statusText?: string

  constructor(message?: string, responseJson?: Record<string, any>) {
    // TODO better error handling - this is to ensure logging in Faro
    super(`${message} ${JSON.stringify(responseJson)}`)
    // Set the prototype explicitly - workaround while target is es5, cosnsider bumping target so we don't have to deal with this
    Object.setPrototypeOf(this, TaxApiError.prototype)
    this.response = responseJson
    this.status = typeof responseJson?.statusCode === 'number' ? responseJson.statusCode : undefined
    this.statusText =
      typeof responseJson?.statusText === 'string' ? responseJson.statusText : undefined
  }
}

const fetchJsonApi = async (path: string, options?: RequestInit) => {
  try {
    const response = await fetch(path, options)
    if (response.ok) {
      return await response.json()
    }
    if (response.status === 401) {
      throw new Error(UNAUTHORIZED_ERROR_TEXT)
    }
    // try parsing errors - if they may apper in different format extend here
    const responseText = await response.text()
    let responseJson: any = {}
    try {
      responseJson = JSON.parse(responseText)
    } catch (error) {
      logger.error(API_ERROR_TEXT, response.status, response.statusText, responseText, response)
      throw new Error(response.statusText || API_ERROR_TEXT)
    }
    if (responseJson?.errors) {
      throw new ApiError(responseJson?.message || API_ERROR_TEXT, responseJson.errors)
    } else if (responseJson?.errorName) {
      throw new TaxApiError(responseJson.errorName, responseJson)
    } else {
      throw new TaxApiError(API_ERROR_TEXT, responseJson)
    }
  } catch (error) {
    // TODO originally caught & rethrown to ensure logging, might no longer be necessary
    logger.error(error)
    throw error
  }
}

const fetchBlob = async (path: string, options?: RequestInit) => {
  try {
    const response = await fetch(path, options)
    if (response.ok) {
      return await response.blob()
    }

    const responseText = await response.text()
    throw new Error(responseText)
  } catch (error) {
    // TODO originally caught & rethrown to ensure logging, might no longer be necessary
    logger.error(error)
    throw error
  }
}

// TODO move error handling here
export const submitEform = async (eformKey: string, data: Record<string, any>) => {
  return fetchJsonApi(`/api/eforms/${eformKey}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export const validateKeyword = async (
  keyword: string,
  schema: any,
  value: any,
  parentSchema: any,
): Promise<boolean> => {
  try {
    const { isValid }: { isValid: boolean } = await fetchJsonApi(`/api/eforms/validation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keyword, schema, value, parentSchema }),
    })

    return isValid
  } catch (error) {
    return false
  }
}

export const formDataToXml = (eform: string, data: any) => {
  return fetchBlob(`/api/eforms/${eform}/transform/xml`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  })
}

export const xmlToFormData = (eform: string, data: string) => {
  return fetchJsonApi(`/api/eforms/${eform}/transform/xmlToJson`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  })
}

interface Identity {
  birthNumber: string
  identityCard: string
  turnstileToken: string
}

export const verifyIdentityApi = (data: Identity, token: string) => {
  return fetchJsonApi(
    `${process.env.NEXT_PUBLIC_CITY_ACCOUNT_URL}/user-verification/identity-card`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  )
}

export interface Gdpr {
  subType?: 'subscribe' | 'unsubscribe'
  type: 'ANALYTICS' | 'DATAPROCESSING' | 'MARKETING' | 'LICENSE'
  category: 'SWIMMINGPOOLS' | 'TAXES' | 'CITY' | 'ESBS'
}

export const subscribeApi = (data: { gdprData?: Gdpr[] }, token: string) => {
  return fetchJsonApi(`${process.env.NEXT_PUBLIC_CITY_ACCOUNT_URL}/user/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
}

export const unsubscribeApi = (data: { gdprData?: Gdpr[] }, token: string) => {
  return fetchJsonApi(`${process.env.NEXT_PUBLIC_CITY_ACCOUNT_URL}/user/unsubscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
}

export const getUserApi = (token: string) => {
  return fetchJsonApi(`${process.env.NEXT_PUBLIC_CITY_ACCOUNT_URL}/user/get-or-create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
}

export const resetRcApi = (token: string) => {
  return fetchJsonApi(`${process.env.NEXT_PUBLIC_CITY_ACCOUNT_URL}/user/remove-birthnumber`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
}

type List<T> = {
  currentPage: number
  pagination: number
  countPages: number
  items: T[]
}

export type FormDto = {
  email: string
  formDataXml: string
  formDataJson: any
  pospID?: string
  pospVersion: string
  messageSubject: string
  isSigned?: false
  formName?: string
  fromDescription?: string
  id: string
  createdAt: Date
  updatedAt: Date
  externalId: string
  userExternalId: string
  uri?: string
  state?: string
  formDataGinis?: string
  senderId: string
  recipientId: string
  finishSubmission: string
}

export const getForms = (token: string) => {
  return fetchJsonApi(`${process.env.NEXT_PUBLIC_FORMS_URL}/nases/forms`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
}

type CreateFormDto = {
  pospID: string
  pospVersion: string
  messageSubject: string
  isSigned: boolean
  formName: string
  fromDescription: string
}

type UpdateFormDto = {
  email?: string
  formDataXml?: string
  formDataJson?: any
  pospID?: string
  pospVersion?: string
  messageSubject?: string
  isSigned?: boolean
  formName?: string
  fromDescription?: string
}

export const createForm = (token: string, data: CreateFormDto) => {
  return fetchJsonApi(`${process.env.NEXT_PUBLIC_FORMS_URL}/nases/create-form`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
}

export const getForm = (token: string, id: string) => {
  return fetchJsonApi(`${process.env.NEXT_PUBLIC_FORMS_URL}/nases/form/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
}

export const updateForm = (token: string, id: string, data: UpdateFormDto) => {
  return fetchJsonApi(`${process.env.NEXT_PUBLIC_FORMS_URL}/nases/update-form/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
}

export const getTaxApi = (token: string) => {
  return fetchJsonApi(`${process.env.NEXT_PUBLIC_TAXES_URL}/tax/get-tax-by-year?year=2023`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
}

export const getTaxPdfApi = (token: string) => {
  return fetchJsonApi(`${process.env.NEXT_PUBLIC_TAXES_URL}/tax/get-tax-pdf-by-year?year=2023`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
}

export const getPaymentGatewayUrlApi = (token: string) => {
  return fetchJsonApi(`${process.env.NEXT_PUBLIC_TAXES_URL}/payment/cardpay/by-year/2023`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
}

// TODO waiting on #305 to get merged, afterwards might move elsewhere
// frontend code for calling api endpoints grouped
import { FileUpdatedResponseDtoStatusEnum } from '@clients/openapi-forms'
import { RJSFSchema } from '@rjsf/utils'
import { ErrorObject } from 'ajv'
import { v4 as createUuid } from 'uuid'

import { ApiError, Gdpr, Identity, TaxApiError, UrlResult, User } from '../dtos/generalApiDto'
import logger, { developmentLog } from '../utils/logger'

export const API_ERROR_TEXT = 'API_ERROR'
export const UNAUTHORIZED_ERROR_TEXT = 'UNAUTHORIZED_ERROR'
export const MISSING_TOKEN = 'MISSING TOKEN'

const fetchJsonApi = async <T = any>(path: string, options?: RequestInit): Promise<T> => {
  try {
    const response = await fetch(path, options)
    if (response.ok) {
      try {
        return (await response.json()) as T
      } catch (error) {
        developmentLog('FETCH JSON API RAW ERROR 1', error as Record<string, unknown>, true)
        throw new Error(API_ERROR_TEXT)
      }
    }
    if (response.status === 401) {
      throw new Error(UNAUTHORIZED_ERROR_TEXT)
    }
    // try parsing errors - if they may apper in different format extend here
    const responseText = await response.text()
    let responseJson: Record<string, any> = {}
    try {
      responseJson = JSON.parse(responseText)
    } catch (error) {
      developmentLog('FETCH JSON API RAW ERROR 2', error as Record<string, unknown>, true)
      logger.error(API_ERROR_TEXT, response.status, response.statusText, responseText, response)
      throw new Error(response.statusText || API_ERROR_TEXT)
    }
    if (responseJson?.errors) {
      const responseMessage = String(responseJson?.message || API_ERROR_TEXT)
      const responseErrors: ErrorObject[] = Array.isArray(responseJson.errors)
        ? responseJson.errors
        : []
      throw new ApiError(responseMessage, responseErrors)
    } else if (responseJson?.errorName) {
      throw new TaxApiError(String(responseJson.errorName), responseJson)
    } else {
      throw new TaxApiError(API_ERROR_TEXT, responseJson)
    }
  } catch (error) {
    // TODO originally caught & rethrown to ensure logging, might no longer be necessary
    developmentLog('FETCH JSON API RAW ERROR 2', error as Record<string, unknown>, true)
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
export const submitEform = async (
  eformKey: string,
  formId: string,
  data: Record<string, any>,
  token: string | null,
) => {
  return fetchJsonApi(`/api/eforms/${eformKey}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ data, id: formId }),
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
  if (!eform || eform === '') throw new Error(API_ERROR_TEXT)

  return fetchBlob(`/api/eforms/${eform}/transform/xml`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  })
}

export const xmlToFormData = (eform: string, data: string): Promise<RJSFSchema> => {
  if (!eform || eform === '') throw new Error(API_ERROR_TEXT)

  return fetchJsonApi<RJSFSchema>(`/api/eforms/${eform}/transform/xmlToJson`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  })
}

export const xmlStringToPdf = (eform: string, data: string) => {
  if (!eform || eform === '') throw new Error(API_ERROR_TEXT)

  return fetchBlob(`/api/eforms/${eform}/transform/pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  })
}

export const verifyIdentityApi = (data: Identity, token?: string | null) => {
  if (!token) throw new Error(MISSING_TOKEN)

  return fetchJsonApi(
    `${String(process.env.NEXT_PUBLIC_CITY_ACCOUNT_URL)}/user-verification/identity-card`,
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

export const subscribeApi = (data: { gdprData?: Gdpr[] }, token?: string | null): Promise<User> => {
  if (!token) throw new Error(MISSING_TOKEN)

  return fetchJsonApi<User>(`${String(process.env.NEXT_PUBLIC_CITY_ACCOUNT_URL)}/user/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
}

export const unsubscribeApi = (
  data: { gdprData?: Gdpr[] },
  token?: string | null,
): Promise<User> => {
  if (!token) throw new Error(MISSING_TOKEN)

  return fetchJsonApi<User>(
    `${String(process.env.NEXT_PUBLIC_CITY_ACCOUNT_URL)}/user/unsubscribe`,
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

export const getUserApi = (token: string | null): Promise<User> => {
  if (!token) throw new Error(MISSING_TOKEN)

  return fetchJsonApi<User>(
    `${String(process.env.NEXT_PUBLIC_CITY_ACCOUNT_URL)}/user/get-or-create`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
}

export const resetRcApi = (token: string | null) => {
  if (!token) throw new Error(MISSING_TOKEN)

  return fetchJsonApi(
    `${String(process.env.NEXT_PUBLIC_CITY_ACCOUNT_URL)}/user/remove-birthnumber`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
}

export const getTaxApi = (token: string | null) => {
  if (!token) throw new Error(MISSING_TOKEN)

  return fetchJsonApi(
    `${String(process.env.NEXT_PUBLIC_TAXES_URL)}/tax/get-tax-by-year?year=2023`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
}

export const getTaxPdfApi = (token: string | null) => {
  if (!token) throw new Error(MISSING_TOKEN)

  return fetchJsonApi(
    `${String(process.env.NEXT_PUBLIC_TAXES_URL)}/tax/get-tax-pdf-by-year?year=2023`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
}

export const getPaymentGatewayUrlApi = (token: string | null): Promise<UrlResult> => {
  if (!token) throw new Error(MISSING_TOKEN)

  return fetchJsonApi<UrlResult>(
    `${String(process.env.NEXT_PUBLIC_TAXES_URL)}/payment/cardpay/by-year/2023`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  )
}

export const getEnum = async (id?: string) => {
  if (!id) {
    return []
  }

  try {
    const response = await fetch(`https://www.slovensko.sk/static/util/filler/lookup.aspx?id=${id}`)
    const responseText = await response.text()

    if (response.ok) {
      // remove rounded brackets and parse
      const data: { aaData: string[][] } = JSON.parse(responseText.slice(1, -2))
      return data.aaData?.map((x: string[]) => ({
        const: x[0],
        title: x[1],
      }))
    }

    throw new Error(responseText)
  } catch (error) {
    // TODO originally caught & rethrown to ensure logging, might no longer be necessary
    logger.error(error)
    throw error
  }
}

export const uploadFileToBucket = async (file: File, formId: string) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('filename', file.name)
  formData.append('id', createUuid())

  return fetchJsonApi(`${String(process.env.NEXT_PUBLIC_FORMS_URL)}/files/upload/${formId}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: formData,
  })
}

export const deleteFileFromBucket = async (
  fileName: string,
  fileScanStatus?: FileUpdatedResponseDtoStatusEnum,
) => {
  const params = new URLSearchParams({ fileName, fileScanStatus: fileScanStatus || '' })

  return fetchJsonApi(`/api/eforms/delete-file?${params.toString()}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

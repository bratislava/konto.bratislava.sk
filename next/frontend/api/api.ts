// TODO waiting on #305 to get merged, afterwards might move elsewhere
// frontend code for calling api endpoints grouped
import { RJSFSchema } from '@rjsf/utils'
import { ErrorObject } from 'ajv'

import { CreateFormDto, FormDto, UpdateFormDto } from '../dtos/formDto'
import { ApiError, Gdpr, Identity, TaxApiError, UrlResult, User } from '../dtos/generalApiDto'
import logger from '../utils/logger'

export const API_ERROR_TEXT = 'API_ERROR'
export const UNAUTHORIZED_ERROR_TEXT = 'UNAUTHORIZED_ERROR'

const fetchJsonApi = async <T = any>(path: string, options?: RequestInit): Promise<T> => {
  try {
    const response = await fetch(path, options)
    if (response.ok) {
      try {
        return (await response.json()) as T
      } catch (error) {
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
  token: string,
) => {
  return fetchJsonApi(`/api/eforms/${eformKey}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data, id: formId, token }),
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

export const xmlToFormData = (eform: string, data: string): Promise<RJSFSchema> => {
  return fetchJsonApi<RJSFSchema>(`/api/eforms/${eform}/transform/xmlToJson`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  })
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

export const subscribeApi = (data: { gdprData?: Gdpr[] }, token: string): Promise<User> => {
  return fetchJsonApi<User>(`${process.env.NEXT_PUBLIC_CITY_ACCOUNT_URL}/user/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
}

export const unsubscribeApi = (data: { gdprData?: Gdpr[] }, token: string): Promise<User> => {
  return fetchJsonApi<User>(`${process.env.NEXT_PUBLIC_CITY_ACCOUNT_URL}/user/unsubscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
}

export const getUserApi = (token: string): Promise<User> => {
  return fetchJsonApi<User>(`${process.env.NEXT_PUBLIC_CITY_ACCOUNT_URL}/user/get-or-create`, {
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

export const getForms = (token: string) => {
  return fetchJsonApi(`${process.env.NEXT_PUBLIC_FORMS_URL}/nases/forms`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
}

export const createForm = (token: string, data: CreateFormDto): Promise<FormDto> => {
  return fetchJsonApi<FormDto>(`${process.env.NEXT_PUBLIC_FORMS_URL}/nases/create-form`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
}

export const getForm = (token: string, id: string): Promise<FormDto> => {
  return fetchJsonApi<FormDto>(`${process.env.NEXT_PUBLIC_FORMS_URL}/nases/form/${id}`, {
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

export const getPaymentGatewayUrlApi = (token: string): Promise<UrlResult> => {
  return fetchJsonApi<UrlResult>(
    `${process.env.NEXT_PUBLIC_TAXES_URL}/payment/cardpay/by-year/2023`,
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

export const sendForm = (token: string, id: string, formDataXml: string) => {
  return fetchJsonApi(`${process.env.NEXT_PUBLIC_FORMS_URL}/nases/send-and-update-form/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ formDataXml }),
  })
}

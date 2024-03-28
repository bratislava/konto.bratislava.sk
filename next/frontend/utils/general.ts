import { ResponseTaxDto } from '@clients/openapi-tax'
import { GenericObjectType, RJSFSchema, UIOptionsType } from '@rjsf/utils'
import get from 'lodash/get'
import React from 'react'

import { environment } from '../../environment'

const isServer = () => typeof window === 'undefined'

export const isBrowser = () => !isServer()

export const isProductionDeployment = () => !environment.isStaging

export const getLanguageKey = (currentLanguage?: string) => {
  return currentLanguage === 'sk' ? 'sk' : 'en'
}

export const handleOnKeyPress = (
  event: React.KeyboardEvent,
  callback?: () => void,
  key = 'Enter',
) => {
  if (event.key === key) {
    callback?.()
  }
}

export const formatDate = (dateISOString: string | undefined | null) => {
  if (!dateISOString) return ''
  const date = new Date(dateISOString)
  return date.toLocaleDateString('sk-SK')
}

export const taxStatusHelper = (tax: ResponseTaxDto) => {
  // ignoring case when both tax paid and tax amount is not available
  const paymentStatus: 'paid' | 'unpaid' | 'partially_paid' =
    tax?.payedAmount === tax?.amount ? 'paid' : tax.payedAmount > 0 ? 'partially_paid' : 'unpaid'
  const hasMultipleInstallments = tax?.taxInstallments?.length > 1
  return { paymentStatus, hasMultipleInstallments }
}

export const base64ToArrayBuffer = (base64: string) => {
  const binaryString = window.atob(base64)
  const binaryLen = binaryString.length
  const bytes = new Uint8Array(binaryLen)
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < binaryLen; i++) {
    // eslint-disable-next-line unicorn/prefer-code-point
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

export const downloadBlob = (blob: Blob, fileName: string) => {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  link.click()
  URL.revokeObjectURL(link.href)
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null
}

// to be used in context where we do not have backend data
// otherwise, you can use frontendTitle field
export const getFormTitle = (
  uiOptions: UIOptionsType<any, RJSFSchema, any>,
  formData?: GenericObjectType | null,
  translationFallback?: string,
): string => {
  // TODO can be fixed by fixing OpenAPI types
  // until then, safe enough with all the fallbacks
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return (
    get(
      formData,
      uiOptions.titlePath &&
        typeof uiOptions.titlePath !== 'boolean' &&
        typeof uiOptions.titlePath !== 'object'
        ? uiOptions.titlePath
        : '__INVALID_PATH__',
    ) ||
    uiOptions?.titleFallback ||
    translationFallback
  )
}

import currency from 'currency.js'
import React from 'react'

import { environment } from '../../environment'
import { Tax } from '../dtos/taxDto'

export interface DocumentsWrapper {
  mainDocument?: {
    url: string
  }
  amedmentDocument?: []
  cancellationDocument?: []
  consolidatedText?: unknown
}

export const arrayify = (input: string | string[] | undefined | null) => {
  if (input === undefined || input === null) {
    return [] as undefined[]
  }
  if (typeof input === 'string') return [input]
  return input
}

// turn unknown values into (empty) strings, return string if it's a string
export const forceString = (input: unknown) => {
  if (typeof input === 'string') return input
  if (typeof input === 'number') return input.toString()
  if (Array.isArray(input)) return input.join(', ')
  return ''
}

export const fileCountVzns = (data: DocumentsWrapper) => {
  let count = 0
  if (data?.mainDocument?.url) {
    count += 1
  }
  if (data?.amedmentDocument) {
    count += data.amedmentDocument.length
  }
  if (data?.cancellationDocument) {
    count += data.cancellationDocument.length
  }
  if (data?.consolidatedText) {
    count += 1
  }
  return count
}

export const isPresent = <U>(a: U | null | undefined | void): a is U => {
  return !(a === null || a === undefined)
}

const isServer = () => typeof window === 'undefined'

export const isBrowser = () => !isServer()

export const isProductionDeployment = () => !environment.isStaging

// https://stackoverflow.com/questions/8511281/check-if-a-value-is-an-object-in-javascript
export const isObject = (value: any) =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

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

// TODO types
export const formatCurrency = (amount: number | undefined | null) => {
  if (typeof amount !== 'number') return '-- €'
  return currency(amount, { fromCents: true }).format({ symbol: '€', decimal: ',', separator: ' ' })
}

export const taxStatusHelper = (tax: Tax) => {
  // ignoring case when both tax paid and tax amount is not available
  const paymentStatus: 'paid' | 'unpaid' | 'partially_paid' =
    tax?.payedAmount === tax?.amount ? 'paid' : tax.payedAmount > 0 ? 'partially_paid' : 'unpaid'
  const hasMultipleInstallments = tax?.taxInstallments?.length > 1
  return { paymentStatus, hasMultipleInstallments }
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

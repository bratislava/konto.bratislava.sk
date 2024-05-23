/* eslint-disable @typescript-eslint/explicit-function-return-type,consistent-return,eslint-comments/disable-enable-pair */
import { mapKeys } from 'lodash'

import {
  DanZBytovANebytovychPriestorov,
  DanZoStaviebJedenUcel,
  DanZoStaviebViacereUcely,
  DanZPozemkov,
  TaxFormData,
  TaxPdfMapping,
} from '../types'

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
export function safeArray<T>(array: T[] | undefined): T[]
export function safeArray(array: any): []
export function safeArray<T>(array: T[] | any): T[] {
  if (Array.isArray(array)) {
    return array
  }

  return []
}

export function safeString(string: string | any): string | undefined {
  if (typeof string === 'string') {
    return string
  }
}

export function safeNumber(number: number | any): number | undefined {
  if (typeof number === 'number') {
    return number
  }
}

export function safeBoolean(
  boolean: boolean | any,
  undefinedFalse = true,
): boolean | undefined {
  if (typeof boolean === 'boolean') {
    return boolean
  }
  if (undefinedFalse && boolean === undefined) {
    return false
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */

const getPocet = (
  oddiel:
    | DanZPozemkov
    | DanZoStaviebJedenUcel
    | DanZoStaviebViacereUcely
    | DanZBytovANebytovychPriestorov
    | undefined,
) => {
  if (safeBoolean(oddiel?.vyplnitObject?.vyplnit) === true) {
    return safeArray(oddiel?.priznania).length
  }
  return 0
}

export function getPocty(data: TaxFormData) {
  return {
    pocetPozemkov: getPocet(data?.danZPozemkov),
    pocetStaviebJedenUcel: getPocet(data?.danZoStaviebJedenUcel),
    pocetStaviebViacereUcely: getPocet(data?.danZoStaviebViacereUcely),
    pocetBytov: getPocet(data?.danZBytovANebytovychPriestorov),
  }
}

/**
 * For each element in the array, the mapping function is called to create an object. If there are multiple elements
 * (these are duplicated PDF pages), the keys for properties beyond the first one are modified to include a copy index
 * (e.g., `key_Copy1`, `key_Copy2`, etc.).
 *
 * @example
 * // Example usage:
 * const result = generateCopies(
 *   [{ value: 'first' }, { value: "second" }, { value: 'third'} ],
 *   (element, index) => ({ ['1_Key']: element.value })
 * );
 *
 * // Expected output:
 * // {
 * //   '1_Key': 'first',
 * //   '1_Key_Copy1': 'second',
 * //   '1_Key_Copy2': 'third'
 * // }
 */
export function generateCopies<T>(
  array: T[],
  fn: (element: T, index: number) => TaxPdfMapping,
): TaxPdfMapping {
  return (
    array
      .map((element, index) => fn(element, index))
      .map((object, index) => {
        if (index === 0) {
          return object
        }
        return mapKeys(object, (value, key) => `${key}_Copy${index}`)
      })
      // eslint-disable-next-line unicorn/no-array-reduce
      .reduce((acc, object) => ({ ...acc, ...object }), {} as TaxPdfMapping)
  )
}

export function formatDate(date: string | undefined) {
  if (safeString(date) == null) {
    return
  }
  // Check if is in YYYY-MM-DD format
  // https://stackoverflow.com/a/51759570
  const dateObj = new Date(date as string)
  if (
    Number.isNaN(dateObj.getTime()) ||
    dateObj.toISOString().slice(0, 10) !== date
  ) {
    return
  }

  const [year, month, day] = date.split('-')
  return `${day}.${month}.${year}`
}

export function formatDecimal(
  decimal: number | null | undefined,
  forceDecimals = false,
) {
  if (decimal == null) {
    return
  }
  return decimal.toLocaleString('sk-SK', {
    minimumFractionDigits: forceDecimals ? 2 : 0,
    maximumFractionDigits: 2,
    useGrouping: false,
  })
}

export function formatInteger(integer: number | null | undefined) {
  if (integer == null) {
    return
  }
  return integer.toLocaleString('sk-SK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: false,
  })
}

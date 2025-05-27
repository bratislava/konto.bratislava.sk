import { mapKeys } from 'lodash'

import { ParsedRodneCislo } from '../shared/functions'
import { TaxPdfMapping } from '../../types'

export function mergeObjects<T extends object>(array: T[]): T {
  return array.reduce((acc, object) => ({ ...acc, ...object }), {} as T)
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
  const mappedArray = array
    .map((element, index) => fn(element, index))
    .map((object, index) => {
      if (index === 0) {
        return object
      }
      return mapKeys(object, (value, key) => `${key}_Copy${index}`)
    })

  return mergeObjects(mappedArray)
}

export function formatDecimalPdf(decimal: number | null | undefined, forceDecimals = false) {
  if (decimal == null) {
    return
  }
  return decimal.toLocaleString('sk-SK', {
    minimumFractionDigits: forceDecimals ? 2 : 0,
    maximumFractionDigits: 2,
    useGrouping: false,
  })
}

export function formatIntegerPdf(integer: number | null | undefined) {
  if (integer == null) {
    return
  }
  return integer.toLocaleString('sk-SK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: false,
  })
}

export function formatRodneCisloFirstPartPdf(parsedRodneCislo: ParsedRodneCislo | undefined) {
  if (!parsedRodneCislo?.isValid) {
    return
  }

  return parsedRodneCislo.firstPart
}

export function formatRodneCisloSecondPartPdf(parsedRodneCislo: ParsedRodneCislo | undefined) {
  if (!parsedRodneCislo?.isValid) {
    return
  }

  return parsedRodneCislo.secondPart
}

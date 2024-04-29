/* eslint-disable @typescript-eslint/explicit-function-return-type,eslint-comments/disable-enable-pair,consistent-return */

import { rodnecislo } from 'rodnecislo'

import {
  DanZBytovANebytovychPriestorov,
  DanZoStaviebJedenUcel,
  DanZoStaviebViacereUcely,
  DanZPozemkov,
  TaxFormData,
} from '../types'
import { fixDate, parseDate } from './dates'

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
export function safeArray<T>(array: T[] | undefined): T[]
export function safeArray(array: any): []
export function safeArray<T>(array: T[] | any): T[] {
  if (Array.isArray(array)) {
    return array
  }

  return []
}

// TODO enums
export function safeString<T extends string>(string: T | any): T | undefined {
  if (typeof string === 'string') {
    return string as T
  }
}

export function safeNumber(number: number | any): number | undefined {
  if (typeof number === 'number') {
    return number
  }
}

export const parseDateFieldDate = (date: string | any) =>
  parseDate(date, 'YYYY-MM-DD')

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

export type ParsedRodneCislo =
  | {
      isValid: true
      firstPart: string
      secondPart: string
      value: string
    }
  | {
      isValid: false
      value: string | undefined
    }

export function parseRodneCislo(
  rodneCisloOrBirthDate: string | undefined,
): ParsedRodneCislo {
  const value = safeString(rodneCisloOrBirthDate)
  if (!value) {
    return {
      isValid: false,
      value: undefined,
    }
  }

  const rodneCisloParsed = rodnecislo(value)
  if (rodneCisloParsed.isValid()) {
    const [firstPart, secondPart] = (() => {
      // `rodnecislo` accepts both the variant with slash and without
      // https://github.com/kub1x/rodnecislo?tab=readme-ov-file#regexp
      if (value.includes('/')) {
        return value.split('/') as [string, string]
      }
      return [value.slice(0, 6), value.slice(6)]
    })()

    return {
      isValid: true,
      firstPart,
      secondPart,
      value,
    }
  }

  return {
    isValid: false,
    value,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseBirthDate(rodneCisloOrBirthDate: string | any) {
  if (typeof rodneCisloOrBirthDate !== 'string') {
    return
  }

  const rodneCisloParsed = rodnecislo(rodneCisloOrBirthDate)
  if (rodneCisloParsed.isValid()) {
    return fixDate(rodneCisloParsed.birthDate())
  }

  const dateParsed = parseDate(rodneCisloOrBirthDate, 'DD.MM.YYYY')
  if (dateParsed) {
    return dateParsed
  }
}

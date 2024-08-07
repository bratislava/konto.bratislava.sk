import { getPocty } from '../shared/functions'
import { prilohyShared } from '../shared/prilohyShared'
import { TaxFormData, TaxPdfMapping } from '../../types'
import { formatIntegerPdf } from './functions'

const poctyKeys = [
  'pocetPozemkov',
  'pocetStaviebJedenUcel',
  'pocetStaviebViacereUcely',
  'pocetBytov',
] as const

type ArrayToUnion<A extends ReadonlyArray<string>> = A[number]

/**
 * Map of the section to the index the fields for the section are prefixed with.
 */
const typeIndexMapping: Record<ArrayToUnion<typeof poctyKeys>, number> = {
  pocetPozemkov: 3,
  pocetStaviebJedenUcel: 4,
  pocetStaviebViacereUcely: 5,
  pocetBytov: 6,
}

/**
 * Generates fields that appear on the right top corner on each page, for each page they are incremented.
 */
function getPrilohaCisloFields(data: TaxFormData) {
  const pocty = getPocty(data)
  const { zobrazitOslobodenie } = prilohyShared(data)
  const prilohaCisloFields: TaxPdfMapping = {}
  let count = 1

  poctyKeys.forEach((key) => {
    const pocet = pocty[key]
    if (pocet) {
      for (let i = 0; i < pocet; i++) {
        const prefixIndex = typeIndexMapping[key]
        // Copied section pages have _Copy{index} suffix.
        const prilohyKey = i === 0 ? `${prefixIndex}_Priloha` : `${prefixIndex}_Priloha_Copy${i}`

        prilohaCisloFields[prilohyKey] = String(count++)
      }
    }
  })
  if (zobrazitOslobodenie) {
    prilohaCisloFields['12_Priloha'] = String(count++)
  }

  return prilohaCisloFields
}

function formatNonZeroInteger(value: number) {
  return value === 0 ? undefined : formatIntegerPdf(value)
}

export const prilohy = (data: TaxFormData) => {
  const mapping = prilohyShared(data)
  const currentDate = new Date()
  const prilohaCisloFields = getPrilohaCisloFields(data)

  return {
    '2_Priloha1': formatNonZeroInteger(mapping.oddiel2),
    '2_Priloha2': formatNonZeroInteger(mapping.oddiel3),
    '2_Priloha3': formatNonZeroInteger(mapping.oddiel4),
    '2_Priloha7': mapping.zobrazitOslobodenie ? '1' : undefined,
    '2_Datum1': currentDate.getDate().toString().padStart(2, '0'),
    '2_Datum2': (currentDate.getMonth() + 1).toString().padStart(2, '0'),
    '2_Datum4': currentDate.getFullYear().toString().slice(-2),
    ...prilohaCisloFields,
  }
}

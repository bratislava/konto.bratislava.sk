/* eslint-disable import/prefer-default-export,@typescript-eslint/explicit-function-return-type,eslint-comments/disable-enable-pair,no-plusplus */
import { TaxFormData, TaxPdfMapping } from '../types'
import { formatInteger, getPocty } from './functions'
import { zobrazitOslobodenie } from './oslobodenie'

const typeIndexMapping = {
  pocetPozemkov: 3,
  pocetStaviebJedenUcel: 4,
  pocetStaviebViacereUcely: 5,
  pocetBytov: 6,
}

function getPrilohaCisloFields(data: TaxFormData) {
  const pocty = getPocty(data)
  const prilohaCisloFields: TaxPdfMapping = {}
  let count = 1

  const poctyEntries = Object.entries(pocty) as [keyof typeof pocty, number][]
  poctyEntries.forEach(([key, pocet]) => {
    if (pocet) {
      for (let i = 0; i < pocet; i++) {
        const mappedIndex = typeIndexMapping[key]
        const prilohyKey =
          i === 0 ? `${mappedIndex}_Priloha` : `${mappedIndex}_Priloha_Copy${i}`

        prilohaCisloFields[prilohyKey] = String(count++)
      }
    }
  })
  if (zobrazitOslobodenie(data)) {
    prilohaCisloFields['12_Priloha'] = String(count++)
  }

  return prilohaCisloFields
}

function formatNonZeroInteger(value: number) {
  return value === 0 ? undefined : formatInteger(value)
}

export const prilohy = (data: TaxFormData) => {
  const pocty = getPocty(data)
  const currentDate = new Date()
  const prilohaCisloFields = getPrilohaCisloFields(data)

  return {
    '2_Priloha1': formatNonZeroInteger(pocty.pocetPozemkov),
    '2_Priloha2': formatNonZeroInteger(
      pocty.pocetStaviebJedenUcel + pocty.pocetStaviebViacereUcely,
    ),
    '2_Priloha3': formatNonZeroInteger(pocty.pocetBytov),
    '2_Priloha7': zobrazitOslobodenie(data) ? '1' : undefined,
    '2_Datum1': currentDate.getDate().toString().padStart(2, '0'),
    '2_Datum2': (currentDate.getMonth() + 1).toString().padStart(2, '0'),
    '2_Datum4': currentDate.getFullYear().toString().slice(-2),
    ...prilohaCisloFields,
  }
}

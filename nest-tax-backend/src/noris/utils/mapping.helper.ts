import { TaxAdministrator, TaxDetailareaType } from '@prisma/client'
import currency from 'currency.js'

import { NorisRealEstateTax } from '../types/noris.types'
import {
  AreaTypesEnum,
  DeliveryMethod,
  DeliveryMethodNoris,
} from './noris.types'

export const convertCurrencyToInt = (value: string): number => {
  return currency(value.replace(',', '.')).intValue
}

// Helper mapping functions to improve maintainability
export const mapNorisToTaxPayerData = (
  data: NorisRealEstateTax,
  taxAdministrator: TaxAdministrator,
) => {
  return {
    birthNumber: data.ICO_RC,
    permanentResidenceAddress: data.adresa_tp_sidlo,
    externalId: data.subjekt_refer,
    name: data.subjekt_nazev,
    permanentResidenceStreet: data.ulica_tb_cislo,
    permanentResidenceZip: data.psc_ref_tb,
    permanentResidenceStreetTxt: data.TXT_UL,
    permanentResidenceCity: data.obec_nazev_tb,
    nameTxt: data.TXT_MENO,
    taxAdministratorId: taxAdministrator.id,
  }
}

export const mapNorisToTaxAdministratorData = (data: NorisRealEstateTax) => {
  return {
    email: data.vyb_email,
    externalId: data.cislo_poradace.toString(),
    id: data.vyb_id,
    name: data.vyb_nazov,
    phoneNumber: data.vyb_telefon_prace,
  }
}

export const mapNorisToTaxData = (
  data: NorisRealEstateTax,
  year: number,
  taxPayerId: number,
) => {
  return {
    amount: convertCurrencyToInt(data.dan_spolu),
    year,
    taxPayerId,
    variableSymbol: data.variabilny_symbol,
    dateCreateTax: data.akt_datum,
    dateTaxRuling: data.datum_platnosti,
    taxId: data.cislo_konania,
    taxLand: convertCurrencyToInt(data.dan_pozemky),
    taxConstructions: convertCurrencyToInt(data.dan_stavby_SPOLU),
    taxFlat: convertCurrencyToInt(data.dan_byty),
  }
}

type TaxInstallment = {
  taxId: number
  amount: number
  text: string | null
  order: number
}

export const mapNorisToTaxInstallmentsData = (
  data: NorisRealEstateTax,
  taxId: number,
): TaxInstallment[] => {
  if (data.SPL4_2 === '') {
    return [
      {
        taxId,
        amount: convertCurrencyToInt(data.SPL1),
        order: 1,
        text: data.TXTSPL1,
      },
    ]
  }

  return [
    {
      taxId,
      amount: convertCurrencyToInt(data.SPL4_1),
      order: 1,
      text: data.TXTSPL4_1,
    },
    {
      taxId,
      amount: convertCurrencyToInt(data.SPL4_2),
      order: 2,
      text: data.TXTSPL4_2,
    },
    {
      taxId,
      amount: convertCurrencyToInt(data.SPL4_3),
      order: 3,
      text: data.TXTSPL4_3,
    },
  ]
}

export const mapDeliveryMethodToNoris = (
  deliveryMethod: DeliveryMethod | null,
): DeliveryMethodNoris | null => {
  if (deliveryMethod === null) return null

  const mapping: Record<DeliveryMethod, DeliveryMethodNoris> = {
    [DeliveryMethod.EDESK]: DeliveryMethodNoris.EDESK,
    [DeliveryMethod.CITY_ACCOUNT]: DeliveryMethodNoris.CITY_ACCOUNT,
    [DeliveryMethod.POSTAL]: DeliveryMethodNoris.EDESK, // Postal is saved in Noris as EDESK ('E')
  }

  const norisMethod = mapping[deliveryMethod]
  if (!norisMethod) {
    throw new Error(`Unknown delivery method: ${deliveryMethod}`)
  }
  return norisMethod
}

export type TaxDetail = {
  taxId: number
  areaType: TaxDetailareaType
  type: AreaTypesEnum
  base: number
  amount: number
  area: string | null
}
export const mapNorisToTaxDetailData = (
  data: NorisRealEstateTax,
  taxId: number,
): TaxDetail[] => {
  const config: Record<
    string,
    {
      areaType: AreaTypesEnum
      base: string
      amount: string
      area: string | false
      types: TaxDetailareaType[]
    }
  > = {
    pozemky: {
      areaType: AreaTypesEnum.GROUND,
      base: 'ZAKLAD',
      amount: 'DAN',
      area: 'VYMERA',
      types: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    },
    stavba: {
      areaType: AreaTypesEnum.CONSTRUCTION,
      base: 'ZAKLAD',
      amount: 'DAN',
      area: false,
      types: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'jH', 'jI', 'H'],
    },
    byt: {
      areaType: AreaTypesEnum.APARTMENT,
      base: 'zaklad_dane',
      amount: 'dan_byty',
      area: false,
      types: ['byt', 'nebyt'],
    },
  }

  const response: TaxDetail[] = []

  Object.entries(config).forEach(([keyTaxConfig, valueTaxConfig]) => {
    valueTaxConfig.types.forEach((taxType) => {
      const prefix = keyTaxConfig === 'byt' ? 'det' : `det_${keyTaxConfig}`

      const baseKey =
        `${prefix}_${valueTaxConfig.base}_${taxType}` as keyof NorisRealEstateTax
      const amountKey =
        `${prefix}_${valueTaxConfig.amount}_${taxType}` as keyof NorisRealEstateTax

      const taxDetailItem: TaxDetail = {
        taxId,
        areaType: taxType,
        type: valueTaxConfig.areaType,
        base: currency((data[baseKey] as string).replace(',', '.')).intValue,
        amount: currency((data[amountKey] as string).replace(',', '.'))
          .intValue,
        area: valueTaxConfig.area
          ? (data[
              `${prefix}_${valueTaxConfig.area}_${taxType}` as keyof NorisRealEstateTax
            ] as string)
          : null,
      }

      response.push(taxDetailItem)
    })
  })

  return response
}

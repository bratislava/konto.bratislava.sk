import { TaxType } from '@prisma/client'
import currency from 'currency.js'

import {
  CommunalWasteTaxDetail,
  RealEstateTaxAreaType,
  RealEstateTaxDetail,
  RealEstateTaxPropertyType,
} from '../../prisma/json-types'
import { DeliveryMethod, DeliveryMethodNoris } from '../types/noris.enums'
import {
  NorisBaseTax,
  NorisCommunalWasteTaxGrouped,
  NorisRealEstateTax,
} from '../types/noris.types'

export const convertCurrencyToInt = (value: string): number => {
  return currency(value.replace(',', '.')).intValue
}

export const mapNorisToTaxPayerData = (data: NorisBaseTax) => {
  return {
    birthNumber: data.ICO_RC,
    externalId: data.subjekt_refer,
    name: data.subjekt_nazev,
    permanentResidenceStreet: data.ulica_tb_cislo,
    permanentResidenceZip: data.psc_ref_tb,
    permanentResidenceCity: data.obec_nazev_tb,
  }
}

type NorisTaxAdministratorData = {
  email: string
  externalId: string
  id: number
  name: string
  phoneNumber: string
}

export const mapNorisToTaxAdministratorData = (
  data: NorisBaseTax,
): NorisTaxAdministratorData | undefined => {
  return data.vyb_id && data.vyb_telefon_prace && data.vyb_email
    ? {
        email: data.vyb_email,
        externalId: data.cislo_poradace.toString(),
        id: data.vyb_id,
        name: data.vyb_nazov,
        phoneNumber: data.vyb_telefon_prace,
      }
    : undefined
}

export type DatabaseBaseTaxData = {
  amount: number
  year: number
  taxPayerId: number
  variableSymbol: string
  dateCreateTax: string | null
  dateTaxRuling: Date | null
  taxId: string | null
  isCancelled: boolean
}

type TaxInstallment = {
  taxId: number
  amount: number
  text: string | null
  order: number
}

export const mapNorisToTaxInstallmentsData = (
  data: NorisBaseTax,
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

  const installments = [
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
  if (data.SPL4_4) {
    installments.push({
      taxId,
      amount: convertCurrencyToInt(data.SPL4_4),
      order: 4,
      text: data.TXTSPL4_4,
    })
  }
  return installments
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

export const mapNorisToDatabaseBaseTax = (
  data: NorisBaseTax,
  year: number,
  taxPayerId: number,
): DatabaseBaseTaxData => {
  return {
    amount: convertCurrencyToInt(data.dan_spolu),
    year,
    taxPayerId,
    variableSymbol: data.variabilny_symbol,
    dateCreateTax: data.akt_datum,
    dateTaxRuling: data.datum_platnosti,
    taxId: data.cislo_konania,
    isCancelled: data.stav_dokladu === 'S',
  }
}

export const mapNorisToCommunalWasteDatabaseDetail = (
  data: NorisCommunalWasteTaxGrouped,
): CommunalWasteTaxDetail => {
  return {
    type: TaxType.KO,
    addresses: data.addresses.map((address) => ({
      addressDetail: address.addressDetail,
      containers: address.containers.map((container) => ({
        ...container,
        poplatok: convertCurrencyToInt(container.poplatok.toString()),
      })),
    })),
  }
}

export const mapNorisToRealEstateDatabaseDetail = (
  data: NorisRealEstateTax,
): RealEstateTaxDetail => {
  const config: Record<
    string,
    {
      areaType: RealEstateTaxPropertyType
      base: string
      amount: string
      area: string | false
      types: RealEstateTaxAreaType[]
    }
  > = {
    pozemky: {
      areaType: RealEstateTaxPropertyType.GROUND,
      base: 'ZAKLAD',
      amount: 'DAN',
      area: 'VYMERA',
      types: [
        RealEstateTaxAreaType.A,
        RealEstateTaxAreaType.B,
        RealEstateTaxAreaType.C,
        RealEstateTaxAreaType.D,
        RealEstateTaxAreaType.E,
        RealEstateTaxAreaType.F,
        RealEstateTaxAreaType.G,
        RealEstateTaxAreaType.H,
      ],
    },
    stavba: {
      areaType: RealEstateTaxPropertyType.CONSTRUCTION,
      base: 'ZAKLAD',
      amount: 'DAN',
      area: false,
      types: [
        RealEstateTaxAreaType.A,
        RealEstateTaxAreaType.B,
        RealEstateTaxAreaType.C,
        RealEstateTaxAreaType.D,
        RealEstateTaxAreaType.E,
        RealEstateTaxAreaType.F,
        RealEstateTaxAreaType.G,
        RealEstateTaxAreaType.jH,
        RealEstateTaxAreaType.jI,
        RealEstateTaxAreaType.H,
      ],
    },
    byt: {
      areaType: RealEstateTaxPropertyType.APARTMENT,
      base: 'zaklad_dane',
      amount: 'dan_byty',
      area: false,
      types: [RealEstateTaxAreaType.byt, RealEstateTaxAreaType.nebyt],
    },
  }

  const details: RealEstateTaxDetail = {
    type: TaxType.DZN,
    taxLand: convertCurrencyToInt(data.dan_pozemky),
    taxConstructions: convertCurrencyToInt(data.dan_stavby_SPOLU),
    taxFlat: convertCurrencyToInt(data.dan_byty),
    propertyDetails: [],
  }

  Object.entries(config).forEach(([keyTaxConfig, valueTaxConfig]) => {
    valueTaxConfig.types.forEach((taxType) => {
      const prefix = keyTaxConfig === 'byt' ? 'det' : `det_${keyTaxConfig}`

      const baseKey =
        `${prefix}_${valueTaxConfig.base}_${taxType}` as keyof NorisRealEstateTax
      const amountKey =
        `${prefix}_${valueTaxConfig.amount}_${taxType}` as keyof NorisRealEstateTax

      const taxDetailItem = {
        areaType: taxType,
        type: valueTaxConfig.areaType,
        base: convertCurrencyToInt(data[baseKey] as string),
        amount: convertCurrencyToInt(data[amountKey] as string),
        area: valueTaxConfig.area
          ? (data[
              `${prefix}_${valueTaxConfig.area}_${taxType}` as keyof NorisRealEstateTax
            ] as string)
          : undefined,
      }

      details.propertyDetails.push(taxDetailItem)
    })
  })

  return details
}

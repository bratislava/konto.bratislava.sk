import { TaxAdministrator } from '@prisma/client'
import currency from 'currency.js'

import { NorisTaxPayersDto } from '../../noris/noris.dto'

interface TaxInstallmentsData {
  taxId: number
  amount: number
  text: string
  order: number
}

export const convertCurrencyToInt = (value: string): number => {
  return currency(value.replace(',', '.')).intValue
}

// Helper mapping functions to improve maintainability
export const mapNorisToTaxPayerData = (
  data: NorisTaxPayersDto,
  taxAdministrator: TaxAdministrator,
) => {
  return {
    active: true,
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

export const mapNorisToTaxAdministratorData = (data: NorisTaxPayersDto) => {
  return {
    email: data.vyb_email,
    externalId: data.cislo_poradace.toString(),
    id: data.vyb_id,
    name: data.vyb_nazov,
    phoneNumber: data.vyb_telefon_prace,
  }
}

export const mapNorisToTaxData = (
  data: NorisTaxPayersDto,
  year: number,
  taxPayerId: number,
  qrCodeEmail: string,
  qrCodeWeb: string,
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
    qrCodeEmail,
    qrCodeWeb,
  }
}

export const mapNorisToTaxInstallmentsData = (
  data: NorisTaxPayersDto,
  taxId: number,
): TaxInstallmentsData[] => {
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

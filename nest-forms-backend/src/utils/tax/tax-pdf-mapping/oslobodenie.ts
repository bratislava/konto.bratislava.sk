/* eslint-disable import/prefer-default-export,@typescript-eslint/explicit-function-return-type,eslint-comments/disable-enable-pair */
import { TaxFormData } from '../types'
import { safeArray, safeString } from './functions'
import { udajeODanovnikovi } from './udajeODanovnikovi'

export const oslobodenie = (data: TaxFormData) => {
  const udaje = udajeODanovnikovi(data)

  return {
    '12_Ico': udaje.Ico,
    '12_RodneCislo1': udaje.RodneCislo1,
    '12_RodneCislo2': udaje.RodneCislo2,
    '12_Obec': 'Bratislava',
    '12_chb1': false,
    '12_chb2': safeArray(data.znizenieAleboOslobodenieOdDane?.pozemky).includes(
      'option1',
    ),
    '12_chb3': safeArray(data.znizenieAleboOslobodenieOdDane?.pozemky).includes(
      'option2',
    ),
    '12_chb4': false,
    '12_chb5': safeArray(data.znizenieAleboOslobodenieOdDane?.pozemky).includes(
      'option3',
    ),
    '12_chb6': false,
    '12_chb7': false,
    '12_chb8': false,
    '12_chb9': false,
    '12_chb10': false,
    '12_chb11': safeArray(
      data.znizenieAleboOslobodenieOdDane?.pozemky,
    ).includes('option4'),
    '12_chb12': false,
    '12_chb13': false,
    '12_chb14': safeArray(data.znizenieAleboOslobodenieOdDane?.stavby).includes(
      'option1',
    ),
    '13_chb1': false,
    '13_chb2': safeArray(data.znizenieAleboOslobodenieOdDane?.stavby).includes(
      'option2',
    ),
    '13_chb3': safeArray(data.znizenieAleboOslobodenieOdDane?.stavby).includes(
      'option3',
    ),
    '13_chb4': false,
    '13_chb5': false,
    '13_chb6': false,
    '13_chb7': false,
    '13_chb8': safeArray(data.znizenieAleboOslobodenieOdDane?.byty).includes(
      'option1',
    ),
    '13_chb9': safeArray(data.znizenieAleboOslobodenieOdDane?.byty).includes(
      'option2',
    ),
    '13_Poznamka': safeString(data.znizenieAleboOslobodenieOdDane?.poznamka),
  }
}

export const zobrazitOslobodenie = (data: TaxFormData) => {
  const oslobodenieMapping = oslobodenie(data)
  const poznamka = oslobodenieMapping['13_Poznamka']

  const anyOptionSelected = (
    [
      '12_chb2',
      '12_chb3',
      '12_chb5',
      '12_chb11',
      '12_chb14',
      '13_chb2',
      '13_chb3',
      '13_chb8',
      '13_chb9',
    ] as const
  ).some((key) => oslobodenieMapping[key])
  const nonEmptyPoznamka =
    typeof poznamka === 'string' && poznamka.trim() !== ''

  return anyOptionSelected || nonEmptyPoznamka
}

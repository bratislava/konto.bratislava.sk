import { formatDatePdf } from '../shared/dates'
import { oddiel3ViacereUcelyShared } from '../shared/oddiel3ViacereUcelyShared'
import { TaxFormData } from '../../types'
import {
  formatDecimalPdf,
  formatIntegerPdf,
  formatRodneCisloFirstPartPdf,
  formatRodneCisloSecondPartPdf,
  generateCopies,
  mergeObjects,
} from './functions'
import { udajeODanovnikovi } from './udajeODanovnikovi'

function splitNumber(inputNumber: number) {
  const formattedDecimal = formatDecimalPdf(inputNumber, true)
  if (formattedDecimal == null) {
    return { integerPart: undefined, decimalPart: undefined }
  }

  const [integerPart, decimalPart] = formattedDecimal.split(',')

  return {
    integerPart,
    decimalPart,
  }
}

export const oddiel3ViacereUcely = (data: TaxFormData) => {
  const udaje = udajeODanovnikovi(data)
  const mapping = oddiel3ViacereUcelyShared(data)

  return generateCopies(mapping, (priznanie) => {
    const stavbyFields = (['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'] as const).map(
      (type, index) => {
        const vymera = priznanie.vymeryStaviebPodlaTypu[type]
        if (vymera === 0) {
          return {}
        }
        const { integerPart, decimalPart } = splitNumber(vymera)
        return {
          [`5_VymeraPloch${index + 1}`]: integerPart,
          [`5_VymeraPlochK${index + 1}`]: decimalPart,
        }
      },
    )

    return {
      '5_Ico': udaje.Ico,
      '5_RodneCislo1': udaje.RodneCislo1,
      '5_RodneCislo2': udaje.RodneCislo2,
      '5_Obec': 'Bratislava',
      '5_Ulica': priznanie.ulicaACisloDomu,
      '5_CisloSupisne': formatIntegerPdf(priznanie.supisneCislo),
      '5_NazovUzemia': priznanie.katastralneUzemie,
      '5_CisloParcely': priznanie.cisloParcely,
      '5_chbVlastnik': priznanie.isVlastnik,
      '5_chbSpravca': priznanie.isSpravca,
      '5_chbNajomca': priznanie.isNajomca,
      '5_chbUzivatel': priznanie.isUzivatel,
      '5_chbSpolPodiel': priznanie.isPodieloveSpoluvlastnictvo,
      '5_chbSpolBezpodiel': priznanie.isBezpodieloveSpoluvlastnictvo,
      '5_RodneCislo3': formatRodneCisloFirstPartPdf(priznanie.rodneCisloManzelaManzelky),
      '5_RodneCislo4': formatRodneCisloSecondPartPdf(priznanie.rodneCisloManzelaManzelky),
      '5_PocetSpol': formatIntegerPdf(priznanie.pocetSpoluvlastnikov),
      '5_chbDohodaSpolAno': priznanie.spoluvlastnikUrcenyDohodou === true,
      '5_chbDohodaSpolNie': priznanie.spoluvlastnikUrcenyDohodou === false,
      '5_PopisStavby': priznanie.popisStavby,
      '5_DatumVzniku': formatDatePdf(priznanie.datumVznikuDanovejPovinnosti),
      '5_DatumZaniku': formatDatePdf(priznanie.datumZanikuDanovejPovinnosti),
      '5_ZakladDane': formatIntegerPdf(priznanie.zakladDane),
      '5_CelkovaVymera': formatIntegerPdf(priznanie.celkovaVymera),
      '5_VymeraOslobodena': formatIntegerPdf(
        priznanie.vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb,
      ),
      '5_PocetPodlazi': formatIntegerPdf(
        priznanie?.pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia,
      ),
      '5_Poznamka': priznanie.poznamka,
      ...mergeObjects(stavbyFields),
    }
  })
}

import { formatDatePdf } from '../shared/dates'
import { oddiel2Shared } from '../shared/oddiel2Shared'
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

export const oddiel2 = (data: TaxFormData) => {
  const udaje = udajeODanovnikovi(data)
  const mapping = oddiel2Shared(data)

  return generateCopies(mapping, (priznanie) => {
    const pozemky = priznanie.pozemky.map((pozemok, pozemokIndex) => {
      const fixedIndex = pozemokIndex + 1

      return {
        [`3_Pc${fixedIndex}`]: `${fixedIndex}.`,
        [`3_NazovKat${fixedIndex}`]: pozemok.katastralneUzemie,
        [`3_CisloParcely${fixedIndex}`]: pozemok.cisloParcely,
        [`3_DruhPozemku${fixedIndex}`]: pozemok.druhPozemku,
        [`3_VyuzitiePozemku${fixedIndex}`]: pozemok.sposobVyuzitiaPozemku,
        [`3_DatumVzniku${fixedIndex}`]: formatDatePdf(pozemok.datumVznikuDanovejPovinnosti),
        [`3_VymeraPozemku${fixedIndex}`]: formatDecimalPdf(pozemok.vymeraPozemku),
        [`3_DatumZaniku${fixedIndex}`]: formatDatePdf(pozemok.datumZanikuDanovejPovinnosti),
      }
    })

    return {
      '3_Ico': udaje.Ico,
      '3_RodneCislo1': udaje.RodneCislo1,
      '3_RodneCislo2': udaje.RodneCislo2,
      '3_Obec': priznanie.obec,
      '3_chbHodnotaAno': priznanie.hodnotaUrcenaZnaleckymPosudkom,
      '3_chbHodnotaNie': !priznanie.hodnotaUrcenaZnaleckymPosudkom,
      '3_chbVlastnik': priznanie.isVlastnik,
      '3_chbSpravca': priznanie.isSpravca,
      '3_chbNajomca': priznanie.isNajomca,
      '3_chbUzivatel': priznanie.isUzivatel,
      '3_chbSpolPodiel': priznanie.isPodieloveSpoluvlastnictvo,
      '3_chbSpolBezpodiel': priznanie.isBezpodieloveSpoluvlastnictvo,
      '3_RodneCislo1Man': formatRodneCisloFirstPartPdf(priznanie.rodneCisloManzelaManzelky),
      '3_RodneCislo2Man': formatRodneCisloSecondPartPdf(priznanie.rodneCisloManzelaManzelky),
      '3_PocetSpol': formatIntegerPdf(priznanie.pocetSpoluvlastnikov),
      '3_chbDohodaSpolAno': priznanie.spoluvlastnikUrcenyDohodou === true,
      '3_chbDohodaSpolNie': priznanie.spoluvlastnikUrcenyDohodou === false,
      '3_Poznamka': priznanie.poznamka,
      ...mergeObjects(pozemky),
    }
  })
}

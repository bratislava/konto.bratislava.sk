import { formatDatePdf } from '../shared/dates'
import { oddiel4Shared } from '../shared/oddiel4Shared'
import { TaxFormData } from '../../types'
import {
  formatIntegerPdf,
  formatRodneCisloFirstPartPdf,
  formatRodneCisloSecondPartPdf,
  generateCopies,
  mergeObjects,
} from './functions'
import { udajeODanovnikovi } from './udajeODanovnikovi'

// Both fields have broken names in the original PDF, so we need to fix them.
const getCisloPriestoruFieldName = (index: number) =>
  index <= 2 ? `6_Cislo Priest${index}` : `6_CisloPriest${index}`

const getUcelVyuzitiaFieldName = (index: number) =>
  index >= 4 ? `6_UcelVVyuzitia${index}` : `6_UcelVyuzitia${index}`

export const oddiel4 = (data: TaxFormData) => {
  const udaje = udajeODanovnikovi(data)
  const mapping = oddiel4Shared(data)

  return generateCopies(mapping, (priznanie) => {
    const nebytovePriestoryObjects = priznanie.nebytovePriestory.map(
      (nebytovyPriestor, nebytovyPriestorIndex) => {
        const fixedIndex = nebytovyPriestorIndex + 1

        return {
          [`6_Pc${fixedIndex}`]: `${fixedIndex}.`,
          [getCisloPriestoruFieldName(fixedIndex)]:
            nebytovyPriestor.cisloNebytovehoPriestoruVBytovomDome,
          [getUcelVyuzitiaFieldName(fixedIndex)]:
            nebytovyPriestor.ucelVyuzitiaNebytovehoPriestoruVBytovomDome,
          [`6_DatumVzniku${fixedIndex}`]: formatDatePdf(
            nebytovyPriestor.datumVznikuDanovejPovinnosti,
          ),
          [`6_VymeraPozemku${fixedIndex}`]: formatIntegerPdf(
            nebytovyPriestor.vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome,
          ),
          [`6_DatumZaniku${fixedIndex}`]: formatDatePdf(
            nebytovyPriestor.datumZanikuDanovejPovinnosti,
          ),
        }
      },
    )

    return {
      '6_Ico': udaje.Ico,
      '6_RodneCislo1': udaje.RodneCislo1,
      '6_RodneCislo2': udaje.RodneCislo2,
      '6_Obec': 'Bratislava',
      '6_Ulica': priznanie.ulicaACisloDomu,
      '6_CisloSupisne': formatIntegerPdf(priznanie.supisneCislo),
      '6_NazovUzemia': priznanie.katastralneUzemie,
      '6_CisloParcely': priznanie.cisloParcely,
      '6_chbVlastnik': priznanie.isVlastnik,
      '6_chbSpravca': priznanie.isSpravca,
      '6_chbSpolPodiel': priznanie.isPodieloveSpoluvlastnictvo,
      '6_chbSpolBezpodiel': priznanie.isBezpodieloveSpoluvlastnictvo,
      '6_RodneCislo3': formatRodneCisloFirstPartPdf(priznanie.rodneCisloManzelaManzelky),
      '6_RodneCislo4': formatRodneCisloSecondPartPdf(priznanie.rodneCisloManzelaManzelky),
      '6_PocetSpol': formatIntegerPdf(priznanie.pocetSpoluvlastnikov),
      '6_chbDohodaSpolAno': priznanie.spoluvlastnikUrcenyDohodou === true,
      '6_chbDohodaSpolNie': priznanie.spoluvlastnikUrcenyDohodou === false,
      '6_CisloBytu': priznanie.byt?.cisloBytu,
      '6_PopisBytu': priznanie.byt?.popisBytu,
      '6_DatumVzniku': formatDatePdf(priznanie.byt?.datumVznikuDanovejPovinnosti),
      '6_DatumZaniku': formatDatePdf(priznanie.byt?.datumZanikuDanovejPovinnosti),
      '6_ZDBytu': formatIntegerPdf(priznanie.byt?.zakladDane),
      '6_Vymera': formatIntegerPdf(priznanie.byt?.vymeraPodlahovejPlochyNaIneUcely),
      '6_Poznamka': priznanie.poznamka,
      ...mergeObjects(nebytovePriestoryObjects),
    }
  })
}

import { formatDatePdf } from '../shared/dates'
import { oddiel3JedenUcelShared } from '../shared/oddiel3JedenUcelShared'
import { TaxFormData } from '../../types'
import {
  formatIntegerPdf,
  formatRodneCisloFirstPartPdf,
  formatRodneCisloSecondPartPdf,
  generateCopies,
} from './functions'
import { udajeODanovnikovi } from './udajeODanovnikovi'

export const oddiel3JedenUcel = (data: TaxFormData) => {
  const udaje = udajeODanovnikovi(data)
  const mapping = oddiel3JedenUcelShared(data)

  return generateCopies(mapping, (priznanie) => ({
    '4_Ico': udaje.Ico,
    '4_RodneCislo1': udaje.RodneCislo1,
    '4_RodneCislo2': udaje.RodneCislo2,
    '4_Obec': priznanie.obec,
    '4_Ulica': priznanie.ulicaACisloDomu,
    '4_CisloSupisne': formatIntegerPdf(priznanie.supisneCislo),
    '4_NazovUzemia': priznanie.katastralneUzemie,
    '4_CisloParcely': priznanie.cisloParcely,
    '4_chbVlastnik': priznanie.isVlastnik,
    '4_chbSpravca': priznanie.isSpravca,
    '4_chbNajomca': priznanie.isNajomca,
    '4_chbUzivatel': priznanie.isUzivatel,
    '4_chbSpolPodiel': priznanie.isPodieloveSpoluvlastnictvo,
    '4_chbSpolBezpodiel': priznanie.isBezpodieloveSpoluvlastnictvo,
    '4_RodneCislo3': formatRodneCisloFirstPartPdf(priznanie.rodneCisloManzelaManzelky),
    '4_RodneCislo4': formatRodneCisloSecondPartPdf(priznanie.rodneCisloManzelaManzelky),
    '4_PocetSpol': formatIntegerPdf(priznanie.pocetSpoluvlastnikov),
    '4_chbDohodaSpolAno': priznanie.spoluvlastnikUrcenyDohodou === true,
    '4_chbDohodaSpolNie': priznanie.spoluvlastnikUrcenyDohodou === false,
    '4_DatumVzniku': formatDatePdf(priznanie.datumVznikuDanovejPovinnosti),
    '4_DatumZaniku': formatDatePdf(priznanie.datumZanikuDanovejPovinnosti),
    '4_chbPredmetDane1': priznanie.predmetDane === 'a',
    '4_chbPredmetDane2': priznanie.predmetDane === 'b',
    '4_chbPredmetDane3': priznanie.predmetDane === 'c',
    '4_chbPredmetDane4': priznanie.predmetDane === 'd',
    '4_chbPredmetDane5': priznanie.predmetDane === 'e',
    '4_chbPredmetDane6': priznanie.predmetDane === 'f',
    '4_chbPredmetDane7': priznanie.predmetDane === 'g',
    '4_chbPredmetDane8': priznanie.predmetDane === 'h',
    '4_chbPredmetDane9': priznanie.predmetDane === 'i',
    '4_ZakladDane': formatIntegerPdf(priznanie.zakladDane),
    '4_PocetPodlazi': formatIntegerPdf(
      priznanie.pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia,
    ),
    '4_CelkovaVymera': formatIntegerPdf(
      priznanie.celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby,
    ),
    '4_VymeraPloch': formatIntegerPdf(
      priznanie.vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb,
    ),
    '4_Poznamka': priznanie.poznamka,
  }))
}

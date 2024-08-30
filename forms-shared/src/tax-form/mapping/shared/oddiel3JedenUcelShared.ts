import { DanZoStaviebJedenUcelPriznania, TaxFormData } from '../../types'
import { parseDateFieldDate } from './functions'
import { oddielBaseShared } from './oddielBaseShared'
import { calculateFormCalculatorFormula } from '../../calculators'
import { safeArray, safeBoolean, safeNumber, safeString } from '../../../form-utils/safeData'

const mapPriznanie = (data: TaxFormData, priznanie: DanZoStaviebJedenUcelPriznania) => {
  const pouzitKalkulacku =
    safeBoolean(data.danZoStaviebJedenUcel?.kalkulackaWrapper?.pouzitKalkulacku) === true
  const zakladDane = pouzitKalkulacku
    ? calculateFormCalculatorFormula(
        'ceil (celkovaZastavanaPlocha * evalRatio(spoluvlastnickyPodiel))',
        priznanie,
      )
    : safeNumber(priznanie?.zakladDane)

  const cisloListuVlastnictva = safeString(priznanie.cisloListuVlastnictva)
  const poznamka = [
    safeString(priznanie.poznamka),
    cisloListuVlastnictva ? `Číslo LV: ${cisloListuVlastnictva}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  return {
    ...oddielBaseShared(data, priznanie),
    ulicaACisloDomu: safeString(priznanie?.riadok1?.ulicaACisloDomu),
    supisneCislo: safeNumber(priznanie?.riadok1?.supisneCislo),
    katastralneUzemie: safeString(priznanie?.riadok2?.kataster),
    cisloParcely: safeString(priznanie?.riadok2?.cisloParcely),
    datumVznikuDanovejPovinnosti: parseDateFieldDate(
      priznanie.datumy?.datumVznikuDanovejPovinnosti,
    ),
    datumZanikuDanovejPovinnosti: parseDateFieldDate(
      priznanie.datumy?.datumZanikuDanovejPovinnosti,
    ),
    predmetDane: priznanie?.predmetDane,
    zakladDane,
    pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia: safeNumber(
      priznanie?.pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia,
    ),
    celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby: safeNumber(
      priznanie?.castStavbyOslobodenaOdDaneDetaily
        ?.celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby,
    ),
    vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb: safeNumber(
      priznanie?.castStavbyOslobodenaOdDaneDetaily
        ?.vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb,
    ),
    poznamka,
  }
}

export type Oddiel3JedenUcelPriznanieShared = ReturnType<typeof mapPriznanie>

export const oddiel3JedenUcelShared = (data: TaxFormData) => {
  if (safeBoolean(data.danZoStaviebJedenUcel?.vyplnitObject?.vyplnit) !== true) {
    return [] as Oddiel3JedenUcelPriznanieShared[]
  }

  return safeArray(data.danZoStaviebJedenUcel?.priznania).map((priznanie) =>
    mapPriznanie(data, priznanie),
  )
}

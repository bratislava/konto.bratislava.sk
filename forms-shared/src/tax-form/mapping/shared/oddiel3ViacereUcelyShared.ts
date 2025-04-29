import { DanZoStaviebViacereUcelyPriznania, TaxFormData, UcelVyuzitiaStavby } from '../../types'
import { parseDateFieldDate } from './functions'
import { oddielBaseShared } from './oddielBaseShared'
import { calculateFormCalculatorFormula } from '../../../form-calculators/calculators'
import { safeArray, safeBoolean, safeNumber, safeString } from '../../../form-utils/safeData'
import {
  oddiel3ViacereUcelyCelkovaVymeraFormula,
  oddiel3ViacereUcelyZakladDaneFormula,
} from '../../formulas'

const getVymeryStaviebPodlaTypu = (
  stavba: DanZoStaviebViacereUcelyPriznania,
  pouzitKalkulacku: boolean,
) => {
  const stavbyCalculated = safeArray(stavba.nehnutelnosti?.nehnutelnosti).map((nehnutelnost) => {
    if (!pouzitKalkulacku) {
      return {
        ucelVyuzitiaStavby: safeString(nehnutelnost.ucelVyuzitiaStavby),
        vymeraPodlahovejPlochy: safeNumber(nehnutelnost.vymeraPodlahovejPlochy),
      }
    }
    return {
      ucelVyuzitiaStavby: safeString(nehnutelnost.ucelVyuzitiaStavby),
      vymeraPodlahovejPlochy:
        calculateFormCalculatorFormula(
          'roundTo(ratioNumerator(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) * evalRatio(spoluvlastnickyPodiel) / 100, 2)',
          nehnutelnost,
        ) ?? undefined,
    }
  })

  const types = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'] satisfies UcelVyuzitiaStavby[]
  const array = types.map((type) => {
    const stavbyByType = stavbyCalculated?.filter(
      (stavbaInner) => stavbaInner.ucelVyuzitiaStavby === type,
    )
    const sum = stavbyByType?.reduce((a, b) => a + (b?.vymeraPodlahovejPlochy ?? 0), 0)
    return [type, sum] as const
  })
  return Object.fromEntries(array) as Record<UcelVyuzitiaStavby, number>
}

const mapPriznanie = (data: TaxFormData, priznanie: DanZoStaviebViacereUcelyPriznania) => {
  const pouzitKalkulacku =
    safeBoolean(data.danZoStaviebViacereUcely?.kalkulackaWrapper?.pouzitKalkulacku) === true
  const zakladDane = pouzitKalkulacku
    ? calculateFormCalculatorFormula(oddiel3ViacereUcelyZakladDaneFormula, priznanie)
    : safeNumber(priznanie.nehnutelnosti?.sumar?.zakladDane)
  const celkovaVymera = pouzitKalkulacku
    ? calculateFormCalculatorFormula(oddiel3ViacereUcelyCelkovaVymeraFormula, priznanie)
    : safeNumber(priznanie.nehnutelnosti?.sumar?.vymeraPodlahovychPloch)

  const vymeryStaviebPodlaTypu = getVymeryStaviebPodlaTypu(priznanie, pouzitKalkulacku)

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
    popisStavby: safeString(priznanie?.popisStavby),
    datumVznikuDanovejPovinnosti: parseDateFieldDate(
      priznanie?.datumy?.datumVznikuDanovejPovinnosti,
    ),
    datumZanikuDanovejPovinnosti: parseDateFieldDate(
      priznanie?.datumy?.datumZanikuDanovejPovinnosti,
    ),
    zakladDane,
    celkovaVymera,
    vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb:
      safeBoolean(priznanie.castStavbyOslobodenaOdDane) === true
        ? safeNumber(priznanie?.vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb)
        : undefined,
    pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia: safeNumber(
      priznanie?.pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia,
    ),
    vymeryStaviebPodlaTypu,
    poznamka,
  }
}

export type Oddiel3ViacereUcelyPriznanieShared = ReturnType<typeof mapPriznanie>

export const oddiel3ViacereUcelyShared = (data: TaxFormData) => {
  if (safeBoolean(data.danZoStaviebViacereUcely?.vyplnitObject?.vyplnit) !== true) {
    return [] as Oddiel3ViacereUcelyPriznanieShared[]
  }

  return safeArray(data.danZoStaviebViacereUcely?.priznania).map((priznanie) =>
    mapPriznanie(data, priznanie),
  )
}

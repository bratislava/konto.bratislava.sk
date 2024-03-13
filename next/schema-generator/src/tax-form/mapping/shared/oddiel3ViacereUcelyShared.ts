/* eslint-disable @typescript-eslint/explicit-function-return-type,eslint-comments/disable-enable-pair,import/prefer-default-export */
import { DanZoStaviebViacereUcelyPriznania, TaxFormData, UcelVyuzitiaStavby } from '../../types'
import { parseDateFieldDate, safeArray, safeBoolean, safeNumber, safeString } from './functions'
import { evaluateFormula } from './kalkulacky'
import { oddielBaseShared } from './oddielBaseShared'

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
        evaluateFormula(
          // eslint-disable-next-line no-secrets/no-secrets
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
    ? evaluateFormula(
        // eslint-disable-next-line no-secrets/no-secrets
        'f(n) = evalRatio(n.podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) * evalRatio(n.spoluvlastnickyPodiel) * celkovaVymera; mapped = map(f, nehnutelnosti.nehnutelnosti); sum(a, b) = a+b; ceil fold(sum, 0, mapped)',
        priznanie,
      )
    : safeNumber(priznanie.zakladDane)
  const celkovaVymera = pouzitKalkulacku
    ? evaluateFormula(
        // eslint-disable-next-line no-secrets/no-secrets
        'f(n) = ratioNumerator(n.podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) * evalRatio(n.spoluvlastnickyPodiel) / 100; mapped = map(f, nehnutelnosti.nehnutelnosti); sum(a, b) = a+b; ceil fold(sum, 0, mapped)',
        priznanie,
      )
    : safeNumber(priznanie.celkovaVymera)

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

/* eslint-disable @typescript-eslint/explicit-function-return-type,eslint-comments/disable-enable-pair,import/prefer-default-export */
import { DanZPozemkovPriznania, TaxFormData } from '../../types'
import { parseDateFieldDate, safeArray, safeBoolean, safeNumber, safeString } from './functions'
import { evaluateFormula } from './kalkulacky'
import { oddielBaseShared } from './oddielBaseShared'

const mapPriznanie = (data: TaxFormData, priznanie: DanZPozemkovPriznania) => {
  const pozemky = safeArray(priznanie.pozemky).slice(0, 17)
  const pozemkyHodnotaUrcenaZnaleckymPosudkom = pozemky
    .map((pozemok, index) => ({
      index,
      hodnotaUrcenaZnaleckymPosudkom:
        (pozemok.druhPozemku === 'D' || pozemok.druhPozemku === 'G') &&
        safeBoolean(pozemok.hodnotaUrcenaZnaleckymPosudkom) === true,
    }))
    .filter(({ hodnotaUrcenaZnaleckymPosudkom }) => hodnotaUrcenaZnaleckymPosudkom)
  const pozemkyMapped = pozemky.map((pozemok) => {
    const pouzitKalkulacku =
      safeBoolean(data.danZPozemkov?.kalkulackaWrapper?.pouzitKalkulacku) === true
    const vymeraPozemku = pouzitKalkulacku
      ? evaluateFormula(
          // eslint-disable-next-line no-secrets/no-secrets
          'roundTo(evalRatio(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) * evalRatio(spoluvlastnickyPodiel) * celkovaVymeraPozemku, 2)',
          pozemok,
        )
      : safeNumber(pozemok?.vymeraPozemku)

    return {
      katastralneUzemie: safeString(pozemok.kataster),
      cisloParcely: safeString(pozemok.parcelneCisloSposobVyuzitiaPozemku?.cisloParcely),
      druhPozemku: safeString(pozemok.druhPozemku),
      sposobVyuzitiaPozemku: safeString(
        pozemok.parcelneCisloSposobVyuzitiaPozemku?.sposobVyuzitiaPozemku,
      ),
      datumVznikuDanovejPovinnosti: parseDateFieldDate(
        pozemok.datumy?.datumVznikuDanovejPovinnosti,
      ),
      datumZanikuDanovejPovinnosti: parseDateFieldDate(
        pozemok.datumy?.datumZanikuDanovejPovinnosti,
      ),
      vymeraPozemku,
    }
  })

  const poznamkaPozemkyLV = pozemky
    .map((pozemok, pozemokIndex) => {
      const cisloListuVlastnictva = safeString(pozemok.cisloListuVlastnictva)
      if (!cisloListuVlastnictva) {
        return null
      }
      return `č. ${pozemokIndex + 1} LV: ${cisloListuVlastnictva}`
    })
    .filter(Boolean)
    .join(' | ')

  const poznamkaPozemkyHodnotaUrcenaZnaleckymPosudkom =
    pozemkyHodnotaUrcenaZnaleckymPosudkom.length > 0
      ? `Hodnota určená znaleckým posudkom: ${pozemkyHodnotaUrcenaZnaleckymPosudkom
          .map(({ index }) => `č. ${index + 1}`)
          .join(', ')}`
      : null

  const poznamka = [
    safeString(priznanie.poznamka),
    poznamkaPozemkyLV,
    poznamkaPozemkyHodnotaUrcenaZnaleckymPosudkom,
  ]
    .filter(Boolean)
    .join('\n')

  return {
    ...oddielBaseShared(data, priznanie),
    hodnotaUrcenaZnaleckymPosudkom: pozemkyHodnotaUrcenaZnaleckymPosudkom.length > 0,
    pozemky: pozemkyMapped,
    poznamka,
  }
}

export type Oddiel2PriznanieShared = ReturnType<typeof mapPriznanie>

export const oddiel2Shared = (data: TaxFormData) => {
  if (safeBoolean(data.danZPozemkov?.vyplnitObject?.vyplnit) !== true) {
    return [] as Oddiel2PriznanieShared[]
  }

  return safeArray(data.danZPozemkov?.priznania).map((priznanie) => mapPriznanie(data, priznanie))
}

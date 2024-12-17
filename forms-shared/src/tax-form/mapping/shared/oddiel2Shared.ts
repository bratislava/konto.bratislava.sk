import { DanZPozemkovPriznania, TaxFormData } from '../../types'
import { parseDateFieldDate } from './functions'
import { oddielBaseShared } from './oddielBaseShared'
import { calculateFormCalculatorFormula } from '../../../form-calculators/calculators'
import { safeArray, safeBoolean, safeNumber, safeString } from '../../../form-utils/safeData'
import { oddiel2VymeraPozemkuFormula } from '../../formulas'

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
      ? calculateFormCalculatorFormula(oddiel2VymeraPozemkuFormula, pozemok)
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

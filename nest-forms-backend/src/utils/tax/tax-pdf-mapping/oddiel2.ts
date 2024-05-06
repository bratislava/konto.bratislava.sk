/* eslint-disable import/prefer-default-export,@typescript-eslint/explicit-function-return-type,eslint-comments/disable-enable-pair,no-secrets/no-secrets,sonarjs/cognitive-complexity */
import { parseRodneCislo } from '../shared-mapping/functions'
import { evaluateFormula } from '../shared-mapping/kalkulacky'
import { PravnyVztah, Spoluvlastnictvo, TaxFormData } from '../types'
import {
  formatDate,
  formatDecimal,
  formatInteger,
  generateCopies,
  safeArray,
  safeBoolean,
  safeNumber,
  safeString,
} from './functions'
import { udajeODanovnikovi } from './udajeODanovnikovi'

export const oddiel2 = (data: TaxFormData) => {
  if (safeBoolean(data.danZPozemkov?.vyplnitObject?.vyplnit) !== true) {
    return {}
  }

  const udaje = udajeODanovnikovi(data)

  return generateCopies(
    safeArray(data.danZPozemkov?.priznania),
    (priznanie) => {
      const rodneCisloManzelaManzelky = parseRodneCislo(
        data.bezpodieloveSpoluvlastnictvoManzelov?.rodneCislo,
      )
      const pozemky = safeArray(priznanie.pozemky).slice(0, 17)
      const pozemkyHodnotaUrcenaZnaleckymPosudkom = pozemky
        .map((pozemok, index) => ({
          index,
          hodnotaUrcenaZnaleckymPosudkom:
            (pozemok.druhPozemku === 'D' || pozemok.druhPozemku === 'G') &&
            safeBoolean(pozemok.hodnotaUrcenaZnaleckymPosudkom) === true,
        }))
        .filter(
          ({ hodnotaUrcenaZnaleckymPosudkom }) =>
            hodnotaUrcenaZnaleckymPosudkom,
        )
      const pozemkyObjects = pozemky.map((pozemok, pozemokIndex) => {
        const fixedIndex = pozemokIndex + 1
        const pouzitKalkulacku =
          safeBoolean(
            data.danZPozemkov?.kalkulackaWrapper?.pouzitKalkulacku,
          ) === true
        const vymeraPozemku = formatDecimal(
          pouzitKalkulacku
            ? evaluateFormula(
                'roundTo(evalRatio(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) * evalRatio(spoluvlastnickyPodiel) * celkovaVymeraPozemku, 2)',
                pozemok,
              )
            : safeNumber(pozemok?.vymeraPozemku),
        )
        return {
          [`3_Pc${fixedIndex}`]: `${fixedIndex}.`,
          [`3_NazovKat${fixedIndex}`]: safeString(pozemok.kataster),
          [`3_CisloParcely${fixedIndex}`]: safeString(
            pozemok.parcelneCisloSposobVyuzitiaPozemku?.cisloParcely,
          ),
          [`3_DruhPozemku${fixedIndex}`]: safeString(pozemok.druhPozemku),
          [`3_VyuzitiePozemku${fixedIndex}`]: safeString(
            pozemok.parcelneCisloSposobVyuzitiaPozemku?.sposobVyuzitiaPozemku,
          ),
          [`3_DatumVzniku${fixedIndex}`]: formatDate(
            pozemok.datumy?.datumVznikuDanovejPovinnosti,
          ),
          [`3_VymeraPozemku${fixedIndex}`]: vymeraPozemku,
          [`3_DatumZaniku${fixedIndex}`]: formatDate(
            pozemok.datumy?.datumZanikuDanovejPovinnosti,
          ),
        }
      })
      // eslint-disable-next-line unicorn/no-array-reduce
      const pozemkyObjectsMerged = pozemkyObjects.reduce(
        (a, b) => ({ ...a, ...b }),
        {},
      )

      const poznamkaPozemkyLV = pozemky
        .map((pozemok, pozemokIndex) => {
          const cisloListuVlastnictva = safeString(
            pozemok.cisloListuVlastnictva,
          )
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
        '3_Ico': udaje.Ico,
        '3_RodneCislo1': udaje.RodneCislo1,
        '3_RodneCislo2': udaje.RodneCislo2,
        '3_Obec': 'Bratislava',
        '3_chbHodnotaAno': pozemkyHodnotaUrcenaZnaleckymPosudkom.length > 0,
        '3_chbHodnotaNie': pozemkyHodnotaUrcenaZnaleckymPosudkom.length === 0,
        '3_chbVlastnik': priznanie.pravnyVztah === PravnyVztah.Vlastnik,
        '3_chbSpravca': priznanie.pravnyVztah === PravnyVztah.Spravca,
        '3_chbNajomca': priznanie.pravnyVztah === PravnyVztah.Najomca,
        '3_chbUzivatel': priznanie.pravnyVztah === PravnyVztah.Uzivatel,
        '3_chbSpolPodiel':
          priznanie.spoluvlastnictvo === Spoluvlastnictvo.Podielove,
        '3_chbSpolBezpodiel':
          priznanie.spoluvlastnictvo === Spoluvlastnictvo.Bezpodielove,
        '3_RodneCislo1Man':
          priznanie.spoluvlastnictvo === Spoluvlastnictvo.Bezpodielove &&
          rodneCisloManzelaManzelky?.isValid
            ? rodneCisloManzelaManzelky.firstPart
            : undefined,
        '3_RodneCislo2Man':
          priznanie.spoluvlastnictvo === Spoluvlastnictvo.Bezpodielove &&
          rodneCisloManzelaManzelky?.isValid
            ? rodneCisloManzelaManzelky.secondPart
            : undefined,
        '3_PocetSpol':
          priznanie.spoluvlastnictvo === Spoluvlastnictvo.Podielove
            ? formatInteger(safeNumber(priznanie.pocetSpoluvlastnikov))
            : undefined,
        '3_chbDohodaSpolAno':
          priznanie.spoluvlastnictvo === Spoluvlastnictvo.Podielove &&
          safeBoolean(priznanie.naZakladeDohody) === true,
        '3_chbDohodaSpolNie':
          priznanie.spoluvlastnictvo === Spoluvlastnictvo.Podielove &&
          safeBoolean(priznanie.naZakladeDohody) === false,
        '3_Poznamka': poznamka,
        ...pozemkyObjectsMerged,
      }
    },
  )
}

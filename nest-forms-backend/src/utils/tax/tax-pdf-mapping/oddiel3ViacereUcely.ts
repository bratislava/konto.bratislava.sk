/* eslint-disable import/prefer-default-export,@typescript-eslint/explicit-function-return-type,eslint-comments/disable-enable-pair,no-secrets/no-secrets,sonarjs/cognitive-complexity */
import { parseRodneCislo } from '../shared-mapping/functions'
import { evaluateFormula } from '../shared-mapping/kalkulacky'
import {
  DanZoStaviebViacereUcelyPriznania,
  PravnyVztah,
  Spoluvlastnictvo,
  TaxFormData,
} from '../types'
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

function splitNumber(inputNumber: number) {
  const formattedDecimal = formatDecimal(inputNumber, true)
  if (formattedDecimal == null) {
    return { integerPart: undefined, decimalPart: undefined }
  }

  const [integerPart, decimalPart] = formattedDecimal.split(',')

  return {
    integerPart,
    decimalPart,
  }
}

const combineStavby = (
  stavba: DanZoStaviebViacereUcelyPriznania,
  pouzitKalkulacku: boolean,
) => {
  const stavbyMapped = safeArray(stavba.nehnutelnosti?.nehnutelnosti).map(
    (nehnutelnost) => {
      if (!pouzitKalkulacku) {
        return {
          ucelVyuzitiaStavby: safeString(nehnutelnost.ucelVyuzitiaStavby),
          vymeraPodlahovejPlochy: safeNumber(
            nehnutelnost.vymeraPodlahovejPlochy,
          ),
        }
      }
      return {
        ucelVyuzitiaStavby: safeString(nehnutelnost.ucelVyuzitiaStavby),
        vymeraPodlahovejPlochy:
          evaluateFormula(
            'roundTo(ratioNumerator(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) * evalRatio(spoluvlastnickyPodiel) / 100, 2)',
            nehnutelnost,
          ) ?? undefined,
      }
    },
  )

  const types = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'] as const
  return (
    types
      .map((type) => {
        const filtered = stavbyMapped?.filter(
          (stavbaInner) => stavbaInner.ucelVyuzitiaStavby === type,
        )
        const sum = filtered?.reduce(
          (a, b) => a + (b?.vymeraPodlahovejPlochy ?? 0),
          0,
        )
        return [type, sum] as const
      })
      .filter(([, sum]) => sum > 0)
      .map(([type, sum]) => {
        const { integerPart, decimalPart } = splitNumber(sum)
        const typeIndex = types.indexOf(type) + 1
        return {
          [`5_VymeraPloch${typeIndex}`]: integerPart,
          [`5_VymeraPlochK${typeIndex}`]: decimalPart,
        }
      })
      // eslint-disable-next-line unicorn/no-array-reduce
      .reduce((a, b) => ({ ...a, ...b }), {})
  )
}

export const oddiel3ViacereUcely = (data: TaxFormData) => {
  if (
    safeBoolean(data.danZoStaviebViacereUcely?.vyplnitObject?.vyplnit) !== true
  ) {
    return {}
  }

  const udaje = udajeODanovnikovi(data)

  return generateCopies(
    safeArray(data.danZoStaviebViacereUcely?.priznania),
    (priznanie) => {
      const rodneCisloManzelaManzelky = parseRodneCislo(
        data.bezpodieloveSpoluvlastnictvoManzelov?.rodneCislo,
      )
      const pouzitKalkulacku =
        safeBoolean(
          data.danZoStaviebViacereUcely?.kalkulackaWrapper?.pouzitKalkulacku,
        ) === true
      const zakladDane = formatInteger(
        pouzitKalkulacku
          ? evaluateFormula(
              'f(n) = evalRatio(n.podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) * evalRatio(n.spoluvlastnickyPodiel) * celkovaVymera; mapped = map(f, nehnutelnosti.nehnutelnosti); sum(a, b) = a+b; ceil fold(sum, 0, mapped)',
              priznanie,
            )
          : safeNumber(priznanie.zakladDane),
      )
      const celkovaVymera = formatInteger(
        pouzitKalkulacku
          ? evaluateFormula(
              'f(n) = ratioNumerator(n.podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) * evalRatio(n.spoluvlastnickyPodiel) / 100; mapped = map(f, nehnutelnosti.nehnutelnosti); sum(a, b) = a+b; ceil fold(sum, 0, mapped)',
              priznanie,
            )
          : safeNumber(priznanie.celkovaVymera),
      )
      const stavbyVymery = combineStavby(priznanie, pouzitKalkulacku)

      const cisloListuVlastnictva = safeString(priznanie.cisloListuVlastnictva)
      const poznamka = [
        safeString(priznanie.poznamka),
        cisloListuVlastnictva ? `Číslo LV: ${cisloListuVlastnictva}` : null,
      ]
        .filter(Boolean)
        .join('\n')

      return {
        '5_Ico': udaje.Ico,
        '5_RodneCislo1': udaje.RodneCislo1,
        '5_RodneCislo2': udaje.RodneCislo2,
        '5_Obec': 'Bratislava',
        '5_Ulica': safeString(priznanie?.riadok1?.ulicaACisloDomu),
        // TODO Temporary supisneCislo fix
        '5_CisloSupisne':
          safeString(priznanie?.riadok1?.supisneCislo) ??
          formatInteger(safeNumber(priznanie?.riadok1?.supisneCislo)),
        '5_NazovUzemia': safeString(priznanie?.riadok2?.kataster),
        '5_CisloParcely': safeString(priznanie?.riadok2?.cisloParcely),
        '5_chbVlastnik': priznanie?.pravnyVztah === PravnyVztah.Vlastnik,
        '5_chbSpravca': priznanie?.pravnyVztah === PravnyVztah.Spravca,
        '5_chbNajomca': priznanie?.pravnyVztah === PravnyVztah.Najomca,
        '5_chbUzivatel': priznanie?.pravnyVztah === PravnyVztah.Uzivatel,
        '5_chbSpolPodiel':
          priznanie?.spoluvlastnictvo === Spoluvlastnictvo.Podielove,
        '5_chbSpolBezpodiel':
          priznanie?.spoluvlastnictvo === Spoluvlastnictvo.Bezpodielove,
        '5_RodneCislo3':
          priznanie.spoluvlastnictvo === Spoluvlastnictvo.Bezpodielove &&
          rodneCisloManzelaManzelky?.isValid
            ? rodneCisloManzelaManzelky.firstPart
            : undefined,
        '5_RodneCislo4':
          priznanie.spoluvlastnictvo === Spoluvlastnictvo.Bezpodielove &&
          rodneCisloManzelaManzelky?.isValid
            ? rodneCisloManzelaManzelky.secondPart
            : undefined,
        '5_PocetSpol':
          priznanie?.spoluvlastnictvo === Spoluvlastnictvo.Podielove
            ? formatInteger(safeNumber(priznanie?.pocetSpoluvlastnikov))
            : undefined,
        '5_chbDohodaSpolAno':
          priznanie.spoluvlastnictvo === Spoluvlastnictvo.Podielove &&
          safeBoolean(priznanie.naZakladeDohody) === true,
        '5_chbDohodaSpolNie':
          priznanie.spoluvlastnictvo === Spoluvlastnictvo.Podielove &&
          safeBoolean(priznanie.naZakladeDohody) === false,
        '5_PopisStavby': safeString(priznanie?.popisStavby),
        '5_DatumVzniku': formatDate(
          priznanie?.datumy?.datumVznikuDanovejPovinnosti,
        ),
        '5_DatumZaniku': formatDate(
          priznanie?.datumy?.datumZanikuDanovejPovinnosti,
        ),
        '5_ZakladDane': zakladDane,
        '5_CelkovaVymera': celkovaVymera,
        '5_VymeraOslobodena':
          safeBoolean(priznanie.castStavbyOslobodenaOdDane) === true
            ? formatInteger(
                safeNumber(
                  priznanie?.vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb,
                ),
              )
            : undefined,
        '5_PocetPodlazi': formatInteger(
          safeNumber(
            priznanie?.pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia,
          ),
        ),
        '5_Poznamka': poznamka,
        ...stavbyVymery,
      }
    },
  )
}

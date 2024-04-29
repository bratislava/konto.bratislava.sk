/* eslint-disable import/prefer-default-export,@typescript-eslint/explicit-function-return-type,eslint-comments/disable-enable-pair,no-secrets/no-secrets,sonarjs/cognitive-complexity */
import { parseRodneCislo } from '../shared-mapping/functions'
import { evaluateFormula } from '../shared-mapping/kalkulacky'
import { PravnyVztah, Spoluvlastnictvo, TaxFormData } from '../types'
import {
  formatDate,
  formatInteger,
  generateCopies,
  safeArray,
  safeBoolean,
  safeNumber,
  safeString,
} from './functions'
import { udajeODanovnikovi } from './udajeODanovnikovi'

const zakladDaneFormula = `denominator = ratioDenominator(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu);
                      highestPowerOf10 = pow(10, floor(log10 denominator));
                      isSpecialCase = denominator >= 1000 and denominator % highestPowerOf10 == 0;
                      ceil ((isSpecialCase ? celkovaVymeraSpecialCase : ratioNumerator(podielPriestoruNaSpolocnychCastiachAZariadeniachDomu) / 100) * evalRatio(spoluvlastnickyPodiel))`

// Both fields have broken names in the original PDF, so we need to fix them.
const getCisloPriestoruFieldName = (index: number) =>
  index <= 2 ? `6_Cislo Priest${index}` : `6_CisloPriest${index}`

const getUcelVyuzitiaFieldName = (index: number) =>
  index >= 4 ? `6_UcelVVyuzitia${index}` : `6_UcelVyuzitia${index}`

export const oddiel4 = (data: TaxFormData) => {
  if (
    safeBoolean(data.danZBytovANebytovychPriestorov?.vyplnitObject?.vyplnit) !==
    true
  ) {
    return {}
  }

  const udaje = udajeODanovnikovi(data)

  const pouzitKalkulacku =
    safeBoolean(
      data.danZBytovANebytovychPriestorov?.kalkulackaWrapper?.pouzitKalkulacku,
    ) === true

  return generateCopies(
    safeArray(data.danZBytovANebytovychPriestorov?.priznania),
    (priznanie) => {
      const rodneCisloManzelaManzelky = parseRodneCislo(
        data.bezpodieloveSpoluvlastnictvoManzelov?.rodneCislo,
      )
      const zakladDane = formatInteger(
        pouzitKalkulacku
          ? evaluateFormula(zakladDaneFormula, priznanie?.priznanieZaByt ?? {})
          : safeNumber(priznanie?.priznanieZaByt?.vymeraPodlahovejPlochyBytu),
      )

      const priznanieZaBytFields =
        safeBoolean(priznanie?.priznanieZaByt?.priznanieZaByt) === true
          ? {
              '6_CisloBytu': safeString(priznanie?.priznanieZaByt?.cisloBytu),
              '6_PopisBytu': safeString(priznanie?.priznanieZaByt?.popisBytu),
              '6_DatumVzniku': formatDate(
                priznanie?.priznanieZaByt?.datumy?.datumVznikuDanovejPovinnosti,
              ),
              '6_DatumZaniku': formatDate(
                priznanie?.priznanieZaByt?.datumy?.datumZanikuDanovejPovinnosti,
              ),
              '6_ZDBytu': zakladDane,
              '6_Vymera': formatInteger(
                safeNumber(
                  priznanie.priznanieZaByt?.vymeraPodlahovejPlochyNaIneUcely,
                ),
              ),
            }
          : {}

      const nebytovePriestory =
        safeBoolean(
          priznanie?.priznanieZaNebytovyPriestor?.priznanieZaNebytovyPriestor,
        ) === true
          ? safeArray(
              priznanie.priznanieZaNebytovyPriestor?.nebytovePriestory,
            ).slice(0, 15)
          : []

      const nebytovePriestoryObjects = nebytovePriestory.map(
        (nebytovyPriestor, nebytovyPriestorIndex) => {
          const fixedIndex = nebytovyPriestorIndex + 1
          const vymeraPozemku = formatInteger(
            pouzitKalkulacku
              ? evaluateFormula(zakladDaneFormula, nebytovyPriestor)
              : safeNumber(
                  nebytovyPriestor?.vymeraPodlahovychPlochNebytovehoPriestoruVBytovomDome,
                ),
          )

          return {
            [`6_Pc${fixedIndex}`]: `${fixedIndex}.`,
            [getCisloPriestoruFieldName(fixedIndex)]: safeString(
              nebytovyPriestor?.riadok?.cisloNebytovehoPriestoruVBytovomDome,
            ),
            [getUcelVyuzitiaFieldName(fixedIndex)]: safeString(
              nebytovyPriestor?.riadok
                ?.ucelVyuzitiaNebytovehoPriestoruVBytovomDome,
            ),
            [`6_DatumVzniku${fixedIndex}`]: formatDate(
              nebytovyPriestor?.datumy?.datumVznikuDanovejPovinnosti,
            ),
            [`6_VymeraPozemku${fixedIndex}`]: vymeraPozemku,
            [`6_DatumZaniku${fixedIndex}`]: formatDate(
              nebytovyPriestor?.datumy?.datumZanikuDanovejPovinnosti,
            ),
          }
        },
      )
      // eslint-disable-next-line unicorn/no-array-reduce
      const mergedNebytovePriestoryObjects = nebytovePriestoryObjects.reduce(
        (a, b) => ({ ...a, ...b }),
        {},
      )

      const cisloListuVlastnictva = safeString(priznanie.cisloListuVlastnictva)
      const poznamka = [
        safeString(priznanie.poznamka),
        cisloListuVlastnictva ? `Číslo LV: ${cisloListuVlastnictva}` : null,
      ]
        .filter(Boolean)
        .join('\n')

      return {
        '6_Ico': udaje.Ico,
        '6_RodneCislo1': udaje.RodneCislo1,
        '6_RodneCislo2': udaje.RodneCislo2,
        '6_Obec': 'Bratislava',
        '6_Ulica': safeString(priznanie.riadok1?.ulicaACisloDomu),
        // TODO Temporary supisneCislo fix
        '6_CisloSupisne':
          safeString(priznanie?.riadok1?.supisneCislo) ??
          formatInteger(safeNumber(priznanie?.riadok1?.supisneCislo)),
        '6_NazovUzemia': safeString(priznanie.riadok2?.kataster),
        '6_CisloParcely': safeString(priznanie.riadok2?.cisloParcely),
        '6_chbVlastnik': priznanie.pravnyVztah === PravnyVztah.Vlastnik,
        '6_chbSpravca': priznanie.pravnyVztah === PravnyVztah.Spravca,
        '6_chbSpolPodiel':
          priznanie.spoluvlastnictvo === Spoluvlastnictvo.Podielove,
        '6_chbSpolBezpodiel':
          priznanie.spoluvlastnictvo === Spoluvlastnictvo.Bezpodielove,
        '6_RodneCislo3':
          priznanie.spoluvlastnictvo === Spoluvlastnictvo.Bezpodielove &&
          rodneCisloManzelaManzelky?.isValid
            ? rodneCisloManzelaManzelky.firstPart
            : undefined,
        '6_RodneCislo4':
          priznanie.spoluvlastnictvo === Spoluvlastnictvo.Bezpodielove &&
          rodneCisloManzelaManzelky?.isValid
            ? rodneCisloManzelaManzelky.secondPart
            : undefined,
        '6_PocetSpol':
          priznanie.spoluvlastnictvo === Spoluvlastnictvo.Podielove
            ? formatInteger(safeNumber(priznanie.pocetSpoluvlastnikov))
            : undefined,
        '6_chbDohodaSpolAno':
          priznanie.spoluvlastnictvo === Spoluvlastnictvo.Podielove &&
          safeBoolean(priznanie.naZakladeDohody) === true,
        '6_chbDohodaSpolNie':
          priznanie.spoluvlastnictvo === Spoluvlastnictvo.Podielove &&
          safeBoolean(priznanie.naZakladeDohody) === false,
        '6_Poznamka': poznamka,
        ...priznanieZaBytFields,
        ...mergedNebytovePriestoryObjects,
      }
    },
  )
}

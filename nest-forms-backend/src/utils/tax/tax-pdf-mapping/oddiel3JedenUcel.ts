/* eslint-disable import/prefer-default-export,@typescript-eslint/explicit-function-return-type,eslint-comments/disable-enable-pair */
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

// eslint-disable-next-line sonarjs/cognitive-complexity
export const oddiel3JedenUcel = (data: TaxFormData) => {
  if (
    safeBoolean(data.danZoStaviebJedenUcel?.vyplnitObject?.vyplnit) !== true
  ) {
    return {}
  }

  const udaje = udajeODanovnikovi(data)

  return generateCopies(
    safeArray(data.danZoStaviebJedenUcel?.priznania),
    (priznanie) => {
      const rodneCisloManzelaManzelky = parseRodneCislo(
        data.bezpodieloveSpoluvlastnictvoManzelov?.rodneCislo,
      )
      const pouzitKalkulacku =
        safeBoolean(
          data.danZoStaviebJedenUcel?.kalkulackaWrapper?.pouzitKalkulacku,
        ) === true
      const zakladDane = formatInteger(
        pouzitKalkulacku
          ? evaluateFormula(
              'ceil (celkovaZastavanaPlocha * evalRatio(spoluvlastnickyPodiel))',
              priznanie,
            )
          : safeNumber(priznanie?.zakladDane),
      )

      const cisloListuVlastnictva = safeString(priznanie.cisloListuVlastnictva)
      const poznamka = [
        safeString(priznanie.poznamka),
        cisloListuVlastnictva ? `Číslo LV: ${cisloListuVlastnictva}` : null,
      ]
        .filter(Boolean)
        .join('\n')

      return {
        '4_Ico': udaje.Ico,
        '4_RodneCislo1': udaje.RodneCislo1,
        '4_RodneCislo2': udaje.RodneCislo2,
        '4_Obec': 'Bratislava',
        '4_Ulica': safeString(priznanie?.riadok1?.ulicaACisloDomu),
        // TODO Temporary supisneCislo fix
        '4_CisloSupisne':
          safeString(priznanie?.riadok1?.supisneCislo) ??
          formatInteger(safeNumber(priznanie?.riadok1?.supisneCislo)),
        '4_NazovUzemia': safeString(priznanie?.riadok2?.kataster),
        '4_CisloParcely': safeString(priznanie?.riadok2?.cisloParcely),
        '4_chbVlastnik': priznanie?.pravnyVztah === PravnyVztah.Vlastnik,
        '4_chbSpravca': priznanie?.pravnyVztah === PravnyVztah.Spravca,
        '4_chbNajomca': priznanie?.pravnyVztah === PravnyVztah.Najomca,
        '4_chbUzivatel': priznanie?.pravnyVztah === PravnyVztah.Uzivatel,
        '4_chbSpolPodiel':
          priznanie?.spoluvlastnictvo === Spoluvlastnictvo.Podielove,
        '4_chbSpolBezpodiel':
          priznanie?.spoluvlastnictvo === Spoluvlastnictvo.Bezpodielove,
        '4_RodneCislo3':
          priznanie.spoluvlastnictvo === Spoluvlastnictvo.Bezpodielove &&
          rodneCisloManzelaManzelky?.isValid
            ? rodneCisloManzelaManzelky.firstPart
            : undefined,
        '4_RodneCislo4':
          priznanie.spoluvlastnictvo === Spoluvlastnictvo.Bezpodielove &&
          rodneCisloManzelaManzelky?.isValid
            ? rodneCisloManzelaManzelky.secondPart
            : undefined,
        '4_PocetSpol':
          priznanie?.spoluvlastnictvo === Spoluvlastnictvo.Podielove
            ? formatInteger(safeNumber(priznanie?.pocetSpoluvlastnikov))
            : undefined,
        '4_chbDohodaSpolAno':
          priznanie.spoluvlastnictvo === Spoluvlastnictvo.Podielove &&
          safeBoolean(priznanie.naZakladeDohody) === true,
        '4_chbDohodaSpolNie':
          priznanie.spoluvlastnictvo === Spoluvlastnictvo.Podielove &&
          safeBoolean(priznanie.naZakladeDohody) === false,
        '4_DatumVzniku': formatDate(
          priznanie?.datumy?.datumVznikuDanovejPovinnosti,
        ),
        '4_DatumZaniku': formatDate(
          priznanie?.datumy?.datumZanikuDanovejPovinnosti,
        ),
        '4_chbPredmetDane1': priznanie?.predmetDane === 'a',
        '4_chbPredmetDane2': priznanie?.predmetDane === 'b',
        '4_chbPredmetDane3': priznanie?.predmetDane === 'c',
        '4_chbPredmetDane4': priznanie?.predmetDane === 'd',
        '4_chbPredmetDane5': priznanie?.predmetDane === 'e',
        '4_chbPredmetDane6': priznanie?.predmetDane === 'f',
        '4_chbPredmetDane7': priznanie?.predmetDane === 'g',
        '4_chbPredmetDane8': priznanie?.predmetDane === 'h',
        '4_chbPredmetDane9': priznanie?.predmetDane === 'i',
        '4_ZakladDane': zakladDane,
        '4_PocetPodlazi': formatInteger(
          safeNumber(
            priznanie?.pocetNadzemnychAPodzemnychPodlaziStavbyOkremPrvehoNadzemnehoPodlazia,
          ),
        ),
        '4_CelkovaVymera': formatInteger(
          safeNumber(
            priznanie?.castStavbyOslobodenaOdDaneDetaily
              ?.celkovaVymeraPodlahovychPlochVsetkychPodlaziStavby,
          ),
        ),
        '4_VymeraPloch': formatInteger(
          safeNumber(
            priznanie?.castStavbyOslobodenaOdDaneDetaily
              ?.vymeraPodlahovychPlochCastiStavbyOslobodenejOdDaneZoStavieb,
          ),
        ),
        '4_Poznamka': poznamka,
      }
    },
  )
}

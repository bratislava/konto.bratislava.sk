/* eslint-disable import/prefer-default-export,@typescript-eslint/explicit-function-return-type,eslint-comments/disable-enable-pair */
import { parseRodneCislo } from '../shared-mapping/functions'
import { getTitleFromStatCiselnik } from '../tax-pdf-mapping-v2/statCiselnik'
import { PriznanieAko, TaxFormData } from '../types'
import { safeBoolean, safeString } from './functions'

type KeyValueArray = [string, string | undefined][]

function formatKeyValueArray(array: KeyValueArray) {
  return array
    .map(([key, value]) => [key, safeString(value)] as const)
    .filter((tuple): tuple is [string, string] => tuple[1] != null)
    .map(([key, value]) => `${key}: ${value}`)
    .join(' | ')
}

export const poznamka = (data: TaxFormData, formId?: string) => {
  const rodneCislo =
    data.udajeODanovnikovi?.priznanieAko === PriznanieAko.FyzickaOsoba
      ? parseRodneCislo(data.udajeODanovnikovi?.rodneCislo)
      : null

  const rodneCisloPoznamka =
    rodneCislo && !rodneCislo.isValid && rodneCislo?.value
      ? `Rodné číslo: ${rodneCislo.value}`
      : null

  const korespondencnaAdresa =
    safeBoolean(
      data.udajeODanovnikovi?.korespondencnaAdresa?.korespondencnaAdresaRovnaka,
      false,
    ) === false

  const korespondencnaAdresaPoznamka = korespondencnaAdresa
    ? formatKeyValueArray([
        [
          'Ulica',
          data.udajeODanovnikovi?.korespondencnaAdresa
            ?.ulicaCisloKorespondencnaAdresa?.ulica,
        ],
        [
          'Číslo',
          data.udajeODanovnikovi?.korespondencnaAdresa
            ?.ulicaCisloKorespondencnaAdresa?.cislo,
        ],
        ['Obec', data.udajeODanovnikovi?.korespondencnaAdresa?.obecPsc?.obec],
        ['PSČ', data.udajeODanovnikovi?.korespondencnaAdresa?.obecPsc?.psc],
        [
          'Štát',
          getTitleFromStatCiselnik(
            data.udajeODanovnikovi?.korespondencnaAdresa?.stat,
          ),
        ],
      ] as KeyValueArray)
    : null

  const rovnakaAdresa =
    safeBoolean(data.bezpodieloveSpoluvlastnictvoManzelov?.rovnakaAdresa) ===
    true

  const bezpodieloveSpoluvlastnictvoManzelovAdresa = [
    ['Ulica', data.bezpodieloveSpoluvlastnictvoManzelov?.ulicaCislo?.ulica],
    ['Číslo', data.bezpodieloveSpoluvlastnictvoManzelov?.ulicaCislo?.cislo],
    ['Obec', data.bezpodieloveSpoluvlastnictvoManzelov?.obecPsc?.obec],
    ['PSČ', data.bezpodieloveSpoluvlastnictvoManzelov?.obecPsc?.psc],
    [
      'Štát',
      getTitleFromStatCiselnik(data.bezpodieloveSpoluvlastnictvoManzelov?.stat),
    ],
  ] as KeyValueArray

  const bezpodieloveSpoluvlastnictvoManzelovPoznamka = formatKeyValueArray([
    ['Rodné číslo', data.bezpodieloveSpoluvlastnictvoManzelov?.rodneCislo],
    ['Titul', data.bezpodieloveSpoluvlastnictvoManzelov?.menoTitul?.titul],
    ['Meno', data.bezpodieloveSpoluvlastnictvoManzelov?.menoTitul?.meno],
    ['Priezvisko', data.bezpodieloveSpoluvlastnictvoManzelov?.priezvisko],
    ...(rovnakaAdresa
      ? [['Má trvalé bydlisko na rovnakej adrese ako žiadateľ?', 'Áno']]
      : bezpodieloveSpoluvlastnictvoManzelovAdresa),
    ['E-mail', data.bezpodieloveSpoluvlastnictvoManzelov?.email],
    ['Telefón', data.bezpodieloveSpoluvlastnictvoManzelov?.telefon],
  ] as KeyValueArray)

  const generated = `Tento dokument bol vygenerovaný pomocou Bratislavského konta.${
    formId ? `\nID formulára: ${formId}` : ''
  }`

  const poznamkaString = [
    rodneCisloPoznamka,
    korespondencnaAdresaPoznamka
      ? `Korespondenčná adresa:\n${korespondencnaAdresaPoznamka}`
      : null,
    bezpodieloveSpoluvlastnictvoManzelovPoznamka
      ? `Údaje o manželovi/manželke:\n${bezpodieloveSpoluvlastnictvoManzelovPoznamka}`
      : null,
    generated,
  ]
    .filter(Boolean)
    .join('\n\n')

  return {
    '2_Poznamka': poznamkaString,
  }
}

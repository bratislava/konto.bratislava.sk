import { getTitleFromStatCiselnik } from '../pdf/statCiselnik'
import { TaxFormData } from '../../types'
import { formatDatePdf } from './dates'
import { oddiel2Shared } from './oddiel2Shared'
import { oddiel3JedenUcelShared } from './oddiel3JedenUcelShared'
import { oddiel3ViacereUcelyShared } from './oddiel3ViacereUcelyShared'
import { oddiel4Shared } from './oddiel4Shared'
import { udajeODanovnikoviShared } from './udajeODanovnikoviShared'
import { safeBoolean, safeString } from '../../../form-utils/safeData'

type KeyValueArray = [string, string | undefined][]

const formatKeyValueArray = (array: KeyValueArray) =>
  array
    .map(([key, value]) => [key, safeString(value)] as const)
    .filter((tuple): tuple is [string, string] => tuple[1] != null)
    .map(([key, value]) => `${key}: ${value}`)
    .join(' | ')

const bezpodieloveSpoluvlastnictvoManzelovPoznamka = (data: TaxFormData) => {
  const anyIsBezpodieloveSpoluvlastnictvo = [
    ...oddiel2Shared(data),
    ...oddiel3JedenUcelShared(data),
    ...oddiel3ViacereUcelyShared(data),
    ...oddiel4Shared(data),
  ].some((priznanie) => priznanie.isBezpodieloveSpoluvlastnictvo)

  if (!anyIsBezpodieloveSpoluvlastnictvo) {
    return null
  }

  const rovnakaAdresa =
    safeBoolean(data.bezpodieloveSpoluvlastnictvoManzelov?.rovnakaAdresa) === true

  const bezpodieloveSpoluvlastnictvoManzelovAdresa = [
    [
      'Ulica',
      data.bezpodieloveSpoluvlastnictvoManzelov?.ulicaCisloBezpodieloveSpoluvlastnictvoManzelov
        ?.ulica,
    ],
    [
      'Číslo',
      data.bezpodieloveSpoluvlastnictvoManzelov?.ulicaCisloBezpodieloveSpoluvlastnictvoManzelov
        ?.cislo,
    ],
    ['Obec', data.bezpodieloveSpoluvlastnictvoManzelov?.obecPsc?.obec],
    ['PSČ', data.bezpodieloveSpoluvlastnictvoManzelov?.obecPsc?.psc],
    ['Štát', getTitleFromStatCiselnik(data.bezpodieloveSpoluvlastnictvoManzelov?.stat)],
  ] as KeyValueArray

  const formatted = formatKeyValueArray([
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

  if (formatted.length === 0) {
    return null
  }

  return `Údaje o manželovi/manželke:\n${formatted}`
}

const rodneCisloDatumNarodeniaPoznamka = (data: TaxFormData) => {
  const { rodneCislo, datumNarodenia } = udajeODanovnikoviShared(data)

  if (rodneCislo?.isValid) {
    return null
  }

  if (datumNarodenia != null) {
    return `Dátum narodenia: ${formatDatePdf(datumNarodenia)}`
  }

  if (rodneCislo?.value != null) {
    return `Rodné číslo: ${rodneCislo.value}`
  }

  return null
}

const korespondencnaAdresaPoznamka = (data: TaxFormData) => {
  const korespondencnaAdresaRozdielna =
    safeBoolean(
      data.udajeODanovnikovi?.korespondencnaAdresa?.korespondencnaAdresaRovnaka,
      false,
    ) === false

  if (!korespondencnaAdresaRozdielna) {
    return null
  }

  const formatted = formatKeyValueArray([
    ['Ulica', data.udajeODanovnikovi?.korespondencnaAdresa?.ulicaCisloKorespondencnaAdresa?.ulica],
    ['Číslo', data.udajeODanovnikovi?.korespondencnaAdresa?.ulicaCisloKorespondencnaAdresa?.cislo],
    ['Obec', data.udajeODanovnikovi?.korespondencnaAdresa?.obecPsc?.obec],
    ['PSČ', data.udajeODanovnikovi?.korespondencnaAdresa?.obecPsc?.psc],
    ['Štát', getTitleFromStatCiselnik(data.udajeODanovnikovi?.korespondencnaAdresa?.stat)],
  ] as KeyValueArray)

  return `Korespondenčná adresa:\n${formatted}`
}

export const poznamkaShared = (data: TaxFormData, formId?: string) => {
  const generated = [
    `Tento dokument bol vygenerovaný pomocou Bratislavského konta.`,
    formId ? `ID formulára: ${formId}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const poznamkaString = [
    rodneCisloDatumNarodeniaPoznamka(data),
    korespondencnaAdresaPoznamka(data),
    bezpodieloveSpoluvlastnictvoManzelovPoznamka(data),
    generated,
  ]
    .filter(Boolean)
    .join('\n\n')

  return { poznamka: poznamkaString }
}

import {
  Ciselnik,
  CiselnikType,
  esbsBratislavaMestskaCastCiselnik,
  esbsKatastralneUzemiaCiselnik,
  esbsNationalityCiselnik,
  esbsPravnyVztahCiselnik,
  esbsSpoluvlastnictvoCiselnik,
  esbsTitulPredMenomCiselnik,
  esbsTitulZaMenomCiselnik,
} from '../shared/esbsCiselniky'
import { formatIntegerXml } from './functions'
import { parseUlicaACisloDomu } from './shared'

type RecordWithKeysFromCiselnik<T extends Ciselnik[]> = {
  [P in T[number]['Code']]?: boolean
}

export function getCiselnikEntryByCondition<T extends CiselnikType>(
  ciselnik: T | Readonly<T>,
  record: RecordWithKeysFromCiselnik<T>,
) {
  const firstTruthyKey = (Object.keys(record) as Array<keyof typeof record>).find(
    (key) => record[key],
  )
  if (!firstTruthyKey) {
    return null
  }
  return ciselnik.find((entry) => entry.Code === firstTruthyKey)
}

export function getCiselnikEntryByCode<T extends CiselnikType>(
  ciselnik: T | Readonly<T>,
  code: string | undefined,
) {
  return ciselnik.find((entry) => entry.Code === code)
}

export const pravnyVztah = (priznanie: {
  isVlastnik?: boolean
  isSpravca?: boolean
  isNajomca?: boolean
  isUzivatel?: boolean
}) =>
  getCiselnikEntryByCondition(esbsPravnyVztahCiselnik, {
    '0': priznanie.isVlastnik,
    '1': priznanie.isSpravca,
    '2': priznanie.isNajomca,
    '3': priznanie.isUzivatel,
  })

export const spoluvlastnictvo = (priznanie: {
  isPodieloveSpoluvlastnictvo?: boolean
  isBezpodieloveSpoluvlastnictvo?: boolean
}) =>
  getCiselnikEntryByCondition(esbsSpoluvlastnictvoCiselnik, {
    '0': priznanie.isPodieloveSpoluvlastnictvo,
    '1': priznanie.isBezpodieloveSpoluvlastnictvo,
  })

export const katastralneUzemie = (katastralneUzemieString: string | undefined) => {
  if (!katastralneUzemieString) {
    return null
  }

  return esbsKatastralneUzemiaCiselnik.find(({ Name }) => Name === katastralneUzemieString)
}

const obecFromKatastralneUzemie = (katastralneUzemieString: string | undefined) => {
  if (!katastralneUzemieString) {
    return null
  }
  if (katastralneUzemieString === 'Nivy' || katastralneUzemieString === 'Trnávka') {
    return getCiselnikEntryByCode(esbsBratislavaMestskaCastCiselnik, 'SK0102529320') // Ružinov
  }
  if (katastralneUzemieString === 'Vinohrady') {
    return getCiselnikEntryByCode(esbsBratislavaMestskaCastCiselnik, 'SK0103529346') // Nové Mesto
  }

  return esbsBratislavaMestskaCastCiselnik.find(
    ({ Name }) => Name === `Bratislava - mestská časť ${katastralneUzemieString}`,
  )
}

export const adresaStavbyBytu = (priznanie: {
  ulicaACisloDomu: string | undefined
  supisneCislo: number | undefined
  katastralneUzemie: string | undefined
}) => {
  const parsed = parseUlicaACisloDomu(priznanie.ulicaACisloDomu)

  return {
    UlicaACislo: {
      /* It's a sequence and must be in this specific order. */
      Ulica: parsed?.Ulica,
      SupisneCislo: formatIntegerXml(priznanie.supisneCislo),
      OrientacneCislo: parsed?.OrientacneCislo,
    },
    Obec: obecFromKatastralneUzemie(priznanie.katastralneUzemie),
    Stat: getCiselnikEntryByCode(esbsNationalityCiselnik, '703'), // Slovenská republika
  }
}

/**
 * Removes spaces and dots and lowercases the string to try to match as many possible forms of "titul".
 */
function fixValue(value: string) {
  return value.replaceAll(/[ .]/g, '').toLocaleLowerCase('sk-SK')
}

export const tituly = (value: string | undefined) => {
  if (typeof value !== 'string') {
    return null
  }
  const predMenom = esbsTitulPredMenomCiselnik.find(
    ({ Name }) => fixValue(Name) === fixValue(value),
  )
  const zaMenom = esbsTitulZaMenomCiselnik.find(({ Name }) => fixValue(Name) === fixValue(value))

  if (predMenom || zaMenom) {
    return {
      predMenom,
      zaMenom,
    }
  }
  return {
    predMenom: {
      Name: value,
    },
  }
}

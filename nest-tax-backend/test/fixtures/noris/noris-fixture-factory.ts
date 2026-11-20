import { randomInt } from 'node:crypto'

import currency from 'currency.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { ConnectionPool } from 'mssql'

import { NorisRawRealEstateTaxDetailSchema } from '../../../src/noris/types/noris.schema'
import { addSlashToBirthNumber } from '../../../src/utils/functions/birthNumber'
import { generateBirthNumber } from '../birth-number'
import { NorisTableName, NorisTableRows } from './noris-tables'

dayjs.extend(utc)

export enum NorisTaxType {
  RealEstate = '1',
  CommunalWaste = '4',
}

/**
 * `stav_dokladu` of a tax document. Most documents are `P`, documents not yet in force are `Z` (without
 * `datum_platnosti`), `S` is cancelled.
 */
export type NorisDocumentState = 'P' | 'Z' | 'O' | 'S'

/** `forma_uhrady` of a communal waste fee, `I` is direct debit (inkaso). Real estate tax returns have none. */
export type NorisPaymentMethod = 'P' | 'Z' | 'S' | 'I' | 'H'

/** `druh_nadoby` of a container the app imports. */
export type NorisContainerType = 'N12' | 'N24' | 'K11' | 'N11'

/**
 * Container of a communal waste fee the app imports. All amounts are set explicitly, the factory does not calculate
 * the fee. In Noris the fee is `count * pickups * rate` rounded to cents.
 */
export interface NorisContainerOptions {
  type: NorisContainerType
  /** In litres */
  volume: number
  count: number
  pickups: number
  /** Rate per pickup (`sadzba_mena`) */
  rate: number
  /** `suma_uhrada_mena` */
  fee: number
  /** Container address `Street,City,ZIP` (`subjekty.nazev_subjektu`, at most 40 characters). */
  address?: string
  streetNumber?: string | null
}

export const DEFAULT_NORIS_CONTAINER: NorisContainerOptions = {
  type: 'N12',
  volume: 120,
  count: 1,
  pickups: 14,
  rate: 4.314,
  fee: 60.4,
}

export interface NorisSkippedContainerOptions {
  wasteType: 'KOD' | 'BRO'
  type: string
  volume: number
  pickups: number
}

export const NORIS_SKIPPED_CONTAINERS = {
  /** Kitchen waste */
  KOD: { wasteType: 'KOD', type: 'KO1', volume: 21, pickups: 18 },
  /** Bio waste */
  BRO: { wasteType: 'BRO', type: 'N24', volume: 240, pickups: 5 },
} as const satisfies Record<string, NorisSkippedContainerOptions>

export interface NorisPersonName {
  titul?: string | null
  meno: string
  priezvisko: string
  titulZa?: string | null
}

/** Permanent residence of the taxpayer (`dane_21_adresa_view` and `organizace`). */
export interface NorisAddress {
  street: string | null
  /** Súpisné číslo */
  buildingNumber: string | null
  /** Orientačné číslo */
  streetNumber: string | null
  zip: string | null
  city: string | null
}

export interface NorisAdministrator {
  /** Returned by `fn21_meno_osoby_org`, at most 40 characters (`subjekty.nazev_subjektu`). */
  name: string
  phone: string | null
  email: string | null
}

export interface NorisOverpaymentOptions {
  amount: number
  /**
   * Part of the amount not yet applied to any tax, shown by the saldo view as negative `zbyva_uhradit`. Defaults to
   * the whole amount, i.e. a real overpayment.
   */
  unappliedAmount?: number
  /** A refunded overpayment has its saldo `uhrazeno` at 0. */
  refunded?: boolean
  date?: Date
}

export interface NorisPaymentOptions {
  /** Saldo `uhrazeno` of the tax document. */
  paid: number
  /** Saldo `datum_posledni_platby`, `null` when the tax was paid only by applying an overpayment. */
  lastPaymentDate?: Date | null
}

interface NorisTaxOptions {
  /**
   * Stored in `rodne_cislo` as given. Noris stores birth numbers with slash and the app queries with slash,
   * a few are stored without it. Generated with slash by default.
   */
  birthNumber?: string
  /** `podnikatel` `A`, the queries return only `N` (default). */
  entrepreneur?: boolean
  year?: number
  state?: NorisDocumentState
  name?: NorisPersonName
  /** `null` creates no address. The real estate tax is then returned without address, communal waste not at all. */
  address?: NorisAddress | null
  /** `null` creates no administrator (never seen in Noris). */
  administrator?: NorisAdministrator | null
  /** Defaults to unpaid. */
  payment?: NorisPaymentOptions
  /** `ZAL` documents of the tax. */
  overpayments?: NorisOverpaymentOptions[]
  /** Overrides the default due dates, one per installment (`installmentCount` is then ignored). */
  dueDates?: Date[]
}

/** Parts of a real estate tax, named as the query returns them. */
export type NorisRealEstateTaxDetails = Partial<
  Record<keyof typeof NorisRawRealEstateTaxDetailSchema.shape, number>
>

export interface NorisRealEstateTaxOptions extends NorisTaxOptions {
  /** `dan_spolu` */
  total?: number
  installmentCount?: 1 | 2 | 3
  /** Parts of the tax, the rest is 0. Defaults to an apartment only (`dan_byty` = total). */
  details?: NorisRealEstateTaxDetails
}

export interface NorisCommunalWasteTaxOptions extends NorisTaxOptions {
  /** `dan_spolu_nezaokr`, defaults to the sum of the container fees. */
  total?: number
  installmentCount?: 1 | 2 | 3 | 4
  paymentMethod?: NorisPaymentMethod
  /** Defaults to `[DEFAULT_NORIS_CONTAINER]` */
  containers?: NorisContainerOptions[]
  skippedContainers?: NorisSkippedContainerOptions[]
}

export interface NorisTaxFixture {
  taxType: NorisTaxType
  /** `dane21_doklad.cislo_subjektu` of the tax document */
  documentId: number
  /** `dane21_priznanie` or `pko21_poplatok` of the document */
  podklad: number
  /** Without slash, as the app stores it */
  birthNumber: string
  variableSymbol: string
  year: number
  total: number
  installments: { amount: number; dueDate: Date }[]
}

/** Ids of the `dane21_druh_dokladu` rows the queries select by `typ_dokladu` and `typ_dane`. */
const DOCUMENT_KINDS: Record<
  NorisTaxType,
  { tax: number; overpayment: number }
> = {
  [NorisTaxType.RealEstate]: { tax: 1, overpayment: 2 },
  [NorisTaxType.CommunalWaste]: { tax: 3, overpayment: 4 },
}

/** Ids of everything else start above the document kinds. */
const MIN_ID = 10_000
const MAX_ID = 2_000_000_000

const DEFAULT_REAL_ESTATE_TAX_TOTAL = 90
const DEFAULT_REAL_ESTATE_INSTALLMENTS = 3
const DEFAULT_APARTMENT_TAX_BASE = 72
const DEFAULT_COMMUNAL_WASTE_INSTALLMENTS = 4

/** The first installment is due this many days after the tax ruling comes into force. */
const FIRST_DUE_DATE_DAYS = 15
/** Due dates (month, day) of the following installments, the last ones are used. */
const LATER_DUE_DATES = [
  [5, 31],
  [8, 31],
  [10, 31],
] as const

const VARIABLE_SYMBOL_LENGTH = 10
const SUBJECT_REFERENCE_LENGTH = 7

const DEFAULT_NAME: NorisPersonName = { meno: 'Ján', priezvisko: 'Daňovník' }
const DEFAULT_ADDRESS: NorisAddress = {
  street: 'Testovacia',
  buildingNumber: '9876',
  streetNumber: '54',
  zip: '00000',
  city: 'Bratislava',
}
const DEFAULT_ADMINISTRATOR: NorisAdministrator = {
  name: 'Mgr. Správca Daní',
  phone: '02/0000 0000',
  email: 'spravca@example.com',
}
const DEFAULT_CONTAINER_ADDRESS = 'Testovacia,Bratislava,00000'

/** Tables cleared by `clear()` */
const TABLES = [
  'dane21_doklad',
  'dane21_druh_dokladu',
  'dane21_doklad_sum_saldo',
  'dane21_priznanie',
  'dane21_priznanie_config',
  'dane_21_sum_dan_prizn_detail',
  'dane_21_sum_pko_popl_celkom',
  'dane_21_adresa_view',
  'pko21_poplatok',
  'pko21_poplatok_config',
  'pko21_nadoba',
  'subjekty',
  'organizace',
  'zamestnanci',
] satisfies NorisTableName[]

function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day))
}

/** See `NorisRealEstateTaxDetailColumn` */
function toDetailColumn(name: string): string {
  return name.replace(/^det_stavba_(DAN|ZAKLAD)_j([HI])$/, 'det_stavba_j_$1_$2')
}

/**
 * Splits the total into equal installments rounded down to cents, the remainder goes to the last one (79.38 -> 19.84 +
 * 19.84 + 19.84 + 19.86, as in Noris).
 */
function splitIntoInstallments(
  total: number,
  dueDates: Date[],
): NorisTaxFixture['installments'] {
  const share = currency(
    Math.floor(currency(total).intValue / dueDates.length),
    { fromCents: true },
  )
  const remainder = currency(total).subtract(
    share.multiply(dueDates.length - 1),
  )
  return dueDates.map((dueDate, index) => ({
    amount: index === dueDates.length - 1 ? remainder.value : share.value,
    dueDate,
  }))
}

function randomDigits(length: number): string {
  return Array.from({ length }, () => randomInt(0, 10)).join('')
}

/**
 * Creates taxes in the Noris stub (`test/noris/schema.sql`) the way they look in Noris, see
 * `test/noris/noris-findings.md`.
 *
 * Defaults are the most common shapes:
 * - real estate tax (DZN): apartment only, 90.00 in 3 installments;
 * - communal waste (KO): `DEFAULT_NORIS_CONTAINER`, 4 installments.
 *
 * Taxes are unpaid, issued on 2 March and in force from 7 April of the tax year.
 */
export class NorisFixtureFactory {
  private readonly usedIds = new Set<number>()

  private readonly usedVariableSymbols = new Set<string>()

  constructor(private readonly pool: ConnectionPool) {}

  /** Deletes all data, call it in `beforeEach` or `afterEach`. */
  async clear(): Promise<void> {
    await this.pool
      .request()
      .batch(TABLES.map((table) => `DELETE FROM lcs.${table};`).join('\n'))
  }

  private async insertTaxpayerAddress(
    taxpayerId: number,
    address: NorisAddress | null,
  ): Promise<void> {
    const addressId = address ? this.nextId() : null
    await this.insert('organizace', {
      cislo_subjektu: taxpayerId,
      adr_tp_sup_cislo: address?.buildingNumber ?? null,
      adr_tp_or_cislo: address?.streetNumber ?? null,
      adresa_tp_sidlo: addressId,
    })
    if (address && addressId) {
      await this.insert('dane_21_adresa_view', {
        cislo_subjektu: addressId,
        ulica_nazev: address.street,
        psc_refer: address.zip,
        obec_nazev: address.city,
      })
    }
  }

  private async insertContainer(
    podklad: number,
    address: string,
    row: Omit<NorisTableRows['pko21_nadoba'], 'pko_poplatok' | 'adresa'>,
  ): Promise<void> {
    const addressId = this.nextId()
    await this.insertSubject(addressId, {
      cislo_poradace: 0,
      nazev_subjektu: address,
    })
    await this.insert('pko21_nadoba', {
      pko_poplatok: podklad,
      adresa: addressId,
      ...row,
    })
  }

  private async insertSubject(
    id: number,
    columns: Omit<NorisTableRows['subjekty'], 'cislo_subjektu'>,
  ): Promise<void> {
    await this.insert('subjekty', { cislo_subjektu: id, ...columns })
  }

  /** mssql inserts `undefined` as `NULL`. */
  private async insert<Table extends NorisTableName>(
    table: Table,
    row: NorisTableRows[Table],
  ): Promise<void> {
    const request = this.pool.request()
    const entries = Object.entries(row)
    entries.forEach(([column, value]) => request.input(column, value))
    const columns = entries.map(([column]) => column)
    const parameters = columns.map((column) => `@${column}`)
    await request.query(
      `INSERT INTO lcs.${table} (${columns.join(', ')}) VALUES (${parameters.join(', ')})`,
    )
  }

  private nextId(): number {
    let id: number
    do {
      id = randomInt(MIN_ID, MAX_ID)
    } while (this.usedIds.has(id))
    this.usedIds.add(id)
    return id
  }

  private nextVariableSymbol(): string {
    let variableSymbol: string
    do {
      variableSymbol = randomDigits(VARIABLE_SYMBOL_LENGTH)
    } while (this.usedVariableSymbols.has(variableSymbol))
    this.usedVariableSymbols.add(variableSymbol)
    return variableSymbol
  }
}

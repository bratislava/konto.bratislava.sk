import { randomInt } from 'node:crypto'

import currency from 'currency.js'
import { ConnectionPool } from 'mssql'

import { NorisRawRealEstateTaxDetailSchema } from '../../../src/noris/types/noris.schema'
import { addSlashToBirthNumber } from '../../../src/utils/functions/birthNumber'
import { toDate } from '../../../src/utils/functions/temporal'
import { generateBirthNumber } from '../birth-number'
import { NorisTableName, NorisTableRows } from './noris-tables'

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
  /** Defaults to 1 May of the tax year. */
  date?: Temporal.PlainDate
}

export interface NorisPaymentOptions {
  /** Saldo `uhrazeno` of the tax document. */
  paid: number
  /** Saldo `datum_posledni_platby`, `null` when the tax was paid only by applying an overpayment. */
  lastPaymentDate?: Temporal.PlainDate | null
}

interface NorisTaxOptions {
  /**
   * Stored in `rodne_cislo` as given. Noris stores birth numbers with slash and the app queries with slash,
   * a few are stored without it. Generated with slash by default.
   */
  birthNumber?: string
  /** `podnikatel` `A`, the queries return only `N` (default). */
  entrepreneur?: boolean
  /** `cislo_konania` (the app's `Tax.taxId`), random in the Noris format by default. */
  taxId?: string
  /** `subjekt_refer` (the app's `TaxPayer.externalId`), 7 random digits by default as in Noris. */
  taxpayerExternalId?: string
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
  /** `datum_realizacie` (the app's `dateCreateTax`), defaults to 2 March 9:30 of the tax year. */
  issuedAt?: Temporal.PlainDateTime
  /**
   * `datum_platnosti` (the app's `dateTaxRuling`), defaults to 7 April of the tax year, `null` for state `Z`. The first
   * due date is 15 days after it (after the default when `null`).
   */
  validFrom?: Temporal.PlainDate | null
  /** Overrides the default due dates, one per installment (`installmentCount` is then ignored). */
  dueDates?: Temporal.PlainDate[]
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
  taxId: string
  taxpayerExternalId: string
  year: number
  total: number
  installments: { amount: number; dueDate: Temporal.PlainDate }[]
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

const DEFAULT_ISSUED_AT = { month: 3, day: 2, hour: 9, minute: 30 }
const DEFAULT_VALID_FROM = { month: 4, day: 7 }
const DEFAULT_OVERPAYMENT_DATE = { month: 5, day: 1 }

/** The first installment is due this many days after the tax ruling comes into force. */
const FIRST_DUE_DATE_DAYS = 15
/** Due dates (month, day) of the following installments, the last ones are used. */
const LATER_DUE_DATES = [
  [5, 31],
  [8, 31],
  [10, 31],
] as const

const VARIABLE_SYMBOL_LENGTH = 10
const TAXPAYER_EXTERNAL_ID_LENGTH = 7

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

/** Noris dates have no time zone, mssql writes and reads them as UTC. */
function toNorisDate(date: Temporal.PlainDate | Temporal.PlainDateTime): Date {
  return toDate(Temporal.PlainDateTime.from(date).toZonedDateTime('UTC'))
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
  dueDates: Temporal.PlainDate[],
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

/** In the format of `cislo_konania` in Noris, e.g. `1/23/456789-01/23/4567890`. */
function generateTaxId(): string {
  return `${randomDigits(1)}/${randomDigits(2)}/${randomDigits(6)}-${randomDigits(2)}/${randomDigits(2)}/${randomDigits(7)}`
}

/**
 * Creates taxes in the Noris stub (`test/noris/schema.sql`) the way they look in Noris, see
 * `test/noris/noris-findings.md`.
 *
 * Defaults are the most common shapes:
 * - real estate tax (DZN): apartment only, 90.00 in 3 installments;
 * - communal waste (KO): `DEFAULT_NORIS_CONTAINER`, 4 installments.
 *
 * Taxes are unpaid, issued on 2 March and in force from 7 April of the tax year (`issuedAt`, `validFrom`).
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

  async createRealEstateTax(
    options: NorisRealEstateTaxOptions = {},
  ): Promise<NorisTaxFixture> {
    const {
      total = DEFAULT_REAL_ESTATE_TAX_TOTAL,
      installmentCount = DEFAULT_REAL_ESTATE_INSTALLMENTS,
      details = {
        dan_byty: total,
        det_zaklad_dane_byt: DEFAULT_APARTMENT_TAX_BASE,
        det_dan_byty_byt: total,
      },
    } = options
    const fixture = await this.createTaxDocument(
      NorisTaxType.RealEstate,
      total,
      installmentCount,
      options,
    )
    const name = options.name ?? DEFAULT_NAME

    await this.insertSubject(fixture.podklad, {
      cislo_poradace: await this.insertTaxAdministrator(
        'dane21_priznanie_config',
        options.administrator,
      ),
    })
    await this.insert('dane21_priznanie', {
      cislo_subjektu: fixture.podklad,
      podnikatel: options.entrepreneur ? 'A' : 'N',
      titul: name.titul ?? null,
      meno: name.meno,
      priezvisko: name.priezvisko,
      titul_za: name.titulZa ?? null,
      rok: fixture.year,
      forma_uhrady: null,
      rodne_cislo:
        options.birthNumber ?? addSlashToBirthNumber(fixture.birthNumber),
    })
    await this.insert('dane_21_sum_dan_prizn_detail', {
      cs_dan_prizn: fixture.podklad,
      dan_spolu: total,
      dan_stavby_SPOLU: 0,
      ...Object.fromEntries(
        Object.entries(details).map(([column, value]) => [
          toDetailColumn(column),
          value,
        ]),
      ),
    })

    return fixture
  }

  async createCommunalWasteTax(
    options: NorisCommunalWasteTaxOptions = {},
  ): Promise<NorisTaxFixture> {
    const {
      containers = [DEFAULT_NORIS_CONTAINER],
      skippedContainers = [],
      installmentCount = DEFAULT_COMMUNAL_WASTE_INSTALLMENTS,
      paymentMethod = 'P',
    } = options
    const containerRows = containers.map((container) => ({
      objem: container.volume,
      pocet_nadob: container.count,
      pocet_odvozov: container.pickups,
      sadzba_mena: container.rate,
      suma_uhrada_mena: container.fee,
      druh_nadoby: container.type,
      druh_odpadu: null,
      address: container.address ?? DEFAULT_CONTAINER_ADDRESS,
      orientacne_cislo:
        container.streetNumber === undefined
          ? DEFAULT_ADDRESS.streetNumber
          : container.streetNumber,
    }))
    const total =
      options.total ??
      containerRows.reduce(
        (sum, row) => sum.add(row.suma_uhrada_mena),
        currency(0),
      ).value

    const fixture = await this.createTaxDocument(
      NorisTaxType.CommunalWaste,
      total,
      installmentCount,
      options,
    )
    const name = options.name ?? DEFAULT_NAME

    await this.insertSubject(fixture.podklad, {
      cislo_poradace: await this.insertTaxAdministrator(
        'pko21_poplatok_config',
        options.administrator,
      ),
    })
    await this.insert('pko21_poplatok', {
      cislo_subjektu: fixture.podklad,
      podnikatel: options.entrepreneur ? 'A' : 'N',
      rok: fixture.year,
      titul: name.titul ?? null,
      meno: name.meno,
      priezvisko: name.priezvisko,
      titul_za: name.titulZa ?? null,
      forma_uhrady: paymentMethod,
      rodne_cislo:
        options.birthNumber ?? addSlashToBirthNumber(fixture.birthNumber),
    })
    await this.insert('dane_21_sum_pko_popl_celkom', {
      cs_dan_prizn: fixture.podklad,
      dan_spolu_nezaokr: total,
    })

    await Promise.all([
      ...containerRows.map(async ({ address, ...row }) =>
        this.insertContainer(fixture.podklad, address, row),
      ),
      ...skippedContainers.map(async ({ wasteType, type, volume, pickups }) =>
        this.insertContainer(fixture.podklad, DEFAULT_CONTAINER_ADDRESS, {
          objem: volume,
          pocet_nadob: 1,
          pocet_odvozov: pickups,
          sadzba_mena: 0,
          suma_uhrada_mena: 0,
          druh_nadoby: type,
          druh_odpadu: wasteType,
          orientacne_cislo: DEFAULT_ADDRESS.streetNumber,
        }),
      ),
    ])

    return fixture
  }

  /** Sets the saldo of the tax document, e.g. to simulate a payment arriving in Noris. */
  async setPayment(
    fixture: NorisTaxFixture,
    { paid, lastPaymentDate = null }: NorisPaymentOptions,
  ): Promise<void> {
    await this.pool
      .request()
      .input('id', fixture.documentId)
      .input('paid', paid)
      .input('remaining', currency(fixture.total).subtract(paid).value)
      .input('lastPaymentDate', lastPaymentDate && toNorisDate(lastPaymentDate))
      .query(
        `UPDATE lcs.dane21_doklad_sum_saldo
         SET uhrazeno = @paid, zbyva_uhradit = @remaining, datum_posledni_platby = @lastPaymentDate
         WHERE cislo_subjektu = @id`,
      )
  }

  /** Adds a `ZAL` document (overpayment) to the tax. */
  async addOverpayment(
    fixture: NorisTaxFixture,
    {
      amount,
      unappliedAmount = amount,
      refunded = false,
      date = Temporal.PlainDate.from({
        year: fixture.year,
        ...DEFAULT_OVERPAYMENT_DATE,
      }),
    }: NorisOverpaymentOptions,
  ): Promise<void> {
    const id = this.nextId()
    await this.insert('dane21_doklad', {
      cislo_subjektu: id,
      stav_dokladu: 'P',
      datum_platnosti: toNorisDate(date),
      datum_realizacie: toNorisDate(date),
      suma_mena: amount,
      podklad: fixture.podklad,
      pohladavka: this.nextId(),
      druh_dokladu: DOCUMENT_KINDS[fixture.taxType].overpayment,
      rok_podkladu: fixture.year,
    })
    await this.insert('dane21_doklad_sum_saldo', {
      cislo_subjektu: id,
      uhrazeno: refunded ? 0 : amount,
      zbyva_uhradit: refunded ? 0 : -unappliedAmount,
      datum_posledni_platby: toNorisDate(date),
    })
  }

  /** Creates the tax document with its kind, saldo, subjects, address and overpayments. */
  private async createTaxDocument(
    taxType: NorisTaxType,
    total: number,
    installmentCount: number,
    options: NorisTaxOptions,
  ): Promise<NorisTaxFixture> {
    const {
      birthNumber = generateBirthNumber(),
      taxId = generateTaxId(),
      taxpayerExternalId = randomDigits(TAXPAYER_EXTERNAL_ID_LENGTH),
      year = Temporal.Now.plainDateISO().year,
      state = 'P',
      address = DEFAULT_ADDRESS,
      payment = { paid: 0 },
      overpayments = [],
      issuedAt = Temporal.PlainDateTime.from({ year, ...DEFAULT_ISSUED_AT }),
    } = options
    const defaultValidFrom = Temporal.PlainDate.from({
      year,
      ...DEFAULT_VALID_FROM,
    })
    const { validFrom = state === 'Z' ? null : defaultValidFrom } = options
    const dueDates = options.dueDates ?? [
      (validFrom ?? defaultValidFrom).add({ days: FIRST_DUE_DATE_DAYS }),
      ...LATER_DUE_DATES.slice(
        LATER_DUE_DATES.length - installmentCount + 1,
      ).map(([month, day]) => Temporal.PlainDate.from({ year, month, day })),
    ]
    const installments = splitIntoInstallments(total, dueDates)

    await this.ensureDocumentKinds()

    const documentId = this.nextId()
    const podklad = this.nextId()
    const taxpayerId = this.nextId()
    const variableSymbol = this.nextVariableSymbol()

    await this.insert('dane21_doklad', {
      cislo_subjektu: documentId,
      stav_dokladu: state,
      datum_platnosti: validFrom && toNorisDate(validFrom),
      variabilny_symbol: variableSymbol,
      datum_realizacie: toNorisDate(issuedAt),
      suma_mena: total,
      suma_spl1: installments[0]?.amount,
      suma_spl2: installments[1]?.amount,
      suma_spl3: installments[2]?.amount,
      suma_spl4: installments[3]?.amount,
      datum_spl1: installments[0] && toNorisDate(installments[0].dueDate),
      datum_spl2: installments[1] && toNorisDate(installments[1].dueDate),
      datum_spl3: installments[2] && toNorisDate(installments[2].dueDate),
      datum_spl4: installments[3] && toNorisDate(installments[3].dueDate),
      subjekt: taxpayerId,
      podklad,
      pohladavka: this.nextId(),
      druh_dokladu: DOCUMENT_KINDS[taxType].tax,
      rok_podkladu: year,
    })
    await this.insertSubject(documentId, {
      cislo_poradace: 0,
      reference_subjektu: taxId,
    })
    await this.insertSubject(taxpayerId, {
      cislo_poradace: 0,
      reference_subjektu: taxpayerExternalId,
    })
    await this.insertTaxpayerAddress(taxpayerId, address)
    await this.insert('dane21_doklad_sum_saldo', {
      cislo_subjektu: documentId,
      uhrazeno: 0,
      zbyva_uhradit: total,
      datum_posledni_platby: null,
    })

    const fixture: NorisTaxFixture = {
      taxType,
      documentId,
      podklad,
      birthNumber: birthNumber.replace('/', ''),
      variableSymbol,
      taxId,
      taxpayerExternalId,
      year,
      total,
      installments,
    }
    if (payment.paid > 0) {
      await this.setPayment(fixture, {
        lastPaymentDate: installments[0].dueDate,
        ...payment,
      })
    }
    await Promise.all(
      overpayments.map(async (overpayment) =>
        this.addOverpayment(fixture, overpayment),
      ),
    )
    return fixture
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

  /**
   * Inserts the tax administrator (`vyb_*` of the tax, the app's `TaxAdministrator`).
   */
  private async insertTaxAdministrator(
    table: 'dane21_priznanie_config' | 'pko21_poplatok_config',
    administrator: NorisAdministrator | null = DEFAULT_ADMINISTRATOR,
  ): Promise<number> {
    const registerId = this.nextId()
    const administratorId = administrator ? this.nextId() : null
    await this.insert(table, {
      cislo_poradace: registerId,
      vybavuje: administratorId,
    })
    if (administrator && administratorId) {
      await this.insertSubject(administratorId, {
        cislo_poradace: 0,
        nazev_subjektu: administrator.name,
      })
      await this.insert('zamestnanci', {
        cislo_subjektu: administratorId,
        telefon_prace: administrator.phone,
        e_mail: administrator.email,
      })
    }
    return registerId
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

  private async ensureDocumentKinds(): Promise<void> {
    const rows = Object.values(NorisTaxType).flatMap((taxType) => {
      const { tax, overpayment } = DOCUMENT_KINDS[taxType]
      return [
        `(${tax}, 'A', 'V', '${taxType}')`,
        `(${overpayment}, 'A', 'ZAL', '${taxType}')`,
      ]
    })
    await this.pool.request().batch(
      `IF NOT EXISTS (SELECT 1 FROM lcs.dane21_druh_dokladu)
       INSERT INTO lcs.dane21_druh_dokladu (cislo_subjektu, generovat_pohladavku, typ_dokladu, typ_dane)
       VALUES ${rows.join(', ')}`,
    )
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

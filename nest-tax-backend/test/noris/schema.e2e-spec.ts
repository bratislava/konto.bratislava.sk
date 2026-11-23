import {
  ConnectionPool,
  Decimal,
  Int,
  SmallDateTime,
  TinyInt,
  VarChar,
} from 'mssql'

import {
  NorisCommunalWasteTaxSchema,
  NorisRealEstateTaxSchema,
  NorisTaxPaymentSchema,
} from '../../src/noris/types/noris.schema'
import {
  getCommunalWasteTaxesFromNoris,
  queryOverpaymentsFromNorisByDateRange,
  queryPayersFromNoris,
  queryPaymentsFromNorisByFromToDate,
  queryPaymentsFromNorisByVariableSymbols,
} from '../../src/noris/utils/noris.queries'
import { addSlashToBirthNumber } from '../../src/utils/functions/birthNumber'
import { generateBirthNumber } from '../fixtures/birth-number'
import {
  NORIS_SKIPPED_CONTAINERS,
  NorisFixtureFactory,
  NorisTaxFixture,
} from '../fixtures/noris/noris-fixture-factory'
import { connectToNoris } from './connect-to-noris'

const YEAR = 2026
const FROM_DATE = new Date('2026-01-01')
const TO_DATE = new Date('2026-12-31')

describe('Noris stub', () => {
  let pool: ConnectionPool
  let norisFixtureFactory: NorisFixtureFactory

  beforeAll(async () => {
    pool = await connectToNoris()
    norisFixtureFactory = new NorisFixtureFactory(pool)
  })

  afterEach(async () => {
    await norisFixtureFactory.clear()
  })

  afterAll(async () => {
    await pool.close()
  })

  async function queryRealEstateTaxes(birthNumbers: string[], year = YEAR) {
    const request = pool.request().input('year', Int, year)
    birthNumbers.forEach((birthNumber, index) =>
      request.input(
        `birth_number${index}`,
        VarChar(20),
        addSlashToBirthNumber(birthNumber),
      ),
    )
    const result = await request.query<Record<string, unknown>>(
      queryPayersFromNoris.replaceAll(
        '@birth_numbers',
        birthNumbers.map((_, index) => `@birth_number${index}`).join(','),
      ),
    )
    return result.recordset
  }

  async function queryCommunalWasteTaxes(birthNumbers: string[], year = YEAR) {
    const request = pool.request().input('year', Int, year)
    birthNumbers.forEach((birthNumber, index) =>
      request.input(
        `birth_number${index}`,
        VarChar(20),
        addSlashToBirthNumber(birthNumber),
      ),
    )
    const result = await request.query<Record<string, unknown>>(
      getCommunalWasteTaxesFromNoris.replaceAll(
        '@birth_numbers',
        birthNumbers.map((_, index) => `@birth_number${index}`).join(','),
      ),
    )
    return result.recordset
  }

  async function queryPaymentsByVariableSymbols(
    fixtures: NorisTaxFixture[],
    year = YEAR,
  ) {
    const request = pool.request().input('year0', Int, year)
    fixtures.forEach(({ variableSymbol }, index) =>
      request.input(`variable_symbol${index}`, VarChar(20), variableSymbol),
    )
    const result = await request.query<Record<string, unknown>>(
      queryPaymentsFromNorisByVariableSymbols
        .replaceAll('@years', '@year0')
        .replaceAll(
          '@variable_symbols',
          fixtures.map((_, index) => `@variable_symbol${index}`).join(','),
        ),
    )
    return result.recordset
  }

  async function queryOverpayments() {
    const result = await pool
      .request()
      .input('fromDate', SmallDateTime, FROM_DATE)
      .input('toDate', SmallDateTime, TO_DATE)
      .query<Record<string, unknown>>(queryOverpaymentsFromNorisByDateRange)
    return result.recordset
  }

  describe('should run the queries of the app on an empty database', () => {
    it('should run the real estate tax query', async () => {
      expect(await queryRealEstateTaxes([generateBirthNumber()])).toEqual([])
    })

    it('should run the communal waste tax query', async () => {
      expect(await queryCommunalWasteTaxes([generateBirthNumber()])).toEqual([])
    })

    it('should run the payments by date range query', async () => {
      const result = await pool
        .request()
        .input('fromDate', SmallDateTime, FROM_DATE)
        .input('toDate', SmallDateTime, TO_DATE)
        .input('overPayments', TinyInt, 0)
        .input('years', Int, YEAR)
        .query(queryPaymentsFromNorisByFromToDate)

      expect(result.recordset).toEqual([])
    })

    it('should run the payments by variable symbols query', async () => {
      const result = await pool
        .request()
        .input('year0', Int, YEAR)
        .input('variable_symbol0', VarChar(20), '1234567890')
        .query(
          queryPaymentsFromNorisByVariableSymbols
            .replaceAll('@years', '@year0')
            .replaceAll('@variable_symbols', '@variable_symbol0'),
        )

      expect(result.recordset).toEqual([])
    })

    it('should run the overpayments query', async () => {
      expect(await queryOverpayments()).toEqual([])
    })
  })

  describe('should reimplement the Noris functions', () => {
    it.each<[number | null, number, string]>([
      [0, 2, '0,00'],
      [5, 2, '5,00'],
      [1.5, 2, '1,50'],
      [12.345, 2, '12,35'],
      [12.355, 2, '12,36'],
      [0.004, 2, '0,00'],
      [1234.5, 2, '1 234,50'],
      [1_234_567.891, 2, '1 234 567,89'],
      [-12.34, 2, '-12,34'],
      [-12.345, 2, '-12,35'],
      [-1234.5, 2, '-1 234,50'],
      [12.5, 0, '13'],
      [1.234_56, 4, '1,2346'],
      [null, 2, '0,00'],
    ])(
      'fn21_dec2string(%s, %i) should be %j',
      async (value, decimals, expected) => {
        const result = await pool
          .request()
          .input('value', Decimal(15, 6), value)
          .input('decimals', Int, decimals)
          .query<{
            result: string
          }>('SELECT lcs.fn21_dec2string(@value, @decimals) AS result')

        expect(result.recordset[0].result).toBe(expected)
      },
    )

    it.each<[string | null, string | null, string]>([
      [null, null, ''],
      ['1234', null, '1234'],
      [null, '5A', '5A'],
      ['1234', '5A', '1234/5A'],
      ['', '', ''],
      [' 12 ', ' 3 ', '12/3'],
    ])(
      'fn21_adresa_string(NULL, %j, %j) should be %j',
      async (supisneCislo, orientacneCislo, expected) => {
        const result = await pool
          .request()
          .input('supisne', VarChar(10), supisneCislo)
          .input('orientacne', VarChar(10), orientacneCislo)
          .query<{
            result: string
          }>(
            'SELECT lcs.fn21_adresa_string(NULL, @supisne, @orientacne) AS result',
          )

        expect(result.recordset[0].result).toBe(expected)
      },
    )

    it.each([null, -1])(
      'fn21_meno_osoby_org(%s, NULL) should be empty for an unknown person',
      async (id) => {
        const result = await pool.request().input('id', Int, id).query<{
          result: string
        }>('SELECT lcs.fn21_meno_osoby_org(@id, NULL) AS result')

        expect(result.recordset[0].result).toBe('')
      },
    )
  })

  describe('real estate tax fixtures', () => {
    it('should return the default fixture in the shape the app expects', async () => {
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
      })

      const rows = await queryRealEstateTaxes([fixture.birthNumber])

      expect(rows).toHaveLength(1)
      expect(NorisRealEstateTaxSchema.parse(rows[0])).toEqual(
        expect.objectContaining({
          stav_dokladu: 'P',
          variabilny_symbol: fixture.variableSymbol,
          cislo_konania: fixture.taxId,
          subjekt_refer: fixture.taxpayerExternalId,
          ICO_RC: addSlashToBirthNumber(fixture.birthNumber),
          subjekt_nazev: 'Ján Daňovník',
          dan_spolu: '90,00',
          dan_byty: '90,00',
          SPL1: '',
          SPL4_1: '30,00',
          SPL4_2: '30,00',
          SPL4_3: '30,00',
          SPL4_4: '',
          datum_spl1: new Date('2026-04-22'),
          datum_spl2: new Date('2026-08-31'),
          datum_spl3: new Date('2026-10-31'),
          datum_spl4: null,
          ulica_tb_cislo: 'Testovacia 9876/54',
          psc_ref_tb: '00000',
          obec_nazev_tb: 'Bratislava',
          vyb_nazov: 'Mgr. Správca Daní',
          forma_uhrady: null,
          uhrazeno: 0,
          datum_posledni_platby: null,
        }),
      )
    })

    it('should return one installment in SPL1', async () => {
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        installmentCount: 1,
      })

      const [row] = await queryRealEstateTaxes([fixture.birthNumber])

      expect(row).toEqual(
        expect.objectContaining({ SPL1: '90,00', SPL4_1: '', SPL4_2: '' }),
      )
    })

    it('should return the given tax id and taxpayer external id', async () => {
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        taxId: '0/00/000000-00/00/0000001',
        taxpayerExternalId: '0000001',
      })

      const [row] = await queryRealEstateTaxes([fixture.birthNumber])

      expect(row).toEqual(
        expect.objectContaining({
          cislo_konania: '0/00/000000-00/00/0000001',
          subjekt_refer: '0000001',
        }),
      )
    })

    it('should return the given issue and validity dates', async () => {
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        issuedAt: Temporal.PlainDateTime.from('2026-01-15T08:45'),
        validFrom: Temporal.PlainDate.from('2026-02-01'),
      })

      const [row] = await queryRealEstateTaxes([fixture.birthNumber])

      expect(row).toEqual(
        expect.objectContaining({
          datum_realizacie: new Date('2026-01-15T08:45Z'),
          datum_platnosti: new Date('2026-02-01'),
          datum_spl1: new Date('2026-02-16'),
        }),
      )
    })

    it('should return a tax in force without validity date', async () => {
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        validFrom: null,
      })

      const [row] = await queryRealEstateTaxes([fixture.birthNumber])

      expect(row).toEqual(
        expect.objectContaining({
          stav_dokladu: 'P',
          datum_platnosti: null,
          datum_spl1: new Date('2026-04-22'),
        }),
      )
    })

    it('should return the tax without address', async () => {
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        address: null,
      })

      const [row] = await queryRealEstateTaxes([fixture.birthNumber])

      expect(row).toEqual(
        expect.objectContaining({
          ulica_tb_cislo: null,
          psc_ref_tb: null,
          obec_nazev_tb: null,
        }),
      )
    })

    it('should not return a cancelled tax', async () => {
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        state: 'S',
      })

      expect(await queryRealEstateTaxes([fixture.birthNumber])).toEqual([])
    })

    it('should not find a birth number stored without slash', async () => {
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        birthNumber: generateBirthNumber(),
      })

      expect(await queryRealEstateTaxes([fixture.birthNumber])).toEqual([])
    })
  })

  describe('taxes of an entrepreneur', () => {
    it('should not return the real estate tax', async () => {
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        entrepreneur: true,
      })

      expect(await queryRealEstateTaxes([fixture.birthNumber])).toEqual([])
    })

    it('should not return the communal waste tax', async () => {
      const fixture = await norisFixtureFactory.createCommunalWasteTax({
        year: YEAR,
        entrepreneur: true,
      })

      expect(await queryCommunalWasteTaxes([fixture.birthNumber])).toEqual([])
    })

    it('should not return the payments', async () => {
      const realEstateTax = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        entrepreneur: true,
        payment: { paid: 30 },
      })
      const communalWasteTax = await norisFixtureFactory.createCommunalWasteTax(
        { year: YEAR, entrepreneur: true, payment: { paid: 60.4 } },
      )

      expect(
        await queryPaymentsByVariableSymbols([realEstateTax, communalWasteTax]),
      ).toEqual([])
    })

    it('should not return the overpayment', async () => {
      await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        entrepreneur: true,
        payment: {
          paid: 90,
          lastPaymentDate: Temporal.PlainDate.from('2026-05-01'),
        },
        overpayments: [
          { amount: 7, date: Temporal.PlainDate.from('2026-05-01') },
        ],
      })

      expect(await queryOverpayments()).toEqual([])
    })
  })

  describe('communal waste tax fixtures', () => {
    it('should return the default fixture in the shape the app expects', async () => {
      const fixture = await norisFixtureFactory.createCommunalWasteTax({
        year: YEAR,
      })

      const rows = await queryCommunalWasteTaxes([fixture.birthNumber])

      expect(rows).toHaveLength(1)
      expect(NorisCommunalWasteTaxSchema.parse(rows[0])).toEqual(
        expect.objectContaining({
          stav_dokladu: 'P',
          variabilny_symbol: fixture.variableSymbol,
          cislo_konania: fixture.taxId,
          subjekt_refer: fixture.taxpayerExternalId,
          ICO_RC: addSlashToBirthNumber(fixture.birthNumber),
          dan_spolu: '60,40',
          SPL1: '',
          SPL4_1: '15,10',
          SPL4_2: '15,10',
          SPL4_3: '15,10',
          SPL4_4: '15,10',
          datum_spl1: new Date('2026-04-22'),
          datum_spl2: new Date('2026-05-31'),
          datum_spl3: new Date('2026-08-31'),
          datum_spl4: new Date('2026-10-31'),
          forma_uhrady: 'P',
          objem_nadoby: 120,
          pocet_nadob: 1,
          pocet_odvozov: 14,
          sadzba: 4.314,
          poplatok: 60.4,
          druh_nadoby: 'N12',
          ulica: 'Testovacia',
          orientacne_cislo: '54',
          uhrazeno: 0,
        }),
      )
    })

    it('should put the remainder of the installments into the last one', async () => {
      const fixture = await norisFixtureFactory.createCommunalWasteTax({
        year: YEAR,
        total: 79.38,
      })

      expect(fixture.installments.map(({ amount }) => amount)).toEqual([
        19.84, 19.84, 19.84, 19.86,
      ])
    })

    it('should return a row per container', async () => {
      const fixture = await norisFixtureFactory.createCommunalWasteTax({
        year: YEAR,
        containers: [
          {
            type: 'N12',
            volume: 120,
            count: 1,
            pickups: 14,
            rate: 4.314,
            fee: 60.4,
          },
          {
            type: 'N24',
            volume: 240,
            count: 2,
            pickups: 26,
            rate: 6.9024,
            fee: 358.92,
          },
        ],
        // Containers of other waste types are not returned
        skippedContainers: [
          NORIS_SKIPPED_CONTAINERS.KOD,
          NORIS_SKIPPED_CONTAINERS.BRO,
        ],
      })

      const rows = await queryCommunalWasteTaxes([fixture.birthNumber])

      expect(
        rows.map(({ druh_nadoby, poplatok }) => ({ druh_nadoby, poplatok })),
      ).toEqual(
        expect.arrayContaining([
          { druh_nadoby: 'N12', poplatok: 60.4 },
          { druh_nadoby: 'N24', poplatok: 358.92 },
        ]),
      )
      expect(rows).toHaveLength(2)
      expect(fixture.total).toBe(419.32)
    })

    it('should not return the tax without address', async () => {
      const fixture = await norisFixtureFactory.createCommunalWasteTax({
        year: YEAR,
        address: null,
      })

      expect(await queryCommunalWasteTaxes([fixture.birthNumber])).toEqual([])
    })

    it('should return a cancelled tax', async () => {
      const fixture = await norisFixtureFactory.createCommunalWasteTax({
        year: YEAR,
        state: 'S',
      })

      const rows = await queryCommunalWasteTaxes([fixture.birthNumber])

      expect(rows).toEqual([expect.objectContaining({ stav_dokladu: 'S' })])
    })
  })

  describe('payment fixtures', () => {
    it('should return the payments of both tax types', async () => {
      const realEstateTax = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        payment: { paid: 30 },
      })
      const communalWasteTax = await norisFixtureFactory.createCommunalWasteTax(
        { year: YEAR, payment: { paid: 60.4 } },
      )
      const unpaidTax = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
      })

      const rows = await queryPaymentsByVariableSymbols([
        realEstateTax,
        communalWasteTax,
        unpaidTax,
      ])

      expect(rows.map((row) => NorisTaxPaymentSchema.parse(row))).toEqual(
        expect.arrayContaining([
          {
            variabilny_symbol: realEstateTax.variableSymbol,
            uhrazeno: 30,
            datum_posledni_platby: new Date('2026-04-22'),
          },
          {
            variabilny_symbol: communalWasteTax.variableSymbol,
            uhrazeno: 60.4,
            datum_posledni_platby: new Date('2026-04-22'),
          },
        ]),
      )
      expect(rows).toHaveLength(2)
    })

    it('should return an overpayment', async () => {
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        payment: {
          paid: 90,
          lastPaymentDate: Temporal.PlainDate.from('2026-05-01'),
        },
        overpayments: [
          { amount: 7, date: Temporal.PlainDate.from('2026-05-01') },
        ],
      })

      const rows = await queryOverpayments()

      expect(rows).toEqual([
        {
          variabilny_symbol: fixture.variableSymbol,
          uhrazeno: 97,
          datum_posledni_platby: new Date('2026-05-01'),
        },
      ])
    })
  })
})

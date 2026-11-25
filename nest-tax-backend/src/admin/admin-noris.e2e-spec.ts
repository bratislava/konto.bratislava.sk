import { randomInt } from 'node:crypto'

import { HttpStatus } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ConnectionPool } from 'mssql'
import { ResponseUserByBirthNumberDtoTaxDeliveryMethodAtLockDateEnum } from 'openapi-clients/city-account'

import { setCurrentTime } from '../../test/current-time'
import {
  FixtureUser,
  UserFixtureFactory,
} from '../../test/fixtures/auth/user-fixture-factory'
import { generateBirthNumber } from '../../test/fixtures/birth-number'
import { BloomreachMock } from '../../test/fixtures/mocks/bloomreach.mock'
import {
  CityAccountEndpoint,
  CityAccountMock,
} from '../../test/fixtures/mocks/city-account.mock'
import {
  NORIS_SKIPPED_CONTAINERS,
  NorisAddress,
  NorisAdministrator,
  NorisContainerOptions,
  NorisFixtureFactory,
  NorisPersonName,
  NorisTaxFixture,
  toNorisDate,
} from '../../test/fixtures/noris/noris-fixture-factory'
import {
  initializeTestingApp,
  TestingApp,
} from '../../test/initialize-testing-app'
import { connectToNoris } from '../../test/noris/connect-to-noris'
import {
  expectAny,
  expectArrayContaining,
  expectObjectContaining,
} from '../__tests__/matchers'
import { AppModule } from '../app.module'
import { BloomreachEventNameEnum } from '../bloomreach/bloomreach.types'
import BaConfigService from '../config/ba-config.service'
import {
  DeliveryMethodNamed,
  PaymentStatus,
  TaxImportStatus,
  TaxType,
} from '../generated/prisma/client'
import { RealEstateTaxAreaType } from '../prisma/json-types'
import { PrismaService } from '../prisma/prisma.service'
import {
  InstallmentPaymentReasonNotPossibleEnum,
  OneTimePaymentTypeEnum,
  ResponseCommunalWasteTaxSummaryDetailDto,
  TaxAvailabilityStatus,
  TaxStatusEnum,
} from '../tax/dtos/response.tax.dto'
import { addSlashToBirthNumber } from '../utils/functions/birthNumber'
import { BRATISLAVA_TIME_ZONE, toDate } from '../utils/functions/temporal'

const YEAR = 2026

/**
 * Current time of the app in every test. It is outside the period when the tax list shows the current year's tax as
 * awaiting processing (1 February - 1 July, see `TaxService.getListOfTaxesByBirthnumberAndType`).
 */
const NOW = Temporal.ZonedDateTime.from({
  timeZone: BRATISLAVA_TIME_ZONE,
  year: YEAR,
  month: 11,
  day: 25,
  hour: 10,
})

/** Payments older than this are imported with suppressed email (`HISTORICAL_PAYMENT_AGE_DAYS`). */
const HISTORICAL_PAYMENT_AGE_DAYS = 180

const TAXPAYER_NAME: NorisPersonName = { meno: 'Ján', priezvisko: 'Daňovník' }

const TAXPAYER_ADDRESS: NorisAddress = {
  street: 'Testovacia',
  buildingNumber: '9876',
  streetNumber: '54',
  zip: '00000',
  city: 'Bratislava',
}

const NORIS_ADMINISTRATOR = {
  name: 'Mgr. Správca Daní',
  phone: '02/0000 0000',
  email: 'spravca@example.com',
} satisfies NorisAdministrator

/** The Noris administrator as returned by the API */
function toApiTaxAdministrator(administrator: NorisAdministrator) {
  return {
    name: administrator.name,
    phoneNumber: administrator.phone,
    email: administrator.email,
  }
}

/** The Noris taxpayer name and address as returned by the API, without `externalId` */
function toApiTaxPayer(name: NorisPersonName, address: NorisAddress) {
  return {
    name: `${name.meno} ${name.priezvisko}`,
    permanentResidenceStreet: `${address.street} ${address.buildingNumber}/${address.streetNumber}`,
    permanentResidenceZip: address.zip,
    permanentResidenceCity: address.city,
  }
}

const TAX_ADMINISTRATOR = toApiTaxAdministrator(NORIS_ADMINISTRATOR)

const TAX_PAYER = toApiTaxPayer(TAXPAYER_NAME, TAXPAYER_ADDRESS)

/** Tax list of a user without any tax */
const NO_TAXES = {
  availabilityStatus: TaxAvailabilityStatus.LOOKING_FOR_YOUR_TAX,
  items: [],
  taxAdministrator: null,
}

/**
 * The app calculates the first due date from the validity date (`calculateDueDate`), as midnight in Bratislava. It is
 * the first due date of the fixture when that is a working day.
 */
function firstDueDateOf(fixture: NorisTaxFixture): string {
  return toDate(
    fixture.installments[0].dueDate.toZonedDateTime(BRATISLAVA_TIME_ZONE),
  ).toISOString()
}

/** The last due date is taken from Noris. */
function lastDueDateOf(fixture: NorisTaxFixture): string {
  const { dueDate } = fixture.installments[fixture.installments.length - 1]
  return toNorisDate(dueDate).toISOString()
}

describe('Admin Noris endpoints', () => {
  let testingApp: TestingApp
  let prismaService: PrismaService
  let norisPool: ConnectionPool
  let norisFixtureFactory: NorisFixtureFactory
  let userFixtureFactory: UserFixtureFactory
  let cityAccountMock: CityAccountMock
  let bloomreachMock: BloomreachMock
  let adminHeaders: { apiKey: string }

  const today = NOW.toPlainDate()
  const yesterday = today.subtract({ days: 1 }).toString()
  const tomorrow = today.add({ days: 1 }).toString()

  beforeAll(async () => {
    userFixtureFactory = new UserFixtureFactory()
    cityAccountMock = new CityAccountMock()
    bloomreachMock = new BloomreachMock()

    testingApp = await initializeTestingApp(
      userFixtureFactory.setupMockAuth(
        Test.createTestingModule({ imports: [AppModule] }),
      ),
    )
    prismaService = testingApp.app.get(PrismaService)
    adminHeaders = {
      apiKey: testingApp.app.get(BaConfigService).tokens.adminAppSecret,
    }

    norisPool = await connectToNoris()
    norisFixtureFactory = new NorisFixtureFactory(norisPool)
  })

  beforeEach(async () => {
    setCurrentTime(NOW)
    cityAccountMock.install()
    bloomreachMock.install()
    await norisFixtureFactory.clear()
  })

  afterEach(() => {
    testingApp.afterEach()
  })

  afterAll(async () => {
    await norisPool.close()
    await testingApp.afterAll()
  })

  /** Registers the taxpayer of the fixture in city account. */
  function addCityAccountUser(
    fixture: NorisTaxFixture,
    taxDeliveryMethodAtLockDate: ResponseUserByBirthNumberDtoTaxDeliveryMethodAtLockDateEnum | null = null,
  ): FixtureUser {
    const user = userFixtureFactory.createUser({
      birthNumber: fixture.birthNumber,
    })
    cityAccountMock.addUser(user, { taxDeliveryMethodAtLockDate })
    return user
  }

  function eventsOf(user: FixtureUser, eventType: BloomreachEventNameEnum) {
    return bloomreachMock.events
      .filter(
        (event) =>
          event.customer_ids.city_account_id ===
            user.cityAccountUser.externalId && event.event_type === eventType,
      )
      .map((event) => event.properties)
  }

  describe('POST /admin/create-data-from-noris', () => {
    it('should create the real estate tax of a city account user', async () => {
      const issuedAt = Temporal.PlainDateTime.from(`${YEAR}-03-02T09:30`)
      const validFrom = Temporal.PlainDate.from(`${YEAR}-04-07`)
      const apartmentTaxInCents = 9000
      const apartmentTaxBase = 7200
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        name: TAXPAYER_NAME,
        address: TAXPAYER_ADDRESS,
        administrator: NORIS_ADMINISTRATOR,
        issuedAt,
        validFrom,
        totalInCents: apartmentTaxInCents,
        details: {
          dan_byty: apartmentTaxInCents,
          det_zaklad_dane_byt: apartmentTaxBase,
          det_dan_byty_byt: apartmentTaxInCents,
        },
      })
      const user = addCityAccountUser(
        fixture,
        ResponseUserByBirthNumberDtoTaxDeliveryMethodAtLockDateEnum.Edesk,
      )
      const birthNumber = addSlashToBirthNumber(fixture.birthNumber)

      const taxesBefore = await testingApp.axiosClient.get('/v2/tax/taxes', {
        params: { type: TaxType.DZN },
        headers: user.headers,
      })
      expect(taxesBefore.data).toEqual(NO_TAXES)

      const response = await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        { year: YEAR, taxType: TaxType.DZN, birthNumbers: [birthNumber] },
        { headers: adminHeaders },
      )

      expect(response.status).toBe(HttpStatus.OK)
      expect(response.data).toEqual({
        birthNumbers: [birthNumber],
        foundInNoris: [birthNumber],
      })

      const taxes = await testingApp.axiosClient.get('/v2/tax/taxes', {
        params: { type: TaxType.DZN },
        headers: user.headers,
      })
      expect(taxes.data).toEqual({
        availabilityStatus: TaxAvailabilityStatus.AVAILABLE,
        taxAdministrator: expectObjectContaining(TAX_ADMINISTRATOR),
        items: [
          {
            createdAt: expectAny<string>(String),
            year: YEAR,
            type: TaxType.DZN,
            order: 1,
            status: TaxStatusEnum.NOT_PAID,
            amountToBePaid: fixture.totalInCents,
          },
        ],
      })

      const detail = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.DZN, order: 1 },
          headers: user.headers,
        },
      )
      expect(detail.data).toEqual({
        type: TaxType.DZN,
        year: YEAR,
        order: 1,
        paidStatus: TaxStatusEnum.NOT_PAID,
        overallAmount: fixture.totalInCents,
        overallPaid: 0,
        overallBalance: fixture.totalInCents,
        oneTimePayment: {
          isPossible: true,
          type: OneTimePaymentTypeEnum.ONE_TIME_PAYMENT,
          amount: fixture.totalInCents,
          dueDate: firstDueDateOf(fixture),
          qrCode: expectAny<string>(String),
          variableSymbol: fixture.variableSymbol,
        },
        // NOW is after the last due date
        installmentPayment: {
          isPossible: false,
          reasonNotPossible:
            InstallmentPaymentReasonNotPossibleEnum.AFTER_DUE_DATE,
          dueDateLastPayment: lastDueDateOf(fixture),
        },
        taxAdministrator: expectObjectContaining(TAX_ADMINISTRATOR),
        taxPayer: { ...TAX_PAYER, externalId: fixture.taxpayerExternalId },
        itemizedDetail: expectObjectContaining({
          apartmentTotalAmount: apartmentTaxInCents,
          groundTotalAmount: 0,
          constructionTotalAmount: 0,
          apartmentTaxDetail: [
            {
              type: RealEstateTaxAreaType.byt,
              base: apartmentTaxBase,
              amount: apartmentTaxInCents,
            },
            { type: RealEstateTaxAreaType.nebyt, base: 0, amount: 0 },
          ],
        }),
      })

      // Not returned by the API
      expect(
        await prismaService.tax.findUnique({
          where: { variableSymbol: fixture.variableSymbol },
          include: { taxInstallments: { orderBy: { order: 'asc' } } },
        }),
      ).toEqual(
        expect.objectContaining({
          taxId: fixture.taxId,
          dateCreateTax: toNorisDate(issuedAt),
          dateTaxRuling: toNorisDate(validFrom),
          deliveryMethod: DeliveryMethodNamed.EDESK,
          taxInstallments: fixture.installments.map(
            ({ amountInCents, dueDate }) =>
              expectObjectContaining({
                amount: amountInCents,
                dueDate: toNorisDate(dueDate),
              }),
          ),
        }),
      )
      expect(
        await prismaService.taxImportAttempt.findMany({
          where: { taxPayer: { birthNumber } },
        }),
      ).toEqual([
        expect.objectContaining({
          year: YEAR,
          taxType: TaxType.DZN,
          status: TaxImportStatus.SUCCESS,
        }),
      ])

      expect(eventsOf(user, BloomreachEventNameEnum.TAX)).toEqual([
        {
          amount: fixture.totalInCents,
          year: YEAR,
          delivery_method: DeliveryMethodNamed.EDESK,
          tax_type: TaxType.DZN,
          order: 1,
          suppress_email: false,
        },
      ])
    })

    it('should create the communal waste tax with its containers by address', async () => {
      const containerStreet = 'Kontajnerová'
      const smallContainer: NorisContainerOptions = {
        type: 'N12',
        volume: 120,
        count: 1,
        pickups: 14,
        rate: 4.314,
        feeInCents: 6040,
        address: `${containerStreet},Bratislava,00000`,
        streetNumber: '1',
      }
      const largeContainer: NorisContainerOptions = {
        type: 'N24',
        volume: 240,
        count: 2,
        pickups: 26,
        rate: 6.9024,
        feeInCents: 35892,
        address: `${containerStreet},Bratislava,00000`,
        streetNumber: '2',
      }
      const fixture = await norisFixtureFactory.createCommunalWasteTax({
        year: YEAR,
        name: TAXPAYER_NAME,
        address: TAXPAYER_ADDRESS,
        administrator: NORIS_ADMINISTRATOR,
        containers: [smallContainer, largeContainer],
        skippedContainers: [NORIS_SKIPPED_CONTAINERS.KOD],
      })
      const user = addCityAccountUser(fixture)

      await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        {
          year: YEAR,
          taxType: TaxType.KO,
          birthNumbers: [addSlashToBirthNumber(fixture.birthNumber)],
        },
        { headers: adminHeaders },
      )

      const detail = await testingApp.axiosClient.get<
        Pick<ResponseCommunalWasteTaxSummaryDetailDto, 'itemizedDetail'>
      >('/v2/tax/get-tax-detail-by-year-and-type', {
        params: { year: YEAR, type: TaxType.KO, order: 1 },
        headers: user.headers,
      })
      expect(detail.data).toEqual({
        type: TaxType.KO,
        year: YEAR,
        order: 1,
        paidStatus: TaxStatusEnum.NOT_PAID,
        overallAmount: fixture.totalInCents,
        overallPaid: 0,
        overallBalance: fixture.totalInCents,
        oneTimePayment: {
          isPossible: true,
          type: OneTimePaymentTypeEnum.ONE_TIME_PAYMENT,
          amount: fixture.totalInCents,
          dueDate: firstDueDateOf(fixture),
          qrCode: expectAny<string>(String),
          variableSymbol: fixture.variableSymbol,
        },
        // NOW is after the last due date
        installmentPayment: {
          isPossible: false,
          reasonNotPossible:
            InstallmentPaymentReasonNotPossibleEnum.AFTER_DUE_DATE,
          dueDateLastPayment: lastDueDateOf(fixture),
        },
        taxAdministrator: expectObjectContaining(TAX_ADMINISTRATOR),
        taxPayer: { ...TAX_PAYER, externalId: fixture.taxpayerExternalId },
        // Noris returns the containers in no particular order, the skipped one is not returned
        itemizedDetail: {
          addressDetail: expectArrayContaining(
            [smallContainer, largeContainer].map((container) => ({
              address: {
                street: containerStreet,
                orientationNumber: container.streetNumber,
              },
              totalAmount: container.feeInCents,
              itemizedContainers: [
                {
                  containerVolume: container.volume,
                  containerCount: container.count,
                  numberOfDisposals: container.pickups,
                  unitRate: container.rate,
                  containerType: container.type,
                  fee: container.feeInCents,
                },
              ],
            })),
          ),
        },
      })
      expect(detail.data.itemizedDetail.addressDetail).toHaveLength(2)
      expect(eventsOf(user, BloomreachEventNameEnum.TAX)).toEqual([
        expect.objectContaining({
          amount: fixture.totalInCents,
          tax_type: TaxType.KO,
        }),
      ])
    })

    it('should create a cancelled communal waste tax with amount 0 in Bloomreach', async () => {
      const fixture = await norisFixtureFactory.createCommunalWasteTax({
        year: YEAR,
        administrator: NORIS_ADMINISTRATOR,
        state: 'S',
      })
      const user = addCityAccountUser(fixture)

      await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        {
          year: YEAR,
          taxType: TaxType.KO,
          birthNumbers: [addSlashToBirthNumber(fixture.birthNumber)],
        },
        { headers: adminHeaders },
      )

      const taxes = await testingApp.axiosClient.get('/v2/tax/taxes', {
        params: { type: TaxType.KO },
        headers: user.headers,
      })
      expect(taxes.data).toEqual({
        availabilityStatus: TaxAvailabilityStatus.AVAILABLE,
        taxAdministrator: expectObjectContaining(TAX_ADMINISTRATOR),
        // Without amountToBePaid
        items: [
          {
            createdAt: expectAny<string>(String),
            year: YEAR,
            type: TaxType.KO,
            order: 1,
            status: TaxStatusEnum.CANCELLED,
          },
        ],
      })
      expect(eventsOf(user, BloomreachEventNameEnum.TAX)).toEqual([
        expect.objectContaining({ amount: 0 }),
      ])
    })

    it('should import the payment of the created tax', async () => {
      const paidInCents = 3000
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        totalInCents: 9000,
        payment: { paidInCents, lastPaymentDate: today },
      })
      const user = addCityAccountUser(fixture)

      await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        {
          year: YEAR,
          taxType: TaxType.DZN,
          birthNumbers: [addSlashToBirthNumber(fixture.birthNumber)],
        },
        { headers: adminHeaders },
      )

      const detail = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.DZN, order: 1 },
          headers: user.headers,
        },
      )
      expect(detail.data).toEqual(
        expect.objectContaining({
          paidStatus: TaxStatusEnum.PARTIALLY_PAID,
          overallPaid: paidInCents,
          overallBalance: fixture.totalInCents - paidInCents,
        }),
      )
      expect(eventsOf(user, BloomreachEventNameEnum.TAX_PAYMENT)).toEqual([
        {
          amount: paidInCents,
          payment_source: 'BANK_ACCOUNT',
          year: YEAR,
          tax_type: TaxType.DZN,
          order: 1,
          suppress_email: false,
          is_fully_paid: false,
        },
      ])
    })

    it('should show the taxes of both years, with the administrator of the newer tax', async () => {
      const birthNumber = addSlashToBirthNumber(generateBirthNumber())
      const previousYearTax = await norisFixtureFactory.createRealEstateTax({
        year: YEAR - 1,
        birthNumber,
        totalInCents: 8000,
        administrator: {
          name: 'Ing. Bývalý Správca',
          phone: '02/0000 0001',
          email: 'byvaly.spravca@example.com',
        },
      })
      const currentYearTax = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        birthNumber,
        totalInCents: 9000,
        administrator: NORIS_ADMINISTRATOR,
      })
      const user = addCityAccountUser(previousYearTax)

      // The older tax is imported last, it must not take over the administrator
      for (const year of [YEAR, YEAR - 1]) {
        // eslint-disable-next-line no-await-in-loop -- the order of the imports is tested
        await testingApp.axiosClient.post(
          '/admin/create-data-from-noris',
          { year, taxType: TaxType.DZN, birthNumbers: [birthNumber] },
          { headers: adminHeaders },
        )
      }

      const taxes = await testingApp.axiosClient.get('/v2/tax/taxes', {
        params: { type: TaxType.DZN },
        headers: user.headers,
      })
      expect(taxes.data).toEqual({
        availabilityStatus: TaxAvailabilityStatus.AVAILABLE,
        taxAdministrator: expectObjectContaining(TAX_ADMINISTRATOR),
        items: [currentYearTax, previousYearTax].map((fixture) => ({
          createdAt: expectAny<string>(String),
          year: fixture.year,
          type: TaxType.DZN,
          order: 1,
          status: TaxStatusEnum.NOT_PAID,
          amountToBePaid: fixture.totalInCents,
        })),
      })
    })

    // The app takes only an administrator with phone and email (`mapNorisToTaxAdministratorData`)
    it.each<[string, NorisAdministrator | null]>([
      ['without administrator', null],
      [
        'with an administrator without email',
        { name: 'Ing. Nový Správca', phone: '02/0000 0002', email: null },
      ],
    ])(
      'should keep the administrator of the previous year for a new tax %s',
      async (_, currentYearAdministrator) => {
        const birthNumber = addSlashToBirthNumber(generateBirthNumber())
        const previousYearTax = await norisFixtureFactory.createRealEstateTax({
          year: YEAR - 1,
          birthNumber,
          totalInCents: 8000,
          administrator: NORIS_ADMINISTRATOR,
        })
        const currentYearTax = await norisFixtureFactory.createRealEstateTax({
          year: YEAR,
          birthNumber,
          totalInCents: 9000,
          administrator: currentYearAdministrator,
        })
        const user = addCityAccountUser(previousYearTax)
        await testingApp.axiosClient.post(
          '/admin/create-data-from-noris',
          { year: YEAR - 1, taxType: TaxType.DZN, birthNumbers: [birthNumber] },
          { headers: adminHeaders },
        )
        const taxesBefore = await testingApp.axiosClient.get('/v2/tax/taxes', {
          params: { type: TaxType.DZN },
          headers: user.headers,
        })
        expect(taxesBefore.data).toEqual(
          expect.objectContaining({
            taxAdministrator: expectObjectContaining(TAX_ADMINISTRATOR),
          }),
        )

        await testingApp.axiosClient.post(
          '/admin/create-data-from-noris',
          { year: YEAR, taxType: TaxType.DZN, birthNumbers: [birthNumber] },
          { headers: adminHeaders },
        )

        const taxes = await testingApp.axiosClient.get('/v2/tax/taxes', {
          params: { type: TaxType.DZN },
          headers: user.headers,
        })
        expect(taxes.data).toEqual({
          availabilityStatus: TaxAvailabilityStatus.AVAILABLE,
          taxAdministrator: expectObjectContaining(TAX_ADMINISTRATOR),
          items: [currentYearTax, previousYearTax].map((fixture) => ({
            createdAt: expectAny<string>(String),
            year: fixture.year,
            type: TaxType.DZN,
            order: 1,
            status: TaxStatusEnum.NOT_PAID,
            amountToBePaid: fixture.totalInCents,
          })),
        })
        // Also the detail of the new tax shows the administrator of the taxpayer
        const detail = await testingApp.axiosClient.get(
          '/v2/tax/get-tax-detail-by-year-and-type',
          {
            params: { year: YEAR, type: TaxType.DZN, order: 1 },
            headers: user.headers,
          },
        )
        expect(detail.data).toEqual(
          expect.objectContaining({
            overallAmount: currentYearTax.totalInCents,
            taxAdministrator: expectObjectContaining(TAX_ADMINISTRATOR),
          }),
        )
      },
    )

    it('should create two communal waste taxes of one year as orders 1 and 2', async () => {
      const birthNumber = addSlashToBirthNumber(generateBirthNumber())
      const fixtures = [
        await norisFixtureFactory.createCommunalWasteTax({
          year: YEAR,
          birthNumber,
          administrator: NORIS_ADMINISTRATOR,
          totalInCents: 6040,
        }),
        await norisFixtureFactory.createCommunalWasteTax({
          year: YEAR,
          birthNumber,
          administrator: NORIS_ADMINISTRATOR,
          totalInCents: 17946,
        }),
      ]
      const user = addCityAccountUser(fixtures[0])

      const response = await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        { year: YEAR, taxType: TaxType.KO, birthNumbers: [birthNumber] },
        { headers: adminHeaders },
      )

      expect(response.data).toEqual({
        birthNumbers: [birthNumber],
        foundInNoris: [birthNumber],
      })
      // Both taxes are imported in parallel, so either can get order 1
      const createdTaxes = await prismaService.tax.findMany({
        where: {
          variableSymbol: {
            in: fixtures.map((fixture) => fixture.variableSymbol),
          },
        },
        orderBy: { order: 'desc' },
        select: { variableSymbol: true, order: true },
      })
      expect(createdTaxes.map((tax) => tax.order)).toEqual([2, 1])
      const expectedItems = createdTaxes.map(({ variableSymbol, order }) => ({
        createdAt: expectAny<string>(String),
        year: YEAR,
        type: TaxType.KO,
        order,
        status: TaxStatusEnum.NOT_PAID,
        amountToBePaid: fixtures.find(
          (fixture) => fixture.variableSymbol === variableSymbol,
        )?.totalInCents,
      }))
      const taxes = await testingApp.axiosClient.get('/v2/tax/taxes', {
        params: { type: TaxType.KO },
        headers: user.headers,
      })
      expect(taxes.data).toEqual({
        availabilityStatus: TaxAvailabilityStatus.AVAILABLE,
        taxAdministrator: expectObjectContaining(TAX_ADMINISTRATOR),
        items: expectedItems,
      })
      for (const { order, amountToBePaid } of expectedItems) {
        // eslint-disable-next-line no-await-in-loop -- few requests
        const detail = await testingApp.axiosClient.get(
          '/v2/tax/get-tax-detail-by-year-and-type',
          {
            params: { year: YEAR, type: TaxType.KO, order },
            headers: user.headers,
          },
        )
        expect(detail.data).toEqual(
          expect.objectContaining({ order, overallAmount: amountToBePaid }),
        )
      }
      expect(eventsOf(user, BloomreachEventNameEnum.TAX)).toHaveLength(
        fixtures.length,
      )
    })

    it('should create one real estate tax from two documents of one year, the one with the lower id', async () => {
      const birthNumber = addSlashToBirthNumber(generateBirthNumber())
      const documents = [
        await norisFixtureFactory.createRealEstateTax({
          year: YEAR,
          birthNumber,
          administrator: NORIS_ADMINISTRATOR,
          totalInCents: 9000,
        }),
        await norisFixtureFactory.createRealEstateTax({
          year: YEAR,
          birthNumber,
          administrator: NORIS_ADMINISTRATOR,
          totalInCents: 12000,
        }),
      ]
      const [kept] = documents.toSorted((a, b) => a.documentId - b.documentId)
      const user = addCityAccountUser(kept)

      await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        { year: YEAR, taxType: TaxType.DZN, birthNumbers: [birthNumber] },
        { headers: adminHeaders },
      )

      const taxes = await testingApp.axiosClient.get('/v2/tax/taxes', {
        params: { type: TaxType.DZN },
        headers: user.headers,
      })
      expect(taxes.data).toEqual({
        availabilityStatus: TaxAvailabilityStatus.AVAILABLE,
        taxAdministrator: expectObjectContaining(TAX_ADMINISTRATOR),
        items: [
          {
            createdAt: expectAny<string>(String),
            year: YEAR,
            type: TaxType.DZN,
            order: 1,
            status: TaxStatusEnum.NOT_PAID,
            amountToBePaid: kept.totalInCents,
          },
        ],
      })
    })

    it('should create a tax not in force yet', async () => {
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        state: 'Z',
        validFrom: null,
      })
      const user = addCityAccountUser(fixture)

      await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        {
          year: YEAR,
          taxType: TaxType.DZN,
          birthNumbers: [addSlashToBirthNumber(fixture.birthNumber)],
        },
        { headers: adminHeaders },
      )

      const detail = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.DZN, order: 1 },
          headers: user.headers,
        },
      )
      expect(detail.data).toEqual(
        expect.objectContaining({
          paidStatus: TaxStatusEnum.NOT_PAID,
          overallAmount: fixture.totalInCents,
        }),
      )
      // Not returned by the API
      expect(
        await prismaService.tax.findUnique({
          where: { variableSymbol: fixture.variableSymbol },
        }),
      ).toEqual(expect.objectContaining({ dateTaxRuling: null }))
    })

    it('should create a tax without administrator and address', async () => {
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        name: TAXPAYER_NAME,
        administrator: null,
        address: null,
      })
      const user = addCityAccountUser(fixture)

      await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        {
          year: YEAR,
          taxType: TaxType.DZN,
          birthNumbers: [addSlashToBirthNumber(fixture.birthNumber)],
        },
        { headers: adminHeaders },
      )

      const detail = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.DZN, order: 1 },
          headers: user.headers,
        },
      )
      expect(detail.data).toEqual(
        expect.objectContaining({
          overallAmount: fixture.totalInCents,
          taxAdministrator: null,
          taxPayer: {
            name: `${TAXPAYER_NAME.meno} ${TAXPAYER_NAME.priezvisko}`,
            permanentResidenceStreet: null,
            permanentResidenceZip: null,
            permanentResidenceCity: null,
            externalId: fixture.taxpayerExternalId,
          },
        }),
      )
    })

    it('should import only the city account users of a batch', async () => {
      // A taxpayer with a tax in Noris and a city account user
      const importedTax = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
      })
      addCityAccountUser(importedTax)
      const importedBirthNumber = addSlashToBirthNumber(importedTax.birthNumber)

      // A taxpayer with a tax in Noris, without a city account user
      const taxWithoutUser = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
      })
      const birthNumberWithoutUser = addSlashToBirthNumber(
        taxWithoutUser.birthNumber,
      )

      // A city account user without a tax in Noris
      const birthNumberNotInNoris = generateBirthNumber()
      cityAccountMock.addUser(
        userFixtureFactory.createUser({ birthNumber: birthNumberNotInNoris }),
      )

      const response = await testingApp.axiosClient.post<{
        foundInNoris: string[]
      }>(
        '/admin/create-data-from-noris',
        {
          year: YEAR,
          taxType: TaxType.DZN,
          birthNumbers: [
            importedBirthNumber,
            birthNumberWithoutUser,
            addSlashToBirthNumber(birthNumberNotInNoris),
          ],
        },
        { headers: adminHeaders },
      )

      expect(response.data).toEqual({
        birthNumbers: [importedBirthNumber],
        // Noris returns them in no particular order
        foundInNoris: expectArrayContaining([
          importedBirthNumber,
          birthNumberWithoutUser,
        ]),
      })
      expect(response.data.foundInNoris).toHaveLength(2)
    })

    it('should not create the tax of a taxpayer without city account user', async () => {
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
      })
      const birthNumber = addSlashToBirthNumber(fixture.birthNumber)

      const response = await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        { year: YEAR, taxType: TaxType.DZN, birthNumbers: [birthNumber] },
        { headers: adminHeaders },
      )

      expect(response.data).toEqual({
        birthNumbers: [],
        foundInNoris: [birthNumber],
      })
      // Not returned by the API. Import attempts are recorded only for taxpayers in the database, and the import
      // creates a taxpayer only with a tax.
      expect(
        await prismaService.taxPayer.findUnique({ where: { birthNumber } }),
      ).toBeNull()
      expect(
        await prismaService.taxImportAttempt.findMany({
          where: { taxPayer: { birthNumber } },
        }),
      ).toEqual([])

      // The taxpayer registers only after the import
      const user = addCityAccountUser(fixture)
      const taxes = await testingApp.axiosClient.get('/v2/tax/taxes', {
        params: { type: TaxType.DZN },
        headers: user.headers,
      })
      expect(taxes.data).toEqual(NO_TAXES)
      expect(bloomreachMock.events).toEqual([])
    })

    it.each([
      { case: 'of another type', taxType: TaxType.KO, year: YEAR },
      { case: 'of another year', taxType: TaxType.DZN, year: YEAR - 1 },
    ])(
      'should not find the tax in Noris when the taxpayer has only a tax $case',
      async ({ taxType, year }) => {
        const fixture = await norisFixtureFactory.createRealEstateTax({
          year: YEAR,
        })
        const user = addCityAccountUser(fixture)

        const response = await testingApp.axiosClient.post(
          '/admin/create-data-from-noris',
          {
            year,
            taxType,
            birthNumbers: [addSlashToBirthNumber(fixture.birthNumber)],
          },
          { headers: adminHeaders },
        )

        expect(response.data).toEqual({ birthNumbers: [], foundInNoris: [] })
        const taxes = await testingApp.axiosClient.get('/v2/tax/taxes', {
          params: { type: taxType },
          headers: user.headers,
        })
        expect(taxes.data).toEqual(NO_TAXES)
      },
    )

    it('should not create the tax again', async () => {
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        administrator: NORIS_ADMINISTRATOR,
      })
      const user = addCityAccountUser(fixture)
      const birthNumber = addSlashToBirthNumber(fixture.birthNumber)
      const request = {
        year: YEAR,
        taxType: TaxType.DZN,
        birthNumbers: [birthNumber],
      }
      await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        request,
        { headers: adminHeaders },
      )

      const response = await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        request,
        { headers: adminHeaders },
      )

      expect(response.data).toEqual({
        birthNumbers: [],
        foundInNoris: [birthNumber],
      })
      const taxes = await testingApp.axiosClient.get('/v2/tax/taxes', {
        params: { type: TaxType.DZN },
        headers: user.headers,
      })
      expect(taxes.data).toEqual({
        availabilityStatus: TaxAvailabilityStatus.AVAILABLE,
        taxAdministrator: expectObjectContaining(TAX_ADMINISTRATOR),
        items: [
          {
            createdAt: expectAny<string>(String),
            year: YEAR,
            type: TaxType.DZN,
            order: 1,
            status: TaxStatusEnum.NOT_PAID,
            amountToBePaid: fixture.totalInCents,
          },
        ],
      })
      expect(eventsOf(user, BloomreachEventNameEnum.TAX)).toHaveLength(1)
    })

    it('should import at most TAX_IMPORT_BATCH_SIZE taxpayers in one request, the rest in the next one', async () => {
      const batchSize = 1
      const config = await prismaService.config.create({
        data: {
          key: 'TAX_IMPORT_BATCH_SIZE',
          value: batchSize.toString(),
          validSince: toDate(NOW.subtract({ hours: 1 })),
        },
      })
      onTestFinished(async () => {
        await prismaService.config.delete({ where: { id: config.id } })
      })
      const fixtures = [
        await norisFixtureFactory.createRealEstateTax({ year: YEAR }),
        await norisFixtureFactory.createRealEstateTax({ year: YEAR }),
      ]
      fixtures.forEach((fixture) => addCityAccountUser(fixture))
      const birthNumbers = fixtures.map((fixture) =>
        addSlashToBirthNumber(fixture.birthNumber),
      )
      const request = { year: YEAR, taxType: TaxType.DZN, birthNumbers }

      const firstResponse = await testingApp.axiosClient.post<{
        birthNumbers: string[]
      }>('/admin/create-data-from-noris', request, { headers: adminHeaders })
      const secondResponse = await testingApp.axiosClient.post<{
        birthNumbers: string[]
      }>('/admin/create-data-from-noris', request, { headers: adminHeaders })

      // Noris returns the taxpayers in no particular order, so either can be imported first
      expect(firstResponse.data.birthNumbers).toHaveLength(batchSize)
      expect(secondResponse.data.birthNumbers).toHaveLength(batchSize)
      const importedBirthNumbers = [
        ...firstResponse.data.birthNumbers,
        ...secondResponse.data.birthNumbers,
      ]
      expect(importedBirthNumbers).toEqual(expectArrayContaining(birthNumbers))
      expect(importedBirthNumbers).toHaveLength(birthNumbers.length)
    })

    it('should not create the tax of a known taxpayer whose city account user is gone', async () => {
      const birthNumber = addSlashToBirthNumber(generateBirthNumber())
      const previousYearTax = await norisFixtureFactory.createRealEstateTax({
        year: YEAR - 1,
        birthNumber,
      })
      const user = addCityAccountUser(previousYearTax)
      await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        { year: YEAR - 1, taxType: TaxType.DZN, birthNumbers: [birthNumber] },
        { headers: adminHeaders },
      )
      expect(
        await prismaService.taxPayer.findUnique({ where: { birthNumber } }),
      ).toEqual(expect.objectContaining({ cityAccountUserMissingSince: null }))
      await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        birthNumber,
      })
      cityAccountMock.removeUser(user)

      const response = await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        { year: YEAR, taxType: TaxType.DZN, birthNumbers: [birthNumber] },
        { headers: adminHeaders },
      )

      expect(response.data).toEqual({
        birthNumbers: [],
        foundInNoris: [birthNumber],
      })
      // Not returned by the API, the user cannot log in anymore. The attempt stays FAILED, so it is retried later.
      expect(
        await prismaService.taxPayer.findUnique({
          where: { birthNumber },
          include: {
            taxes: true,
            taxImportAttempts: { orderBy: { year: 'asc' } },
          },
        }),
      ).toEqual(
        expect.objectContaining({
          cityAccountUserMissingSince: expectAny(Date),
          taxes: [expectObjectContaining({ year: YEAR - 1 })],
          taxImportAttempts: [
            expectObjectContaining({
              year: YEAR - 1,
              status: TaxImportStatus.SUCCESS,
            }),
            expectObjectContaining({
              year: YEAR,
              status: TaxImportStatus.FAILED,
            }),
          ],
        }),
      )
    })

    it('should reject an invalid request', async () => {
      const response = await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        { year: YEAR, taxType: 'UNKNOWN', birthNumbers: [] },
        { headers: adminHeaders },
      )

      expect(response.status).toBe(HttpStatus.BAD_REQUEST)
    })

    it('should not create the tax when city account fails', async () => {
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
      })
      const user = addCityAccountUser(fixture)
      cityAccountMock.failEndpoint(
        CityAccountEndpoint.UserDataBatch,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )

      const response = await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        {
          year: YEAR,
          taxType: TaxType.DZN,
          birthNumbers: [addSlashToBirthNumber(fixture.birthNumber)],
        },
        { headers: adminHeaders },
      )

      expect(response.status).toBe(HttpStatus.BAD_GATEWAY)
      cityAccountMock.install()
      const taxes = await testingApp.axiosClient.get('/v2/tax/taxes', {
        params: { type: TaxType.DZN },
        headers: user.headers,
      })
      expect(taxes.data).toEqual(NO_TAXES)
    })

    it('should not create the tax when Bloomreach fails', async () => {
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
      })
      const user = addCityAccountUser(fixture)
      bloomreachMock.respondWith(HttpStatus.INTERNAL_SERVER_ERROR)

      const response = await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        {
          year: YEAR,
          taxType: TaxType.DZN,
          birthNumbers: [addSlashToBirthNumber(fixture.birthNumber)],
        },
        { headers: adminHeaders },
      )

      expect(response.data).toEqual(
        expect.objectContaining({ birthNumbers: [] }),
      )
      const taxes = await testingApp.axiosClient.get('/v2/tax/taxes', {
        params: { type: TaxType.DZN },
        headers: user.headers,
      })
      expect(taxes.data).toEqual(NO_TAXES)
    })
  })

  describe('POST /admin/update-data-from-noris', () => {
    // A real estate tax is matched by the taxpayer and year, so also its variable symbol can change
    it('should update the real estate tax with its installments, taxpayer, administrator and variable symbol', async () => {
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        name: TAXPAYER_NAME,
        address: TAXPAYER_ADDRESS,
        administrator: NORIS_ADMINISTRATOR,
        totalInCents: 9000,
      })
      const user = addCityAccountUser(fixture)
      const request = {
        year: YEAR,
        taxType: TaxType.DZN,
        birthNumbers: [addSlashToBirthNumber(fixture.birthNumber)],
      }
      await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        request,
        { headers: adminHeaders },
      )

      const updatedName: NorisPersonName = {
        meno: 'Jana',
        priezvisko: 'Nová',
      }
      const updatedAddress: NorisAddress = {
        street: 'Nová',
        buildingNumber: '1234',
        streetNumber: '5',
        zip: '00001',
        city: 'Bratislava',
      }
      const updatedAdministrator: NorisAdministrator = {
        name: 'Ing. Nový Správca',
        phone: '02/0000 0002',
        email: 'novy.spravca@example.com',
      }
      await norisFixtureFactory.clear()
      // New variable symbol, tax id and taxpayer external id are generated
      const updatedFixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        birthNumber: addSlashToBirthNumber(fixture.birthNumber),
        name: updatedName,
        address: updatedAddress,
        administrator: updatedAdministrator,
        totalInCents: 12000,
        installmentCount: 1,
      })

      // Creating again does not overwrite the existing tax
      const createResponse = await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        request,
        { headers: adminHeaders },
      )
      expect(createResponse.data).toEqual({
        birthNumbers: [],
        foundInNoris: request.birthNumbers,
      })
      const detailBefore = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.DZN, order: 1 },
          headers: user.headers,
        },
      )
      expect(detailBefore.data).toEqual(
        expect.objectContaining({
          overallAmount: fixture.totalInCents,
          oneTimePayment: expectObjectContaining({
            variableSymbol: fixture.variableSymbol,
          }),
          taxAdministrator: expectObjectContaining(TAX_ADMINISTRATOR),
          taxPayer: { ...TAX_PAYER, externalId: fixture.taxpayerExternalId },
        }),
      )

      const response = await testingApp.axiosClient.post(
        '/admin/update-data-from-noris',
        request,
        { headers: adminHeaders },
      )

      expect(response.data).toEqual({ updated: 1 })
      const detail = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.DZN, order: 1 },
          headers: user.headers,
        },
      )
      expect(detail.data).toEqual(
        expect.objectContaining({
          overallAmount: updatedFixture.totalInCents,
          oneTimePayment: expectObjectContaining({
            variableSymbol: updatedFixture.variableSymbol,
          }),
          taxAdministrator: expectObjectContaining(
            toApiTaxAdministrator(updatedAdministrator),
          ),
          taxPayer: {
            ...toApiTaxPayer(updatedName, updatedAddress),
            externalId: updatedFixture.taxpayerExternalId,
          },
          itemizedDetail: expectObjectContaining({
            apartmentTotalAmount: updatedFixture.totalInCents,
          }),
        }),
      )
      // Not returned by the API
      expect(
        await prismaService.tax.findMany({
          where: { taxPayer: { birthNumber: request.birthNumbers[0] } },
          include: { taxInstallments: { orderBy: { order: 'asc' } } },
        }),
      ).toEqual([
        expect.objectContaining({
          variableSymbol: updatedFixture.variableSymbol,
          taxId: updatedFixture.taxId,
          taxInstallments: updatedFixture.installments.map(
            ({ amountInCents, dueDate }) =>
              expectObjectContaining({
                amount: amountInCents,
                dueDate: toNorisDate(dueDate),
              }),
          ),
        }),
      ])
    })

    it('should track a communal waste tax cancelled in Noris with amount 0', async () => {
      const fixture = await norisFixtureFactory.createCommunalWasteTax({
        year: YEAR,
      })
      const user = addCityAccountUser(fixture)
      const request = {
        year: YEAR,
        taxType: TaxType.KO,
        birthNumbers: [addSlashToBirthNumber(fixture.birthNumber)],
      }
      await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        request,
        { headers: adminHeaders },
      )
      const detailBefore = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.KO, order: 1 },
          headers: user.headers,
        },
      )
      expect(detailBefore.data).toEqual(
        expect.objectContaining({ paidStatus: TaxStatusEnum.NOT_PAID }),
      )
      await norisFixtureFactory.clear()
      await norisFixtureFactory.createCommunalWasteTax({
        year: YEAR,
        birthNumber: addSlashToBirthNumber(fixture.birthNumber),
        variableSymbol: fixture.variableSymbol,
        state: 'S',
      })

      const response = await testingApp.axiosClient.post(
        '/admin/update-data-from-noris',
        request,
        { headers: adminHeaders },
      )

      expect(response.data).toEqual({ updated: 1 })
      const detail = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.KO, order: 1 },
          headers: user.headers,
        },
      )
      expect(detail.data).toEqual(
        expect.objectContaining({ paidStatus: TaxStatusEnum.CANCELLED }),
      )
      expect(eventsOf(user, BloomreachEventNameEnum.TAX)).toEqual([
        expect.objectContaining({ amount: fixture.totalInCents }),
        expect.objectContaining({ amount: 0 }),
      ])
    })

    it('should not update a real estate tax cancelled in Noris', async () => {
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        administrator: NORIS_ADMINISTRATOR,
        totalInCents: 9000,
      })
      const user = addCityAccountUser(fixture)
      const request = {
        year: YEAR,
        taxType: TaxType.DZN,
        birthNumbers: [addSlashToBirthNumber(fixture.birthNumber)],
      }
      await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        request,
        { headers: adminHeaders },
      )
      await norisFixtureFactory.clear()
      await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        birthNumber: request.birthNumbers[0],
        variableSymbol: fixture.variableSymbol,
        administrator: NORIS_ADMINISTRATOR,
        totalInCents: fixture.totalInCents,
        state: 'S',
      })

      const response = await testingApp.axiosClient.post(
        '/admin/update-data-from-noris',
        request,
        { headers: adminHeaders },
      )

      expect(response.data).toEqual({ updated: 0 })
      const taxes = await testingApp.axiosClient.get('/v2/tax/taxes', {
        params: { type: TaxType.DZN },
        headers: user.headers,
      })
      expect(taxes.data).toEqual({
        availabilityStatus: TaxAvailabilityStatus.AVAILABLE,
        taxAdministrator: expectObjectContaining(TAX_ADMINISTRATOR),
        items: [
          {
            createdAt: expectAny<string>(String),
            year: YEAR,
            type: TaxType.DZN,
            order: 1,
            status: TaxStatusEnum.NOT_PAID,
            amountToBePaid: fixture.totalInCents,
          },
        ],
      })
      // Only the event of the creation
      expect(eventsOf(user, BloomreachEventNameEnum.TAX)).toEqual([
        expect.objectContaining({ amount: fixture.totalInCents }),
      ])
    })

    it('should not create a real estate tax that is not imported yet', async () => {
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
      })
      const user = addCityAccountUser(fixture)

      const response = await testingApp.axiosClient.post(
        '/admin/update-data-from-noris',
        {
          year: YEAR,
          taxType: TaxType.DZN,
          birthNumbers: [addSlashToBirthNumber(fixture.birthNumber)],
        },
        { headers: adminHeaders },
      )

      expect(response.data).toEqual({ updated: 0 })
      const taxes = await testingApp.axiosClient.get('/v2/tax/taxes', {
        params: { type: TaxType.DZN },
        headers: user.headers,
      })
      expect(taxes.data).toEqual(NO_TAXES)
    })

    it('should create a communal waste tax added in Noris after the import', async () => {
      const birthNumber = addSlashToBirthNumber(generateBirthNumber())
      const importedTax = await norisFixtureFactory.createCommunalWasteTax({
        year: YEAR,
        birthNumber,
        administrator: NORIS_ADMINISTRATOR,
        totalInCents: 6040,
      })
      const user = addCityAccountUser(importedTax)
      const request = {
        year: YEAR,
        taxType: TaxType.KO,
        birthNumbers: [birthNumber],
      }
      await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        request,
        { headers: adminHeaders },
      )
      const addedTax = await norisFixtureFactory.createCommunalWasteTax({
        year: YEAR,
        birthNumber,
        administrator: NORIS_ADMINISTRATOR,
        totalInCents: 17946,
      })

      const response = await testingApp.axiosClient.post(
        '/admin/update-data-from-noris',
        request,
        { headers: adminHeaders },
      )

      // Only the imported tax counts as updated
      expect(response.data).toEqual({ updated: 1 })
      const taxes = await testingApp.axiosClient.get('/v2/tax/taxes', {
        params: { type: TaxType.KO },
        headers: user.headers,
      })
      expect(taxes.data).toEqual({
        availabilityStatus: TaxAvailabilityStatus.AVAILABLE,
        taxAdministrator: expectObjectContaining(TAX_ADMINISTRATOR),
        items: [
          { fixture: addedTax, order: 2 },
          { fixture: importedTax, order: 1 },
        ].map(({ fixture, order }) => ({
          createdAt: expectAny<string>(String),
          year: YEAR,
          type: TaxType.KO,
          order,
          status: TaxStatusEnum.NOT_PAID,
          amountToBePaid: fixture.totalInCents,
        })),
      })
      expect(eventsOf(user, BloomreachEventNameEnum.TAX)).toEqual([
        expect.objectContaining({ amount: importedTax.totalInCents, order: 1 }),
        expect.objectContaining({ amount: addedTax.totalInCents, order: 2 }),
      ])
    })
  })

  describe('POST /admin/payments-from-noris', () => {
    let fixture: NorisTaxFixture
    let user: FixtureUser

    beforeEach(async () => {
      fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        totalInCents: 9000,
      })
      user = addCityAccountUser(fixture)
      await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        {
          year: YEAR,
          taxType: TaxType.DZN,
          birthNumbers: [addSlashToBirthNumber(fixture.birthNumber)],
        },
        { headers: adminHeaders },
      )
    })

    it('should import each new payment as the difference to the imported ones', async () => {
      const partialPaymentInCents = 3000
      const request = {
        year: YEAR,
        fromDate: yesterday,
        toDate: tomorrow,
        overPayments: false,
      }
      const detailBefore = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.DZN, order: 1 },
          headers: user.headers,
        },
      )
      expect(detailBefore.data).toEqual(
        expect.objectContaining({
          paidStatus: TaxStatusEnum.NOT_PAID,
          overallPaid: 0,
        }),
      )

      await norisFixtureFactory.setPayment(fixture, {
        paidInCents: partialPaymentInCents,
        lastPaymentDate: today,
      })
      const firstResponse = await testingApp.axiosClient.post(
        '/admin/payments-from-noris',
        request,
        { headers: adminHeaders },
      )
      const detailAfterPartialPayment = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.DZN, order: 1 },
          headers: user.headers,
        },
      )
      await norisFixtureFactory.setPayment(fixture, {
        paidInCents: fixture.totalInCents,
        lastPaymentDate: today,
      })
      const secondResponse = await testingApp.axiosClient.post(
        '/admin/payments-from-noris',
        request,
        { headers: adminHeaders },
      )
      const repeatedResponse = await testingApp.axiosClient.post(
        '/admin/payments-from-noris',
        request,
        { headers: adminHeaders },
      )

      expect(firstResponse.data).toEqual({ created: 1, alreadyCreated: 0 })
      expect(detailAfterPartialPayment.data).toEqual(
        expect.objectContaining({
          paidStatus: TaxStatusEnum.PARTIALLY_PAID,
          overallPaid: partialPaymentInCents,
        }),
      )
      expect(secondResponse.data).toEqual({ created: 1, alreadyCreated: 0 })
      expect(repeatedResponse.data).toEqual({ created: 0, alreadyCreated: 1 })
      const detail = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.DZN, order: 1 },
          headers: user.headers,
        },
      )
      expect(detail.data).toEqual(
        expect.objectContaining({
          paidStatus: TaxStatusEnum.PAID,
          overallPaid: fixture.totalInCents,
          overallBalance: 0,
        }),
      )
      expect(eventsOf(user, BloomreachEventNameEnum.TAX_PAYMENT)).toEqual([
        expect.objectContaining({
          amount: partialPaymentInCents,
          is_fully_paid: false,
          suppress_email: false,
        }),
        expect.objectContaining({
          amount: fixture.totalInCents - partialPaymentInCents,
          is_fully_paid: true,
          suppress_email: false,
        }),
      ])
    })

    it('should not import a payment outside the date range', async () => {
      await norisFixtureFactory.setPayment(fixture, {
        paidInCents: fixture.totalInCents,
        lastPaymentDate: today.subtract({ days: 10 }),
      })

      const response = await testingApp.axiosClient.post(
        '/admin/payments-from-noris',
        {
          year: YEAR,
          fromDate: yesterday,
          toDate: tomorrow,
          overPayments: false,
        },
        { headers: adminHeaders },
      )

      expect(response.data).toEqual({ created: 0, alreadyCreated: 0 })
      const detail = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.DZN, order: 1 },
          headers: user.headers,
        },
      )
      expect(detail.data).toEqual(expect.objectContaining({ overallPaid: 0 }))
    })

    it('should not import a payment of a tax of another year', async () => {
      await norisFixtureFactory.setPayment(fixture, {
        paidInCents: fixture.totalInCents,
        lastPaymentDate: today,
      })

      const response = await testingApp.axiosClient.post(
        '/admin/payments-from-noris',
        {
          year: YEAR - 1,
          fromDate: yesterday,
          toDate: tomorrow,
          overPayments: false,
        },
        { headers: adminHeaders },
      )

      expect(response.data).toEqual({ created: 0, alreadyCreated: 0 })
    })

    it('should import a tax paid by applying an overpayment only with overPayments', async () => {
      await norisFixtureFactory.setPayment(fixture, {
        paidInCents: fixture.totalInCents,
        lastPaymentDate: null,
      })
      const request = { year: YEAR, fromDate: yesterday, toDate: tomorrow }

      const withoutOverPayments = await testingApp.axiosClient.post(
        '/admin/payments-from-noris',
        { ...request, overPayments: false },
        { headers: adminHeaders },
      )

      expect(withoutOverPayments.data).toEqual({
        created: 0,
        alreadyCreated: 0,
      })
      const detailBefore = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.DZN, order: 1 },
          headers: user.headers,
        },
      )
      expect(detailBefore.data).toEqual(
        expect.objectContaining({
          paidStatus: TaxStatusEnum.NOT_PAID,
          overallPaid: 0,
        }),
      )

      const withOverPayments = await testingApp.axiosClient.post(
        '/admin/payments-from-noris',
        { ...request, overPayments: true },
        { headers: adminHeaders },
      )

      expect(withOverPayments.data).toEqual({ created: 1, alreadyCreated: 0 })
      const detail = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.DZN, order: 1 },
          headers: user.headers,
        },
      )
      expect(detail.data).toEqual(
        expect.objectContaining({
          paidStatus: TaxStatusEnum.PAID,
          overallPaid: fixture.totalInCents,
        }),
      )
    })

    it('should suppress the email of a payment older than 180 days', async () => {
      const paidAt = today.subtract({ days: HISTORICAL_PAYMENT_AGE_DAYS + 1 })
      await norisFixtureFactory.setPayment(fixture, {
        paidInCents: fixture.totalInCents,
        lastPaymentDate: paidAt,
      })

      await testingApp.axiosClient.post(
        '/admin/payments-from-noris',
        {
          year: YEAR,
          fromDate: paidAt.toString(),
          toDate: paidAt.toString(),
          overPayments: false,
        },
        { headers: adminHeaders },
      )

      expect(eventsOf(user, BloomreachEventNameEnum.TAX_PAYMENT)).toEqual([
        expect.objectContaining({
          amount: fixture.totalInCents,
          suppress_email: true,
        }),
      ])
    })

    it('should import a payment of a communal waste tax', async () => {
      const paidInCents = 1510
      const communalWasteTax = await norisFixtureFactory.createCommunalWasteTax(
        { year: YEAR, totalInCents: 6040 },
      )
      const communalWasteUser = addCityAccountUser(communalWasteTax)
      await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        {
          year: YEAR,
          taxType: TaxType.KO,
          birthNumbers: [addSlashToBirthNumber(communalWasteTax.birthNumber)],
        },
        { headers: adminHeaders },
      )
      await norisFixtureFactory.setPayment(communalWasteTax, {
        paidInCents,
        lastPaymentDate: today,
      })

      const response = await testingApp.axiosClient.post(
        '/admin/payments-from-noris',
        {
          year: YEAR,
          fromDate: yesterday,
          toDate: tomorrow,
          overPayments: false,
        },
        { headers: adminHeaders },
      )

      expect(response.data).toEqual({ created: 1, alreadyCreated: 0 })
      const detail = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.KO, order: 1 },
          headers: communalWasteUser.headers,
        },
      )
      expect(detail.data).toEqual(
        expect.objectContaining({
          paidStatus: TaxStatusEnum.PARTIALLY_PAID,
          overallPaid: paidInCents,
          overallBalance: communalWasteTax.totalInCents - paidInCents,
        }),
      )
    })

    it('should not import a payment of a tax that is not imported', async () => {
      await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        totalInCents: 9000,
        payment: { paidInCents: 9000, lastPaymentDate: today },
      })

      const response = await testingApp.axiosClient.post(
        '/admin/payments-from-noris',
        {
          year: YEAR,
          fromDate: yesterday,
          toDate: tomorrow,
          overPayments: false,
        },
        { headers: adminHeaders },
      )

      expect(response.data).toEqual({ created: 0, alreadyCreated: 0 })
    })

    it('should keep the imported payments when the paid amount in Noris decreases', async () => {
      const refundInCents = 3000
      const request = {
        year: YEAR,
        fromDate: yesterday,
        toDate: tomorrow,
        overPayments: false,
      }
      await norisFixtureFactory.setPayment(fixture, {
        paidInCents: fixture.totalInCents,
        lastPaymentDate: today,
      })
      await testingApp.axiosClient.post('/admin/payments-from-noris', request, {
        headers: adminHeaders,
      })
      await norisFixtureFactory.setPayment(fixture, {
        paidInCents: fixture.totalInCents - refundInCents,
        lastPaymentDate: today,
      })

      const response = await testingApp.axiosClient.post(
        '/admin/payments-from-noris',
        request,
        { headers: adminHeaders },
      )

      expect(response.data).toEqual({ created: 0, alreadyCreated: 1 })
      const detail = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.DZN, order: 1 },
          headers: user.headers,
        },
      )
      expect(detail.data).toEqual(
        expect.objectContaining({
          paidStatus: TaxStatusEnum.PAID,
          overallPaid: fixture.totalInCents,
        }),
      )
    })

    it('should not import a payment when Bloomreach fails, and import it in the next run', async () => {
      const request = {
        year: YEAR,
        fromDate: yesterday,
        toDate: tomorrow,
        overPayments: false,
      }
      await norisFixtureFactory.setPayment(fixture, {
        paidInCents: fixture.totalInCents,
        lastPaymentDate: today,
      })
      bloomreachMock.respondWith(HttpStatus.INTERNAL_SERVER_ERROR)

      const failedResponse = await testingApp.axiosClient.post(
        '/admin/payments-from-noris',
        request,
        { headers: adminHeaders },
      )

      expect(failedResponse.data).toEqual({ created: 0, alreadyCreated: 0 })
      const detailAfterFailure = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.DZN, order: 1 },
          headers: user.headers,
        },
      )
      expect(detailAfterFailure.data).toEqual(
        expect.objectContaining({ overallPaid: 0 }),
      )

      bloomreachMock.install()
      const retriedResponse = await testingApp.axiosClient.post(
        '/admin/payments-from-noris',
        request,
        { headers: adminHeaders },
      )

      expect(retriedResponse.data).toEqual({ created: 1, alreadyCreated: 0 })
      const detail = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.DZN, order: 1 },
          headers: user.headers,
        },
      )
      expect(detail.data).toEqual(
        expect.objectContaining({ overallPaid: fixture.totalInCents }),
      )
    })

    it('should import a payment without the Bloomreach event when city account fails', async () => {
      await norisFixtureFactory.setPayment(fixture, {
        paidInCents: fixture.totalInCents,
        lastPaymentDate: today,
      })
      cityAccountMock.failEndpoint(
        CityAccountEndpoint.UserDataBatch,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )

      const response = await testingApp.axiosClient.post(
        '/admin/payments-from-noris',
        {
          year: YEAR,
          fromDate: yesterday,
          toDate: tomorrow,
          overPayments: false,
        },
        { headers: adminHeaders },
      )

      expect(response.data).toEqual({ created: 1, alreadyCreated: 0 })
      expect(eventsOf(user, BloomreachEventNameEnum.TAX_PAYMENT)).toEqual([])
      const detail = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.DZN, order: 1 },
          headers: user.headers,
        },
      )
      expect(detail.data).toEqual(
        expect.objectContaining({
          paidStatus: TaxStatusEnum.PAID,
          overallPaid: fixture.totalInCents,
        }),
      )
    })

    it('should import a payment without the Bloomreach event when the city account user is gone', async () => {
      await norisFixtureFactory.setPayment(fixture, {
        paidInCents: fixture.totalInCents,
        lastPaymentDate: today,
      })
      cityAccountMock.removeUser(user)

      const response = await testingApp.axiosClient.post(
        '/admin/payments-from-noris',
        {
          year: YEAR,
          fromDate: yesterday,
          toDate: tomorrow,
          overPayments: false,
        },
        { headers: adminHeaders },
      )

      expect(response.data).toEqual({ created: 1, alreadyCreated: 0 })
      expect(eventsOf(user, BloomreachEventNameEnum.TAX_PAYMENT)).toEqual([])
      // Not returned by the API, the user cannot log in anymore
      expect(
        await prismaService.taxPayment.findMany({
          where: { tax: { variableSymbol: fixture.variableSymbol } },
        }),
      ).toEqual([
        expectObjectContaining({
          amount: fixture.totalInCents,
          status: PaymentStatus.SUCCESS,
        }),
      ])
    })
  })

  describe('POST /admin/overpayments-from-noris', () => {
    let fixture: NorisTaxFixture
    let user: FixtureUser

    beforeEach(async () => {
      fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        totalInCents: 9000,
      })
      user = addCityAccountUser(fixture)
      await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        {
          year: YEAR,
          taxType: TaxType.DZN,
          birthNumbers: [addSlashToBirthNumber(fixture.birthNumber)],
        },
        { headers: adminHeaders },
      )
      await norisFixtureFactory.setPayment(fixture, {
        paidInCents: fixture.totalInCents,
        lastPaymentDate: today,
      })
    })

    it('should add the overpayment to the paid amount', async () => {
      const overpaymentInCents = 700
      await norisFixtureFactory.addOverpayment(fixture, {
        amountInCents: overpaymentInCents,
        date: today,
      })
      const detailBefore = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.DZN, order: 1 },
          headers: user.headers,
        },
      )
      expect(detailBefore.data).toEqual(
        expect.objectContaining({
          paidStatus: TaxStatusEnum.NOT_PAID,
          overallPaid: 0,
        }),
      )

      const response = await testingApp.axiosClient.post(
        '/admin/overpayments-from-noris',
        { fromDate: yesterday, toDate: tomorrow },
        { headers: adminHeaders },
      )

      expect(response.data).toEqual({ created: 1, alreadyCreated: 0 })
      const detail = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.DZN, order: 1 },
          headers: user.headers,
        },
      )
      expect(detail.data).toEqual(
        expect.objectContaining({
          paidStatus: TaxStatusEnum.OVER_PAID,
          overallPaid: fixture.totalInCents + overpaymentInCents,
        }),
      )
      expect(eventsOf(user, BloomreachEventNameEnum.TAX_PAYMENT)).toEqual([
        expect.objectContaining({
          amount: fixture.totalInCents + overpaymentInCents,
          is_fully_paid: true,
          suppress_email: true,
        }),
      ])
    })

    // NOTE: The logic will change, we will import only unspent overpayments - currently the logic is like this.
    it('should add an overpayment spent on another tax to the paid amount', async () => {
      // Paid twice, the second payment was spent on another tax
      await norisFixtureFactory.addOverpayment(fixture, {
        amountInCents: fixture.totalInCents,
        unappliedAmountInCents: 0,
        date: today,
      })

      await testingApp.axiosClient.post(
        '/admin/overpayments-from-noris',
        { fromDate: yesterday, toDate: tomorrow },
        { headers: adminHeaders },
      )

      const detail = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.DZN, order: 1 },
          headers: user.headers,
        },
      )
      expect(detail.data).toEqual(
        expect.objectContaining({ overallPaid: 2 * fixture.totalInCents }),
      )
    })

    it('should not import an overpayment outside the date range', async () => {
      await norisFixtureFactory.addOverpayment(fixture, {
        amountInCents: 700,
        date: today.subtract({ days: 10 }),
      })

      const response = await testingApp.axiosClient.post(
        '/admin/overpayments-from-noris',
        { fromDate: yesterday, toDate: tomorrow },
        { headers: adminHeaders },
      )

      expect(response.data).toEqual({ created: 0, alreadyCreated: 0 })
      const detail = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.DZN, order: 1 },
          headers: user.headers,
        },
      )
      expect(detail.data).toEqual(expect.objectContaining({ overallPaid: 0 }))
    })

    // NOTE: This is the same bug/logic change as before
    // Known bug: an overpayment applied to the tax it overpaid is counted twice, in the saldo of the tax and as the
    // overpayment. Remove `.fails` when it is fixed.
    it.fails(
      'should not count an overpayment applied to its own tax twice',
      async () => {
        // The paid total is partly by bank and partly the overpayment applied to this tax
        await norisFixtureFactory.addOverpayment(fixture, {
          amountInCents: 700,
          unappliedAmountInCents: 0,
          date: today,
        })

        await testingApp.axiosClient.post(
          '/admin/overpayments-from-noris',
          { fromDate: yesterday, toDate: tomorrow },
          { headers: adminHeaders },
        )

        const detail = await testingApp.axiosClient.get(
          '/v2/tax/get-tax-detail-by-year-and-type',
          {
            params: { year: YEAR, type: TaxType.DZN, order: 1 },
            headers: user.headers,
          },
        )
        expect(detail.data).toEqual(
          expect.objectContaining({ overallPaid: fixture.totalInCents }),
        )
      },
    )
  })

  describe('POST /admin/create-testing-tax', () => {
    const taxTotalInCents = 9000
    const alreadyPaidInCents = 3000

    function testingTaxRequest(birthNumber: string, variableSymbol: string) {
      return {
        year: YEAR,
        norisData: {
          variableSymbol,
          fakeBirthNumber: birthNumber,
          nameSurname: 'Testovací Daňovník',
          // The format of the admin form, in euros
          taxTotal: (taxTotalInCents / 100).toFixed(2),
          alreadyPaid: alreadyPaidInCents / 100,
          dateTaxRuling: null,
          isCancelled: false,
        },
      }
    }

    beforeEach(async () => {
      // The testing tax takes any administrator from the database
      await prismaService.taxAdministrator.create({
        data: {
          id: randomInt(1, 2_000_000_000),
          name: NORIS_ADMINISTRATOR.name,
          phoneNumber: NORIS_ADMINISTRATOR.phone,
          email: NORIS_ADMINISTRATOR.email,
        },
      })
    })

    // TODO
    // Known bug: the testing tax mock sets both `SPL1` and `SPL4_*`, which `mapNorisToTaxInstallmentsData` rejects, so no
    // tax is created (the endpoint still returns 200). Remove `.fails` when it is fixed.
    it.fails.each([TaxType.DZN, TaxType.KO])(
      'should create a %s testing tax for a city account user',
      async (taxType) => {
        const birthNumber = generateBirthNumber()
        const user = userFixtureFactory.createUser({ birthNumber })
        cityAccountMock.addUser(user)
        const request = testingTaxRequest(
          addSlashToBirthNumber(birthNumber),
          norisFixtureFactory.nextVariableSymbol(),
        )

        const response = await testingApp.axiosClient.post(
          '/admin/create-testing-tax',
          request,
          { params: { taxType }, headers: adminHeaders },
        )

        expect(response.status).toBe(HttpStatus.OK)
        const detail = await testingApp.axiosClient.get(
          '/v2/tax/get-tax-detail-by-year-and-type',
          {
            params: { year: YEAR, type: taxType, order: 1 },
            headers: user.headers,
          },
        )
        expect(detail.data).toEqual(
          expect.objectContaining({
            type: taxType,
            paidStatus: TaxStatusEnum.PARTIALLY_PAID,
            overallAmount: taxTotalInCents,
            overallPaid: alreadyPaidInCents,
            oneTimePayment: expectObjectContaining({
              variableSymbol: request.norisData.variableSymbol,
            }),
            taxPayer: expectObjectContaining({
              name: request.norisData.nameSurname,
            }),
          }),
        )
      },
    )

    it('should not create a testing tax with an existing variable symbol', async () => {
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
      })
      const user = addCityAccountUser(fixture)
      await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        {
          year: YEAR,
          taxType: TaxType.DZN,
          birthNumbers: [addSlashToBirthNumber(fixture.birthNumber)],
        },
        { headers: adminHeaders },
      )
      const otherBirthNumber = generateBirthNumber()
      cityAccountMock.addUser(
        userFixtureFactory.createUser({ birthNumber: otherBirthNumber }),
      )

      const response = await testingApp.axiosClient.post(
        '/admin/create-testing-tax',
        testingTaxRequest(
          addSlashToBirthNumber(otherBirthNumber),
          fixture.variableSymbol,
        ),
        { params: { taxType: TaxType.DZN }, headers: adminHeaders },
      )

      expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
      const detail = await testingApp.axiosClient.get(
        '/v2/tax/get-tax-detail-by-year-and-type',
        {
          params: { year: YEAR, type: TaxType.DZN, order: 1 },
          headers: user.headers,
        },
      )
      expect(detail.data).toEqual(
        expect.objectContaining({ overallAmount: fixture.totalInCents }),
      )
    })
  })

  describe('POST /admin/delete-tax', () => {
    it('should delete the tax and track it in Bloomreach with amount 0', async () => {
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
        administrator: NORIS_ADMINISTRATOR,
      })
      const user = addCityAccountUser(fixture)
      const birthNumber = addSlashToBirthNumber(fixture.birthNumber)
      await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        { year: YEAR, taxType: TaxType.DZN, birthNumbers: [birthNumber] },
        { headers: adminHeaders },
      )

      const response = await testingApp.axiosClient.post(
        '/admin/delete-tax',
        { year: YEAR, birthNumber, taxType: TaxType.DZN, order: 1 },
        { headers: adminHeaders },
      )

      expect(response.status).toBe(HttpStatus.OK)
      const taxes = await testingApp.axiosClient.get('/v2/tax/taxes', {
        params: { type: TaxType.DZN },
        headers: user.headers,
      })
      // The taxpayer and their administrator stay
      expect(taxes.data).toEqual({
        ...NO_TAXES,
        taxAdministrator: expectObjectContaining(TAX_ADMINISTRATOR),
      })
      expect(eventsOf(user, BloomreachEventNameEnum.TAX)).toEqual([
        expect.objectContaining({ amount: fixture.totalInCents }),
        {
          amount: 0,
          year: YEAR,
          delivery_method: null,
          tax_type: TaxType.DZN,
          order: 1,
          suppress_email: false,
        },
      ])
    })

    it('should fail for a taxpayer not in the database', async () => {
      const response = await testingApp.axiosClient.post(
        '/admin/delete-tax',
        {
          year: YEAR,
          birthNumber: addSlashToBirthNumber(generateBirthNumber()),
          taxType: TaxType.DZN,
          order: 1,
        },
        { headers: adminHeaders },
      )

      expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
    })

    it('should fail for a tax not in the database and keep the other taxes', async () => {
      const fixture = await norisFixtureFactory.createRealEstateTax({
        year: YEAR,
      })
      const user = addCityAccountUser(fixture)
      const birthNumber = addSlashToBirthNumber(fixture.birthNumber)
      await testingApp.axiosClient.post(
        '/admin/create-data-from-noris',
        { year: YEAR, taxType: TaxType.DZN, birthNumbers: [birthNumber] },
        { headers: adminHeaders },
      )

      const response = await testingApp.axiosClient.post(
        '/admin/delete-tax',
        { year: YEAR - 1, birthNumber, taxType: TaxType.DZN, order: 1 },
        { headers: adminHeaders },
      )

      expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR)
      const taxes = await testingApp.axiosClient.get<{
        items: { year: number }[]
      }>('/v2/tax/taxes', {
        params: { type: TaxType.DZN },
        headers: user.headers,
      })
      expect(taxes.data.items).toEqual([expectObjectContaining({ year: YEAR })])
    })
  })
})

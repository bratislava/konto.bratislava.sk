/* eslint-disable no-secrets/no-secrets */
import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { PaymentStatus, Prisma, TaxType } from '@prisma/client'

import prismaMock from '../../../test/singleton'
import { PaymentGateURLGeneratorDto } from '../../payment/dtos/generator.dto'
import { PaymentService } from '../../payment/payment.service'
import { PrismaService } from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { QrCodeSubservice } from '../../utils/subservices/qrcode.subservice'
import {
  CustomErrorTaxTypesEnum,
  CustomErrorTaxTypesResponseEnum,
} from '../dtos/error.dto'
import { TaxAvailabilityStatus, TaxStatusEnum } from '../dtos/response.tax.dto'
import { TaxService } from '../tax.service'
import * as unifiedTaxUtil from '../utils/unified-tax.util'

jest.mock('../utils/helpers/tax.helper', () => {
  const actual = jest.requireActual('../utils/helpers/tax.helper')
  return {
    ...actual,
    getTaxStatus: jest.fn(),
  }
})

jest.mock('../utils/unified-tax.util', () => ({
  getTaxDetailPure: jest.fn(),
  getTaxDetailPureForOneTimeGenerator: jest.fn(),
  getTaxDetailPureForInstallmentGenerator: jest.fn(),
}))

// Type definitions for the mock objects
type MockTaxPayer = Prisma.TaxPayerGetPayload<{
  include: { taxAdministrators: { include: { taxAdministrator: true } } }
}>

// Helper function to create base mock TaxPayer
const createMockTaxPayer = (
  overrides?: Partial<MockTaxPayer>,
): MockTaxPayer => {
  const baseDate = new Date('2023-01-01T10:00:00.000Z')

  return {
    id: 1,
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    createdAt: baseDate,
    updatedAt: baseDate,
    birthNumber: '123456/789',
    taxAdministrators: [
      {
        taxAdministrator: {
          id: 1,
          createdAt: baseDate,
          updatedAt: baseDate,
          externalId: 'ext-admin-1',
          name: 'Test Tax Administrator',
          phoneNumber: '+421123456789',
          email: 'admin@test.sk',
        },
        taxPayerId: 1,
        taxAdministratorId: 1,
        taxType: TaxType.DZN,
      },
    ],
    permanentResidenceAddress: 'Test Address 123',
    externalId: 'ext-taxpayer-1',
    name: 'John Doe',
    nameTxt: 'John Doe',
    permanentResidenceStreetTxt: 'Test Street 123',
    permanentResidenceStreet: 'Test Street',
    permanentResidenceZip: '12345',
    permanentResidenceCity: 'Test City',
    readyToImportDZN: false,
    readyToImportKO: false,
    lastUpdatedAtDZN: new Date('2025-01-01T10:00:00.000Z'),
    lastUpdatedAtKO: new Date('2025-01-01T10:00:00.000Z'),
    ...overrides,
  }
}

describe('TaxService', () => {
  let service: TaxService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxService,
        { provide: PrismaService, useValue: prismaMock },
        ThrowerErrorGuard,
        { provide: QrCodeSubservice, useValue: createMock<QrCodeSubservice>() },
        { provide: PaymentService, useValue: createMock<PaymentService>() },
      ],
    }).compile()

    service = module.get<TaxService>(TaxService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getListOfTaxesByBirthnumberAndType', () => {
    const DEFAULT_TEST_NOW = new Date('2025-01-01T12:00:00.000Z')

    beforeAll(async () => {
      jest.useFakeTimers()
    })

    beforeEach(async () => {
      jest.setSystemTime(DEFAULT_TEST_NOW)
    })

    afterAll(() => {
      jest.useRealTimers()
    })

    it('should throw ForbiddenException when birth number is empty', async () => {
      const forbiddenExceptionSpy = jest.spyOn(
        service['throwerErrorGuard'],
        'ForbiddenException',
      )

      await expect(
        service.getListOfTaxesByBirthnumberAndType('', TaxType.DZN),
      ).rejects.toThrow()

      expect(forbiddenExceptionSpy).toHaveBeenCalledWith(
        CustomErrorTaxTypesEnum.BIRTHNUMBER_NOT_EXISTS,
        CustomErrorTaxTypesResponseEnum.BIRTHNUMBER_NOT_EXISTS,
      )
    })

    it('should set taxPayerWasUpdated to false when TaxPayer does not exist', async () => {
      // Mock no taxpayer found
      prismaMock.taxPayer.findUnique.mockResolvedValue(null)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      expect(result.availabilityStatus).toBe('LOOKING_FOR_YOUR_TAX')
      expect(result.taxAdministrator).toBeNull()
    })

    it('should set taxPayerWasUpdated to false when TaxPayer has same createdAt and updatedAt', async () => {
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.000Z'), // Same as createdAt
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      expect(result.availabilityStatus).toBe('LOOKING_FOR_YOUR_TAX')
    })

    it('should set taxPayerWasUpdated to false when updatedAt is exactly 1 second after createdAt', async () => {
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:01.000Z'), // Exactly 1000ms later
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      expect(result.availabilityStatus).toBe('LOOKING_FOR_YOUR_TAX')
    })

    it('should set taxPayerWasUpdated to true when updatedAt is more than 1 second after createdAt', async () => {
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // 2000ms later
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      expect(result.availabilityStatus).toBe('TAX_NOT_ON_RECORD')
    })

    it('should set taxPayerWasUpdated to false when updatedAt is less than 1 second after createdAt', async () => {
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.500Z'), // 500ms later
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      expect(result.availabilityStatus).toBe('LOOKING_FOR_YOUR_TAX')
    })

    it('should set shouldAddCurrentYear to true when current date is within tax inclusion period', async () => {
      // Within period: between Feb 1 and Jul 1 (exclusive). Use March 1st.
      jest.setSystemTime(new Date('2025-03-01T12:00:00.000Z'))

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.000Z'), // not updated
      })
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      // With no taxes and shouldAddCurrentYear=true => LOOKING_FOR_YOUR_TAX
      expect(result.availabilityStatus).toBe('LOOKING_FOR_YOUR_TAX')
    })

    it('should set shouldAddCurrentYear to false when current date is outside tax inclusion period', async () => {
      jest.setSystemTime(new Date('2025-12-01T12:00:00.000Z'))

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // updated -> true
      })
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      expect(result.availabilityStatus).toBe('TAX_NOT_ON_RECORD')
    })

    // Empty Taxes Array Scenarios
    it('should return LOOKING_FOR_YOUR_TAX when no taxes exist and shouldAddCurrentYear is true and taxPayerWasUpdated is true', async () => {
      // Set within inclusion period
      jest.setSystemTime(new Date('2025-03-10T12:00:00.000Z'))
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // updated => true
      })
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )
      expect(result.availabilityStatus).toBe('LOOKING_FOR_YOUR_TAX')
    })

    it('should return LOOKING_FOR_YOUR_TAX when no taxes exist and shouldAddCurrentYear is false and taxPayerWasUpdated is false', async () => {
      // Outside inclusion period
      jest.setSystemTime(new Date('2025-12-10T12:00:00.000Z'))
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.500Z'), // not updated
      })
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )
      expect(result.availabilityStatus).toBe('LOOKING_FOR_YOUR_TAX')
    })

    it('should return TAX_NOT_ON_RECORD status when no taxes exist and shouldAddCurrentYear is false and taxPayerWasUpdated is true', async () => {
      // Outside inclusion period
      jest.setSystemTime(new Date('2025-12-10T12:00:00.000Z'))
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // updated
      })
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )
      expect(result.availabilityStatus).toBe('TAX_NOT_ON_RECORD')
    })

    it('should throw ForbiddenException when birth number is empty for KO tax type', async () => {
      const forbiddenExceptionSpy = jest.spyOn(
        service['throwerErrorGuard'],
        'ForbiddenException',
      )

      await expect(
        service.getListOfTaxesByBirthnumberAndType('', TaxType.KO),
      ).rejects.toThrow()

      expect(forbiddenExceptionSpy).toHaveBeenCalledWith(
        CustomErrorTaxTypesEnum.BIRTHNUMBER_NOT_EXISTS,
        CustomErrorTaxTypesResponseEnum.BIRTHNUMBER_NOT_EXISTS,
      )
    })

    it('should set taxPayerWasUpdated to false when TaxPayer does not exist for KO tax type', async () => {
      // Mock no taxpayer found
      prismaMock.taxPayer.findUnique.mockResolvedValue(null)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.KO,
      )

      expect(result.availabilityStatus).toBe(
        TaxAvailabilityStatus.LOOKING_FOR_YOUR_TAX,
      )
      expect(result.taxAdministrator).toBeNull()
    })

    it('should set taxPayerWasUpdated to false when TaxPayer has same createdAt and updatedAt for KO tax type', async () => {
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.000Z'), // Same as createdAt
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.KO,
      )

      expect(result.availabilityStatus).toBe(
        TaxAvailabilityStatus.LOOKING_FOR_YOUR_TAX,
      )
    })

    it('should set taxPayerWasUpdated to true when updatedAt is more than 1 second after createdAt for KO tax type', async () => {
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // 2000ms later
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.KO,
      )

      expect(result.availabilityStatus).toBe(
        TaxAvailabilityStatus.TAX_NOT_ON_RECORD,
      )
    })

    it('should set shouldAddCurrentYear to true when current date is within tax inclusion period for KO tax type', async () => {
      // Within period: between Feb 1 and Jul 1 (exclusive). Use March 1st.
      jest.setSystemTime(new Date('2025-03-01T12:00:00.000Z'))

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.000Z'), // not updated
      })
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.KO,
      )

      // With no taxes and shouldAddCurrentYear=true => LOOKING_FOR_YOUR_TAX
      expect(result.availabilityStatus).toBe(
        TaxAvailabilityStatus.LOOKING_FOR_YOUR_TAX,
      )
    })

    it('should set shouldAddCurrentYear to false when current date is outside tax inclusion period for KO tax type', async () => {
      jest.setSystemTime(new Date('2025-12-01T12:00:00.000Z'))

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // updated -> true
      })
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.KO,
      )

      expect(result.availabilityStatus).toBe(
        TaxAvailabilityStatus.TAX_NOT_ON_RECORD,
      )
    })

    it('should return LOOKING_FOR_YOUR_TAX when no KO taxes exist and shouldAddCurrentYear is true and taxPayerWasUpdated is true', async () => {
      // Set within inclusion period
      jest.setSystemTime(new Date('2025-03-10T12:00:00.000Z'))
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // updated => true
      })
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.KO,
      )
      expect(result.availabilityStatus).toBe(
        TaxAvailabilityStatus.LOOKING_FOR_YOUR_TAX,
      )
    })

    it('should return LOOKING_FOR_YOUR_TAX when no KO taxes exist and shouldAddCurrentYear is false and taxPayerWasUpdated is false', async () => {
      // Outside inclusion period
      jest.setSystemTime(new Date('2025-12-10T12:00:00.000Z'))
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.500Z'), // not updated
      })
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.KO,
      )
      expect(result.availabilityStatus).toBe(
        TaxAvailabilityStatus.LOOKING_FOR_YOUR_TAX,
      )
    })

    it('should return TAX_NOT_ON_RECORD status when no KO taxes exist and shouldAddCurrentYear is false and taxPayerWasUpdated is true', async () => {
      // Outside inclusion period
      jest.setSystemTime(new Date('2025-12-10T12:00:00.000Z'))
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // updated
      })
      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.KO,
      )
      expect(result.availabilityStatus).toBe(
        TaxAvailabilityStatus.TAX_NOT_ON_RECORD,
      )
    })

    it('should process existing taxes and return AVAILABLE status when taxes exist', async () => {
      // Set outside inclusion period to prevent current year tax addition
      jest.setSystemTime(new Date('2025-12-01T12:00:00.000Z'))

      const mockTaxes = [
        {
          id: 1,
          createdAt: new Date('2023-01-01T10:00:00.000Z'),
          amount: 1000,
          year: 2023,
          type: TaxType.DZN,
          order: 1,
        },
        {
          id: 2,
          createdAt: new Date('2022-01-01T10:00:00.000Z'),
          amount: 800,
          year: 2022,
          type: TaxType.DZN,
          order: 1,
        },
      ]

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // updated to prevent current year addition
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue(mockTaxes as any)

      // Mock getAmountAlreadyPaidByTaxId for each tax
      jest
        .spyOn(service as any, 'getAmountAlreadyPaidByTaxId')
        .mockResolvedValueOnce(200) // For tax id 1
        .mockResolvedValueOnce(0) // For tax id 2

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      expect(result.availabilityStatus).toBe(TaxAvailabilityStatus.AVAILABLE)
      expect(result.items).toHaveLength(2)
      expect(result.items[0]).toEqual({
        createdAt: mockTaxes[0].createdAt,
        year: 2023,
        amountToBePaid: 800, // 1000 - 200
        status: TaxStatusEnum.PARTIALLY_PAID,
        type: TaxType.DZN,
        order: 1,
      })
      expect(result.items[1]).toEqual({
        createdAt: mockTaxes[1].createdAt,
        year: 2022,
        amountToBePaid: 800, // 800 - 0
        status: TaxStatusEnum.NOT_PAID,
        type: TaxType.DZN,
        order: 1,
      })
      expect(result.taxAdministrator).toEqual(
        mockTaxPayer.taxAdministrators[0].taxAdministrator,
      )
    })

    it('should add current year tax when no current year tax exists and shouldAddCurrentYear is true', async () => {
      // Set within inclusion period (March)
      jest.setSystemTime(new Date('2025-03-01T12:00:00.000Z'))

      const mockTaxes = [
        {
          id: 1,
          createdAt: new Date('2023-01-01T10:00:00.000Z'),
          amount: 1000,
          year: 2023, // Not current year (2025)
          type: TaxType.DZN,
          order: 1,
          isCancelled: false,
        },
      ]

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.000Z'), // not updated
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue(mockTaxes as any)
      jest
        .spyOn(service as any, 'getAmountAlreadyPaidByTaxId')
        .mockResolvedValue(0)

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      expect(result.availabilityStatus).toBe(TaxAvailabilityStatus.AVAILABLE)
      expect(result.items).toHaveLength(2) // 1 existing + 1 current year
      expect(result.items[0]).toEqual({
        year: 2025,
        status: TaxStatusEnum.AWAITING_PROCESSING,
        type: TaxType.DZN,
        order: 1,
      })
      expect(result.items[1]).toEqual({
        createdAt: mockTaxes[0].createdAt,
        year: 2023,
        amountToBePaid: 1000,
        status: TaxStatusEnum.NOT_PAID,
        type: TaxType.DZN,
        order: 1,
      })
    })

    it('should return CANCELLED status when tax is cancelled', async () => {
      // Set outside inclusion period to prevent current year tax addition
      jest.setSystemTime(new Date('2025-12-01T12:00:00.000Z'))

      const mockTaxes = [
        {
          id: 1,
          createdAt: new Date('2023-01-01T10:00:00.000Z'),
          amount: 1000,
          year: 2023,
          type: TaxType.DZN,
          order: 1,
        },
        {
          id: 2,
          createdAt: new Date('2022-01-01T10:00:00.000Z'),
          amount: 800,
          year: 2022,
          type: TaxType.DZN,
          order: 1,
          isCancelled: true,
        },
      ]

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // updated to prevent current year addition
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue(mockTaxes as any)

      // Mock getAmountAlreadyPaidByTaxId for each tax
      jest
        .spyOn(service as any, 'getAmountAlreadyPaidByTaxId')
        .mockResolvedValueOnce(200) // For tax id 1
        .mockResolvedValueOnce(0) // For tax id 2

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      expect(result.availabilityStatus).toBe(TaxAvailabilityStatus.AVAILABLE)
      expect(result.items).toHaveLength(2)
      expect(result.items[0].status).toBe(TaxStatusEnum.PARTIALLY_PAID)
      expect(result.items[1].status).toBe(TaxStatusEnum.CANCELLED)
      expect(result.taxAdministrator).toEqual(
        mockTaxPayer.taxAdministrators[0].taxAdministrator,
      )
    })

    it('should not add current year tax when current year tax already exists', async () => {
      jest.setSystemTime(new Date('2025-03-01T12:00:00.000Z'))

      const mockTaxes = [
        {
          id: 1,
          createdAt: new Date('2025-01-01T10:00:00.000Z'),
          amount: 1000,
          year: 2025, // Current year already exists
          type: TaxType.DZN,
          order: 1,
          isCancelled: false,
        },
        {
          id: 2,
          createdAt: new Date('2023-01-01T10:00:00.000Z'),
          amount: 800,
          year: 2023,
          type: TaxType.DZN,
          order: 1,
          isCancelled: false,
        },
      ]

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.000Z'),
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue(mockTaxes as any)
      jest
        .spyOn(service as any, 'getAmountAlreadyPaidByTaxId')
        .mockResolvedValue(0)

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      expect(result.availabilityStatus).toBe(TaxAvailabilityStatus.AVAILABLE)
      expect(result.items).toHaveLength(2) // Only existing taxes, no current year added
      expect(result.items[0].year).toBe(2025)
      expect(result.items[1].year).toBe(2023)
    })

    it('should not add current year tax when outside inclusion period and taxPayerWasUpdated is true', async () => {
      // Outside inclusion period (December)
      jest.setSystemTime(new Date('2025-12-01T12:00:00.000Z'))

      const mockTaxes = [
        {
          id: 1,
          createdAt: new Date('2023-01-01T10:00:00.000Z'),
          amount: 1000,
          year: 2023,
          type: TaxType.DZN,
          order: 1,
        },
      ]

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // updated
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue(mockTaxes as any)
      jest
        .spyOn(service as any, 'getAmountAlreadyPaidByTaxId')
        .mockResolvedValue(0)

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      expect(result.availabilityStatus).toBe(TaxAvailabilityStatus.AVAILABLE)
      expect(result.items).toHaveLength(1) // Only existing tax, no current year added
      expect(result.items[0].year).toBe(2023)
    })

    it('should add current year tax when outside inclusion period but taxPayerWasUpdated is false', async () => {
      // Outside inclusion period (December)
      jest.setSystemTime(new Date('2025-12-01T12:00:00.000Z'))

      const mockTaxes = [
        {
          id: 1,
          createdAt: new Date('2023-01-01T10:00:00.000Z'),
          amount: 1000,
          year: 2023,
          type: TaxType.DZN,
          order: 1,
          isCancelled: false,
        },
      ]

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.500Z'), // not updated (less than 1 second)
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue(mockTaxes as any)
      jest
        .spyOn(service as any, 'getAmountAlreadyPaidByTaxId')
        .mockResolvedValue(0)

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.DZN,
      )

      expect(result.availabilityStatus).toBe(TaxAvailabilityStatus.AVAILABLE)
      expect(result.items).toHaveLength(2) // Existing tax + current year added
      expect(result.items[0]).toEqual({
        year: 2025, // Current year added first
        status: TaxStatusEnum.AWAITING_PROCESSING,
        type: TaxType.DZN,
        order: 1,
      })
      expect(result.items[1].year).toBe(2023)
    })

    it('should process KO taxes correctly when taxes exist', async () => {
      // Set outside inclusion period to prevent current year tax addition
      jest.setSystemTime(new Date('2025-12-01T12:00:00.000Z'))

      const mockKoTaxes = [
        {
          id: 1,
          createdAt: new Date('2023-01-01T10:00:00.000Z'),
          amount: 1500,
          year: 2023,
          type: TaxType.KO,
          order: 1,
        },
      ]

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // updated to prevent current year addition
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue(mockKoTaxes as any)
      jest
        .spyOn(service as any, 'getAmountAlreadyPaidByTaxId')
        .mockResolvedValue(500)

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.KO,
      )

      expect(result.availabilityStatus).toBe(TaxAvailabilityStatus.AVAILABLE)
      expect(result.items).toHaveLength(1)
      expect(result.items[0]).toEqual({
        createdAt: mockKoTaxes[0].createdAt,
        year: 2023,
        amountToBePaid: 1000, // 1500 - 500
        status: TaxStatusEnum.PARTIALLY_PAID,
        type: TaxType.KO,
        order: 1,
      })
      expect(result.taxAdministrator).toEqual(
        mockTaxPayer.taxAdministrators[0].taxAdministrator,
      )
    })

    it('should process multiple KO taxes for the same year with different orders', async () => {
      // Set outside inclusion period to prevent current year tax addition
      jest.setSystemTime(new Date('2025-12-01T12:00:00.000Z'))

      const mockKoTaxes = [
        {
          id: 1,
          createdAt: new Date('2023-01-01T10:00:00.000Z'),
          amount: 1500,
          year: 2023,
          type: TaxType.KO,
          order: 1,
        },
        {
          id: 2,
          createdAt: new Date('2023-02-01T10:00:00.000Z'),
          amount: 2000,
          year: 2023,
          type: TaxType.KO,
          order: 2,
        },
        {
          id: 3,
          createdAt: new Date('2023-03-01T10:00:00.000Z'),
          amount: 1000,
          year: 2023,
          type: TaxType.KO,
          order: 3,
        },
      ]

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // updated to prevent current year addition
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue(mockKoTaxes as any)

      // Mock different payment amounts for each tax
      jest
        .spyOn(service as any, 'getAmountAlreadyPaidByTaxId')
        .mockImplementation((...args: unknown[]) => {
          const taxId = args[0] as number
          switch (taxId) {
            case 1:
              return Promise.resolve(500)

            case 2:
              return Promise.resolve(2000)

            case 3:
              return Promise.resolve(0)

            default:
              return Promise.resolve(0)
          }
        })

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.KO,
      )

      expect(result.availabilityStatus).toBe(TaxAvailabilityStatus.AVAILABLE)
      expect(result.items).toHaveLength(3)

      // Check first tax (order 1) - partially paid
      expect(result.items[0]).toEqual({
        createdAt: mockKoTaxes[0].createdAt,
        year: 2023,
        amountToBePaid: 1000, // 1500 - 500
        status: TaxStatusEnum.PARTIALLY_PAID,
        type: TaxType.KO,
        order: 1,
      })

      // Check second tax (order 2) - fully paid
      expect(result.items[1]).toEqual({
        createdAt: mockKoTaxes[1].createdAt,
        year: 2023,
        amountToBePaid: 0, // 2000 - 2000
        status: TaxStatusEnum.PAID,
        type: TaxType.KO,
        order: 2,
      })

      // Check third tax (order 3) - not paid
      expect(result.items[2]).toEqual({
        createdAt: mockKoTaxes[2].createdAt,
        year: 2023,
        amountToBePaid: 1000, // 1000 - 0
        status: TaxStatusEnum.NOT_PAID,
        type: TaxType.KO,
        order: 3,
      })

      expect(result.taxAdministrator).toEqual(
        mockTaxPayer.taxAdministrators[0].taxAdministrator,
      )
    })

    it('should process multiple KO taxes across different years with different orders', async () => {
      // Set outside inclusion period to prevent current year tax addition
      jest.setSystemTime(new Date('2025-12-01T12:00:00.000Z'))

      const mockKoTaxes = [
        {
          id: 4,
          createdAt: new Date('2023-02-01T10:00:00.000Z'),
          amount: 2000,
          year: 2023,
          type: TaxType.KO,
          order: 2,
        },
        {
          id: 3,
          createdAt: new Date('2023-01-01T10:00:00.000Z'),
          amount: 1500,
          year: 2023,
          type: TaxType.KO,
          order: 1,
        },
        {
          id: 2,
          createdAt: new Date('2022-02-01T10:00:00.000Z'),
          amount: 800,
          year: 2022,
          type: TaxType.KO,
          order: 2,
        },
        {
          id: 1,
          createdAt: new Date('2022-01-01T10:00:00.000Z'),
          amount: 1200,
          year: 2022,
          type: TaxType.KO,
          order: 1,
        },
      ]

      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // updated to prevent current year addition
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue(mockKoTaxes as any)

      // Mock different payment amounts for each tax
      jest
        .spyOn(service as any, 'getAmountAlreadyPaidByTaxId')
        .mockImplementation((...args: unknown[]) => {
          const taxId = args[0] as number
          switch (taxId) {
            case 1:
              return Promise.resolve(1200)

            case 2:
              return Promise.resolve(400)

            case 3:
              return Promise.resolve(0)

            case 4:
              return Promise.resolve(2000)

            default:
              return Promise.resolve(0)
          }
        })

      const result = await service.getListOfTaxesByBirthnumberAndType(
        '123456/789',
        TaxType.KO,
      )

      expect(result.availabilityStatus).toBe(TaxAvailabilityStatus.AVAILABLE)
      expect(result.items).toHaveLength(4)

      expect(result.items[0]).toEqual({
        createdAt: mockKoTaxes[0].createdAt,
        year: 2023,
        amountToBePaid: 0, // 2000 - 2000
        status: TaxStatusEnum.PAID,
        type: TaxType.KO,
        order: 2,
      })

      expect(result.items[1]).toEqual({
        createdAt: mockKoTaxes[1].createdAt,
        year: 2023,
        amountToBePaid: 1500, // 1500 - 0
        status: TaxStatusEnum.NOT_PAID,
        type: TaxType.KO,
        order: 1,
      })

      expect(result.items[2]).toEqual({
        createdAt: mockKoTaxes[2].createdAt,
        year: 2022,
        amountToBePaid: 400, // 800 - 400
        status: TaxStatusEnum.PARTIALLY_PAID,
        type: TaxType.KO,
        order: 2,
      })

      expect(result.items[3]).toEqual({
        createdAt: mockKoTaxes[3].createdAt,
        year: 2022,
        amountToBePaid: 0, // 1200 - 1200
        status: TaxStatusEnum.PAID,
        type: TaxType.KO,
        order: 1,
      })

      expect(result.taxAdministrator).toEqual(
        mockTaxPayer.taxAdministrators[0].taxAdministrator,
      )
    })
  })

  describe('getTaxDetail', () => {
    it('should return tax detail from implementation', async () => {
      const baseDate = new Date('2023-01-01T10:00:00.000Z')
      jest.spyOn(service as any, 'fetchTaxData').mockResolvedValue({
        id: 1,
        amount: 1000,
        variableSymbol: 'VS123',
        dateTaxRuling: new Date('2023-01-01'),
        taxInstallments: [],
        taxPayments: [],
        taxDetails: { type: TaxType.DZN } as any,
        taxPayer: {
          name: 'Test User',
          permanentResidenceStreet: 'Test Street',
          permanentResidenceZip: '12345',
          permanentResidenceCity: 'Test City',
          externalId: 'ext-1',
          taxAdministrators: [
            {
              taxAdministrator: {
                id: 1,
                createdAt: baseDate,
                updatedAt: baseDate,
                externalId: 'ext-admin-1',
                name: 'Test Tax Administrator',
                phoneNumber: '+421123456789',
                email: 'admin@test.sk',
              },
              taxPayerId: 1,
              taxAdministratorId: 1,
              taxType: TaxType.DZN,
            },
          ],
        },
      })
      jest.spyOn(unifiedTaxUtil, 'getTaxDetailPure').mockReturnValue({
        overallPaid: 0,
        overallBalance: 1000,
        overallAmount: 1000,
        oneTimePayment: { qrCode: { data: 'test' } } as any,
        installmentPayment: { activeInstallment: null } as any,
        itemizedDetail: {} as any,
      })
      jest
        .spyOn(service['qrCodeSubservice'], 'createQrCode')
        .mockResolvedValue('qr-code-url')

      const result = await service.getTaxDetail(
        '123456/789',
        2023,
        TaxType.DZN,
        1,
      )

      expect(service['fetchTaxData']).toHaveBeenCalledWith(
        { birthNumber: '123456/789' },
        {
          taxInstallments: true,
          taxPayer: {
            include: {
              taxAdministrators: {
                where: {
                  taxType: TaxType.DZN,
                },
                include: {
                  taxAdministrator: true,
                },
              },
            },
          },
          taxPayments: true,
        },
        2023,
        TaxType.DZN,
        1,
      )
      expect(result.type).toBe('DZN')
      expect(result.year).toBe(2023)
      expect(result.order).toBe(1)
    })

    it('should return tax detail for KO type', async () => {
      const baseDate = new Date('2023-01-01T10:00:00.000Z')
      jest.spyOn(service as any, 'fetchTaxData').mockResolvedValue({
        id: 1,
        amount: 1500,
        variableSymbol: 'VS456',
        dateTaxRuling: new Date('2023-01-01'),
        taxInstallments: [],
        taxPayments: [],
        taxDetails: { type: TaxType.KO } as any,
        taxPayer: {
          name: 'Test User KO',
          permanentResidenceStreet: 'Test Street KO',
          permanentResidenceZip: '54321',
          permanentResidenceCity: 'Test City KO',
          externalId: 'ext-ko-1',
          taxAdministrators: [
            {
              taxAdministrator: {
                id: 2,
                createdAt: baseDate,
                updatedAt: baseDate,
                externalId: 'ext-admin-ko-1',
                name: 'Test KO Tax Administrator',
                phoneNumber: '+421987654321',
                email: 'admin-ko@test.sk',
              },
              taxPayerId: 1,
              taxAdministratorId: 2,
              taxType: TaxType.KO,
            },
          ],
        },
      })
      jest.spyOn(unifiedTaxUtil, 'getTaxDetailPure').mockReturnValue({
        overallPaid: 0,
        overallBalance: 1500,
        overallAmount: 1500,
        oneTimePayment: { qrCode: { data: 'test-ko' } } as any,
        installmentPayment: { activeInstallment: null } as any,
        itemizedDetail: {} as any,
      })
      jest
        .spyOn(service['qrCodeSubservice'], 'createQrCode')
        .mockResolvedValue('qr-code-url-ko')

      const result = await service.getTaxDetail(
        '987654/321',
        2023,
        TaxType.KO,
        1,
      )

      expect(service['fetchTaxData']).toHaveBeenCalledWith(
        { birthNumber: '987654/321' },
        {
          taxInstallments: true,
          taxPayer: {
            include: {
              taxAdministrators: {
                where: {
                  taxType: TaxType.KO,
                },
                include: {
                  taxAdministrator: true,
                },
              },
            },
          },
          taxPayments: true,
        },
        2023,
        TaxType.KO,
        1,
      )
      expect(result.type).toBe('KO')
      expect(result.year).toBe(2023)
      expect(result.order).toBe(1)
      expect(result.taxAdministrator).toEqual({
        id: 2,
        createdAt: baseDate,
        updatedAt: baseDate,
        externalId: 'ext-admin-ko-1',
        name: 'Test KO Tax Administrator',
        phoneNumber: '+421987654321',
        email: 'admin-ko@test.sk',
      })
    })

    it('should return tax detail for KO type with installments', async () => {
      const baseDate = new Date('2023-01-01T10:00:00.000Z')
      jest.spyOn(service as any, 'fetchTaxData').mockResolvedValue({
        id: 2,
        amount: 2000,
        variableSymbol: 'VS789',
        dateTaxRuling: new Date('2023-01-01'),
        taxInstallments: [
          {
            id: 1,
            installmentNumber: 1,
            amount: 1000,
            dueDate: new Date('2023-06-01'),
            text: 'First installment',
            order: 1,
          },
          {
            id: 2,
            installmentNumber: 2,
            amount: 1000,
            dueDate: new Date('2023-09-01'),
            text: 'Second installment',
            order: 2,
          },
        ],
        taxPayments: [],
        taxDetails: { type: TaxType.KO } as any,
        taxPayer: {
          name: 'Test User KO Installments',
          permanentResidenceStreet: 'Test Street',
          permanentResidenceZip: '12345',
          permanentResidenceCity: 'Test City',
          externalId: 'ext-ko-2',
          taxAdministrators: [
            {
              taxAdministrator: {
                id: 2,
                createdAt: baseDate,
                updatedAt: baseDate,
                externalId: 'ext-admin-ko-2',
                name: 'Test KO Tax Administrator',
                phoneNumber: '+421987654321',
                email: 'admin-ko@test.sk',
              },
              taxPayerId: 1,
              taxAdministratorId: 2,
              taxType: TaxType.KO,
            },
          ],
        },
      })
      jest.spyOn(unifiedTaxUtil, 'getTaxDetailPure').mockReturnValue({
        overallPaid: 0,
        overallBalance: 2000,
        overallAmount: 2000,
        oneTimePayment: { qrCode: { data: 'test-ko-installments' } } as any,
        installmentPayment: {
          activeInstallment: {
            remainingAmount: 1000,
            variableSymbol: 'VS789',
            qrCode: { data: 'active-installment-qr' },
          },
        } as any,
        itemizedDetail: {} as any,
      })
      jest
        .spyOn(service['qrCodeSubservice'], 'createQrCode')
        .mockResolvedValueOnce('qr-code-url-ko-one-time')
        .mockResolvedValueOnce('qr-code-url-ko-installment')

      const result = await service.getTaxDetail(
        '987654/321',
        2023,
        TaxType.KO,
        1,
      )

      expect(result.type).toBe('KO')
      expect(result.year).toBe(2023)
      expect(result.order).toBe(1)
      expect(result.oneTimePayment.qrCode).toBe('qr-code-url-ko-one-time')
      expect(result.installmentPayment.activeInstallment).toBeDefined()
      expect(result.installmentPayment.activeInstallment?.qrCode).toBe(
        'qr-code-url-ko-installment',
      )
    })

    it('should return tax detail for KO type with payments', async () => {
      const baseDate = new Date('2023-01-01T10:00:00.000Z')
      jest.spyOn(service as any, 'fetchTaxData').mockResolvedValue({
        id: 3,
        amount: 3000,
        variableSymbol: 'VS999',
        dateTaxRuling: new Date('2023-01-01'),
        taxInstallments: [],
        taxPayments: [
          {
            id: 1,
            amount: 1000,
            status: PaymentStatus.SUCCESS,
            createdAt: new Date('2023-05-01'),
          },
          {
            id: 2,
            amount: 500,
            status: PaymentStatus.SUCCESS,
            createdAt: new Date('2023-06-01'),
          },
        ],
        taxDetails: { type: TaxType.KO } as any,
        taxPayer: {
          name: 'Test User KO Payments',
          permanentResidenceStreet: 'Test Street',
          permanentResidenceZip: '12345',
          permanentResidenceCity: 'Test City',
          externalId: 'ext-ko-3',
          taxAdministrators: [
            {
              taxAdministrator: {
                id: 2,
                createdAt: baseDate,
                updatedAt: baseDate,
                externalId: 'ext-admin-ko-3',
                name: 'Test KO Tax Administrator',
                phoneNumber: '+421987654321',
                email: 'admin-ko@test.sk',
              },
              taxPayerId: 1,
              taxAdministratorId: 2,
              taxType: TaxType.KO,
            },
          ],
        },
      })
      jest.spyOn(unifiedTaxUtil, 'getTaxDetailPure').mockReturnValue({
        overallPaid: 1500,
        overallBalance: 1500,
        overallAmount: 3000,
        oneTimePayment: { qrCode: { data: 'test-ko-payments' } } as any,
        installmentPayment: { activeInstallment: null } as any,
        itemizedDetail: {} as any,
      })
      jest
        .spyOn(service['qrCodeSubservice'], 'createQrCode')
        .mockResolvedValue('qr-code-url-ko-payments')

      const result = await service.getTaxDetail(
        '987654/321',
        2023,
        TaxType.KO,
        1,
      )

      expect(result.type).toBe('KO')
      expect(result.year).toBe(2023)
      expect(result.order).toBe(1)
      expect(result.overallPaid).toBe(1500)
      expect(result.overallBalance).toBe(1500)
      expect(result.overallAmount).toBe(3000)
    })

    it('should return tax detail for KO type with order 2', async () => {
      const baseDate = new Date('2023-01-01T10:00:00.000Z')
      jest.spyOn(service as any, 'fetchTaxData').mockResolvedValue({
        id: 4,
        amount: 1200,
        variableSymbol: 'VS111',
        dateTaxRuling: new Date('2023-01-01'),
        taxInstallments: [],
        taxPayments: [],
        taxDetails: { type: TaxType.KO } as any,
        taxPayer: {
          name: 'Test User KO Order 2',
          permanentResidenceStreet: 'Test Street',
          permanentResidenceZip: '12345',
          permanentResidenceCity: 'Test City',
          externalId: 'ext-ko-4',
          taxAdministrators: [
            {
              taxAdministrator: {
                id: 2,
                createdAt: baseDate,
                updatedAt: baseDate,
                externalId: 'ext-admin-ko-4',
                name: 'Test KO Tax Administrator',
                phoneNumber: '+421987654321',
                email: 'admin-ko@test.sk',
              },
              taxPayerId: 1,
              taxAdministratorId: 2,
              taxType: TaxType.KO,
            },
          ],
        },
      })
      jest.spyOn(unifiedTaxUtil, 'getTaxDetailPure').mockReturnValue({
        overallPaid: 0,
        overallBalance: 1200,
        overallAmount: 1200,
        oneTimePayment: { qrCode: { data: 'test-ko-order2' } } as any,
        installmentPayment: { activeInstallment: null } as any,
        itemizedDetail: {} as any,
      })
      jest
        .spyOn(service['qrCodeSubservice'], 'createQrCode')
        .mockResolvedValue('qr-code-url-ko-order2')

      const result = await service.getTaxDetail(
        '987654/321',
        2023,
        TaxType.KO,
        2,
      )

      expect(service['fetchTaxData']).toHaveBeenCalledWith(
        { birthNumber: '987654/321' },
        {
          taxInstallments: true,
          taxPayer: {
            include: {
              taxAdministrators: {
                where: {
                  taxType: TaxType.KO,
                },
                include: {
                  taxAdministrator: true,
                },
              },
            },
          },
          taxPayments: true,
        },
        2023,
        TaxType.KO,
        2,
      )
      expect(result.type).toBe('KO')
      expect(result.year).toBe(2023)
      expect(result.order).toBe(2)
    })
  })

  describe('getOneTimePaymentGenerator', () => {
    const mockTaxPayerWhereUniqueInput = { birthNumber: '123456/789' }
    const mockOneTimeTaxData = {
      id: 1,
      amount: 1000,
      taxPayments: [
        { amount: 200, status: PaymentStatus.SUCCESS },
        { amount: 100, status: PaymentStatus.NEW },
      ],
    }

    const mockPaymentGeneratorDto = {
      taxId: 1,
      description: 'Test payment',
      amount: 800,
    } as PaymentGateURLGeneratorDto

    it('should return one-time payment generator for valid tax type', async () => {
      jest
        .spyOn(service as any, 'fetchTaxData')
        .mockResolvedValue(mockOneTimeTaxData)
      jest
        .spyOn(unifiedTaxUtil, 'getTaxDetailPureForOneTimeGenerator')
        .mockReturnValue(mockPaymentGeneratorDto)

      const result = await service.getOneTimePaymentGenerator(
        mockTaxPayerWhereUniqueInput,
        2023,
        TaxType.DZN,
        1,
      )

      expect(service['fetchTaxData']).toHaveBeenCalledWith(
        mockTaxPayerWhereUniqueInput,
        { taxPayments: true },
        2023,
        TaxType.DZN,
        1,
      )
      expect(
        unifiedTaxUtil.getTaxDetailPureForOneTimeGenerator,
      ).toHaveBeenCalledWith({
        taxId: 1,
        overallAmount: 1000,
        taxPayments: mockOneTimeTaxData.taxPayments,
      })
      expect(result).toEqual(mockPaymentGeneratorDto)
    })
  })

  describe('getInstallmentPaymentGenerator', () => {
    const mockTaxPayerWhereUniqueInput = { birthNumber: '123456/789' }
    const mockInstallmentTaxData = {
      id: 1,
      amount: 1000,
      variableSymbol: 'VS123',
      dateTaxRuling: new Date('2023-01-01'),
      taxInstallments: [
        { order: 1, amount: 500 },
        { order: 2, amount: 500 },
      ],
      taxPayments: [{ amount: 200, status: PaymentStatus.SUCCESS }],
    }

    const mockPaymentGeneratorDto = {
      taxId: 1,
      description: 'Test installment payment',
      amount: 800,
    } as PaymentGateURLGeneratorDto

    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2023-06-01T12:00:00.000Z'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should return installment payment generator for valid tax type', async () => {
      jest
        .spyOn(service as any, 'fetchTaxData')
        .mockResolvedValue(mockInstallmentTaxData)
      jest
        .spyOn(unifiedTaxUtil, 'getTaxDetailPureForInstallmentGenerator')
        .mockReturnValue(mockPaymentGeneratorDto)

      // Note: getTaxDefinitionByType is not mocked, so it will use the real implementation

      const result = await service.getInstallmentPaymentGenerator(
        mockTaxPayerWhereUniqueInput,
        2023,
        TaxType.DZN,
        1,
      )

      expect(service['fetchTaxData']).toHaveBeenCalledWith(
        mockTaxPayerWhereUniqueInput,
        { taxInstallments: true, taxPayments: true },
        2023,
        TaxType.DZN,
        1,
      )
      expect(
        unifiedTaxUtil.getTaxDetailPureForInstallmentGenerator,
      ).toHaveBeenCalledWith({
        taxType: TaxType.DZN,
        taxId: 1,
        taxYear: 2023,
        today: expect.any(Date),
        overallAmount: 1000,
        variableSymbol: 'VS123',
        dateOfValidity: new Date('2023-01-01'),
        installments: mockInstallmentTaxData.taxInstallments,
        taxPayments: mockInstallmentTaxData.taxPayments,
      })
      expect(result).toEqual(mockPaymentGeneratorDto)
    })

    it('should use current date for today parameter', async () => {
      const fixedDate = new Date('2023-06-15T14:30:00.000Z')
      jest.setSystemTime(fixedDate)

      jest
        .spyOn(service as any, 'fetchTaxData')
        .mockResolvedValue(mockInstallmentTaxData)
      jest
        .spyOn(unifiedTaxUtil, 'getTaxDetailPureForInstallmentGenerator')
        .mockReturnValue(mockPaymentGeneratorDto)

      await service.getInstallmentPaymentGenerator(
        mockTaxPayerWhereUniqueInput,
        2023,
        TaxType.DZN,
        1,
      )

      expect(
        unifiedTaxUtil.getTaxDetailPureForInstallmentGenerator,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          today: expect.any(Date),
        }),
      )
    })
  })

  describe('private methods', () => {
    describe('fetchTaxData', () => {
      const mockTaxData = {
        id: 1,
        uuid: 'tax-uuid',
        year: 2023,
        amount: 1000,
        variableSymbol: 'VS123',
        dateTaxRuling: new Date('2023-01-01'),
        taxInstallments: [
          {
            id: 1,
            installmentNumber: 1,
            amount: 500,
            dueDate: new Date('2023-06-01'),
            text: 'First installment',
            order: 1,
          },
          {
            id: 2,
            installmentNumber: 2,
            amount: 500,
            dueDate: new Date('2023-09-01'),
            text: 'Second installment',
            order: 2,
          },
        ],
        taxPayer: {
          id: 1,
          birthNumber: '123456/789',
          taxAdministrator: {
            id: 1,
            name: 'Test Administrator',
            email: 'admin@test.sk',
          },
        },
        taxDetails: {
          type: TaxType.DZN,
        },
        taxPayments: [
          {
            id: 1,
            amount: 200,
            status: PaymentStatus.SUCCESS,
            createdAt: new Date('2023-05-01'),
          },
        ],
      }

      it('should fetch tax data successfully', async () => {
        prismaMock.taxPayer.findUnique.mockResolvedValue({
          id: 1,
        } as any)
        prismaMock.tax.findUnique.mockResolvedValue(mockTaxData as any)

        const result = await service['fetchTaxData'](
          { birthNumber: '123456/789' },
          { taxInstallments: true },
          2023,
          TaxType.DZN,
          1,
        )

        expect(prismaMock.taxPayer.findUnique).toHaveBeenCalledWith({
          where: { birthNumber: '123456/789' },
          select: { id: true },
        })
        expect(prismaMock.tax.findUnique).toHaveBeenCalledWith({
          where: {
            taxPayerId_year_type_order: {
              year: 2023,
              taxPayerId: 1,
              type: TaxType.DZN,
              order: 1,
            },
          },
          include: {
            taxInstallments: true,
          },
        })
        expect(result).toEqual(mockTaxData)
      })

      it('should throw error when tax payer not found', async () => {
        prismaMock.taxPayer.findUnique.mockResolvedValue(null)
        const notFoundExceptionSpy = jest.spyOn(
          service['throwerErrorGuard'],
          'NotFoundException',
        )

        await expect(
          service['fetchTaxData'](
            { birthNumber: '123456/789' },
            {},
            2023,
            TaxType.DZN,
            1,
          ),
        ).rejects.toThrow()

        expect(notFoundExceptionSpy).toHaveBeenCalledWith(
          CustomErrorTaxTypesEnum.TAX_USER_NOT_FOUND,
          CustomErrorTaxTypesResponseEnum.TAX_USER_NOT_FOUND,
        )
      })

      it('should throw error when tax not found', async () => {
        prismaMock.taxPayer.findUnique.mockResolvedValue({
          id: 1,
        } as any)
        prismaMock.tax.findUnique.mockResolvedValue(null)
        const notFoundExceptionSpy = jest.spyOn(
          service['throwerErrorGuard'],
          'NotFoundException',
        )

        await expect(
          service['fetchTaxData'](
            { birthNumber: '123456/789' },
            {},
            2023,
            TaxType.DZN,
            1,
          ),
        ).rejects.toThrow()

        expect(notFoundExceptionSpy).toHaveBeenCalledWith(
          CustomErrorTaxTypesEnum.TAX_YEAR_OR_USER_NOT_FOUND,
          CustomErrorTaxTypesResponseEnum.TAX_YEAR_OR_USER_NOT_FOUND,
        )
      })

      it('should work with uuid as tax payer identifier', async () => {
        prismaMock.taxPayer.findUnique.mockResolvedValue({
          id: 1,
        } as any)
        prismaMock.tax.findUnique.mockResolvedValue(mockTaxData as any)

        const result = await service['fetchTaxData'](
          { uuid: 'taxpayer-uuid' },
          { taxPayments: true },
          2023,
          TaxType.KO,
          1,
        )

        expect(prismaMock.taxPayer.findUnique).toHaveBeenCalledWith({
          where: { uuid: 'taxpayer-uuid' },
          select: { id: true },
        })
        expect(prismaMock.tax.findUnique).toHaveBeenCalledWith({
          where: {
            taxPayerId_year_type_order: {
              year: 2023,
              taxPayerId: 1,
              type: TaxType.KO,
              order: 1,
            },
          },
          include: {
            taxPayments: true,
          },
        })
        expect(result).toEqual(mockTaxData)
      })
    })

    describe('getAmountAlreadyPaidByTaxId', () => {
      it('should return total paid amount', async () => {
        prismaMock.taxPayment.aggregate.mockResolvedValue({
          _sum: { amount: 500 },
        } as Prisma.GetTaxPaymentAggregateType<{ _sum: { amount: true } }>)

        const result = await service['getAmountAlreadyPaidByTaxId'](1)

        expect(prismaMock.taxPayment.aggregate).toHaveBeenCalledWith({
          where: {
            taxId: 1,
            status: PaymentStatus.SUCCESS,
          },
          _sum: { amount: true },
        })
        expect(result).toBe(500)
      })

      it('should return 0 when no payments found', async () => {
        prismaMock.taxPayment.aggregate.mockResolvedValue({
          _sum: { amount: null },
        } as Prisma.GetTaxPaymentAggregateType<{ _sum: { amount: true } }>)

        const result = await service['getAmountAlreadyPaidByTaxId'](1)

        expect(result).toBe(0)
      })
    })
  })
})

/* eslint-enable no-secrets/no-secrets */

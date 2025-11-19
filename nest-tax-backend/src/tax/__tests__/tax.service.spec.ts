/* eslint-disable no-secrets/no-secrets */
import { createMock } from '@golevelup/ts-jest'
import { HttpException, HttpStatus } from '@nestjs/common'
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
import {
  ResponseRealEstateTaxSummaryDetailDto,
  TaxAvailabilityStatus,
  TaxPaidStatusEnum,
  TaxStatusEnum,
} from '../dtos/response.tax.dto'
import { TaxRealEstateSubservice } from '../subservices/tax/tax.real-estate.subservice'
import { TaxService } from '../tax.service'

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
  include: { taxAdministrator: true }
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
    taxAdministratorId: 1,
    taxAdministrator: {
      id: 1,
      createdAt: baseDate,
      updatedAt: baseDate,
      externalId: 'ext-admin-1',
      name: 'Test Tax Administrator',
      phoneNumber: '+421123456789',
      email: 'admin@test.sk',
    },
    permanentResidenceAddress: 'Test Address 123',
    externalId: 'ext-taxpayer-1',
    name: 'John Doe',
    nameTxt: 'John Doe',
    permanentResidenceStreetTxt: 'Test Street 123',
    permanentResidenceStreet: 'Test Street',
    permanentResidenceZip: '12345',
    permanentResidenceCity: 'Test City',
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
        TaxRealEstateSubservice,
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
      expect(result.taxAdministrator).toEqual(mockTaxPayer.taxAdministrator)
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
        },
        {
          id: 2,
          createdAt: new Date('2023-01-01T10:00:00.000Z'),
          amount: 800,
          year: 2023,
          type: TaxType.DZN,
          order: 1,
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
      expect(result.taxAdministrator).toEqual(mockTaxPayer.taxAdministrator)
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

      expect(result.taxAdministrator).toEqual(mockTaxPayer.taxAdministrator)
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

      expect(result.taxAdministrator).toEqual(mockTaxPayer.taxAdministrator)
    })
  })

  describe('getTaxDetail', () => {
    it('should return tax detail from implementation', async () => {
      const mockTaxDetail = {
        paidStatus: TaxPaidStatusEnum.PAID,
        year: 2023,
        overallPaid: 1000,
        overallBalance: 0,
        overallAmount: 1000,
        itemizedDetail: {} as any,
        oneTimePayment: {} as any,
        installmentPayment: {} as any,
        taxAdministrator: null,
        taxPayer: {} as any,
      } as ResponseRealEstateTaxSummaryDetailDto

      const mockImplementation = {
        getTaxDetail: jest.fn().mockResolvedValue(mockTaxDetail),
      }

      jest
        .spyOn(service as any, 'getImplementationByType')
        .mockReturnValue(mockImplementation)

      const result = await service.getTaxDetail(
        '123456/789',
        2023,
        TaxType.DZN,
        1,
      )

      expect(mockImplementation.getTaxDetail).toHaveBeenCalledWith(
        '123456/789',
        2023,
        1,
      )
      expect(result).toEqual(mockTaxDetail)
    })

    it('should throw error for unsupported tax type', async () => {
      const thrownError = new HttpException(
        'Implementation for tax type UNKNOWN_TYPE not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
      jest
        .spyOn(service['throwerErrorGuard'], 'InternalServerErrorException')
        .mockReturnValue(thrownError)

      await expect(
        service.getTaxDetail('123456/789', 2023, 'UNKNOWN_TYPE' as TaxType, 1),
      ).rejects.toThrow(thrownError)
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
      const mockImplementation = {
        fetchTaxData: jest.fn().mockResolvedValue(mockOneTimeTaxData),
      }

      jest
        .spyOn(service as any, 'getImplementationByType')
        .mockReturnValue(mockImplementation)
      jest
        .spyOn(unifiedTaxUtil, 'getTaxDetailPureForOneTimeGenerator')
        .mockReturnValue(mockPaymentGeneratorDto)

      const result = await service.getOneTimePaymentGenerator(
        mockTaxPayerWhereUniqueInput,
        2023,
        TaxType.DZN,
        1,
      )

      expect(mockImplementation.fetchTaxData).toHaveBeenCalledWith(
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

    it('should throw error for unsupported tax type', async () => {
      const thrownError = new HttpException(
        'Implementation for tax type KO not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
      jest
        .spyOn(service['throwerErrorGuard'], 'InternalServerErrorException')
        .mockReturnValue(thrownError)

      await expect(
        service.getOneTimePaymentGenerator(
          mockTaxPayerWhereUniqueInput,
          2023,
          TaxType.KO,
          1,
        ),
      ).rejects.toThrow(thrownError)
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

    const expectedTaxDefinition = getTaxDefinitionByType(TaxType.DZN)

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
      const mockImplementation = {
        fetchTaxData: jest.fn().mockResolvedValue(mockInstallmentTaxData),
      }

      jest
        .spyOn(service as any, 'getImplementationByType')
        .mockReturnValue(mockImplementation)
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

      expect(mockImplementation.fetchTaxData).toHaveBeenCalledWith(
        mockTaxPayerWhereUniqueInput,
        { taxInstallments: true, taxPayments: true },
        2023,
        TaxType.DZN,
        1,
      )
      expect(
        unifiedTaxUtil.getTaxDetailPureForInstallmentGenerator,
      ).toHaveBeenCalledWith({
        taxId: 1,
        taxDefinition: expectedTaxDefinition,
        taxYear: 2023,
        today: expect.any(Date),
        overallAmount: 1000,
        variableSymbol: 'VS123',
        dateOfValidity: new Date('2023-01-01'),
        installments: mockInstallmentTaxData.taxInstallments,
        specificSymbol: expect.any(String),
        taxPayments: mockInstallmentTaxData.taxPayments,
      })
      expect(result).toEqual(mockPaymentGeneratorDto)
    })

    it('should throw error for unsupported tax type', async () => {
      const thrownError = new HttpException(
        'Implementation for tax type KO not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
      jest
        .spyOn(service['throwerErrorGuard'], 'InternalServerErrorException')
        .mockReturnValue(thrownError)

      await expect(
        service.getInstallmentPaymentGenerator(
          mockTaxPayerWhereUniqueInput,
          2023,
          TaxType.KO,
          1,
        ),
      ).rejects.toThrow(thrownError)
    })

    it('should use current date for today parameter', async () => {
      const fixedDate = new Date('2023-06-15T14:30:00.000Z')
      jest.setSystemTime(fixedDate)

      const mockImplementation = {
        fetchTaxData: jest.fn().mockResolvedValue(mockInstallmentTaxData),
      }

      jest
        .spyOn(service as any, 'getImplementationByType')
        .mockReturnValue(mockImplementation)
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

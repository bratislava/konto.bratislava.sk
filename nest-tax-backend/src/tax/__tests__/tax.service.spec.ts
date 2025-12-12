import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { PaymentStatus, Prisma, TaxPayer } from '@prisma/client'

import prismaMock from '../../../test/singleton'
import { PaymentService } from '../../payment/payment.service'
import { PrismaService } from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { QrCodeSubservice } from '../../utils/subservices/qrcode.subservice'
import {
  CustomErrorTaxTypesEnum,
  CustomErrorTaxTypesResponseEnum,
} from '../dtos/error.dto'
import { TaxService } from '../tax.service'

jest.mock('../utils/unified-tax.util', () => ({
  getTaxDetailPure: jest.fn(),
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
    readyToImport: false,
    ...overrides,
  }
}

describe('TaxService', () => {
  let service: TaxService

  const mockTaxData = {
    id: 1,
    uuid: 'tax-uuid',
    year: 2023,
    amount: 1000,
    variableSymbol: 'VS123',
    dateTaxRuling: new Date('2023-01-01'),
    taxConstructions: 0,
    taxFlat: 0,
    taxLand: 0,
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
    taxDetails: [
      {
        id: 1,
        type: 'LAND',
        amount: 500,
      },
    ],
    taxPayments: [
      {
        id: 1,
        amount: 200,
        status: PaymentStatus.SUCCESS,
        createdAt: new Date('2023-05-01'),
      },
    ],
  }

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

  describe('getListOfTaxesByBirthnumber', () => {
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

      await expect(service.getListOfTaxesByBirthnumber('')).rejects.toThrow()

      expect(forbiddenExceptionSpy).toHaveBeenCalledWith(
        CustomErrorTaxTypesEnum.BIRTHNUMBER_NOT_EXISTS,
        CustomErrorTaxTypesResponseEnum.BIRTHNUMBER_NOT_EXISTS,
      )
    })

    it('should set taxPayerWasUpdated to false when TaxPayer does not exist', async () => {
      // Mock no taxpayer found
      prismaMock.taxPayer.findUnique.mockResolvedValue(null)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumber('123456/789')

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

      const result = await service.getListOfTaxesByBirthnumber('123456/789')

      expect(result.availabilityStatus).toBe('LOOKING_FOR_YOUR_TAX')
    })

    it('should set taxPayerWasUpdated to false when updatedAt is exactly 1 second after createdAt', async () => {
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:01.000Z'), // Exactly 1000ms later
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumber('123456/789')

      expect(result.availabilityStatus).toBe('LOOKING_FOR_YOUR_TAX')
    })

    it('should set taxPayerWasUpdated to true when updatedAt is more than 1 second after createdAt', async () => {
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:02.000Z'), // 2000ms later
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumber('123456/789')

      expect(result.availabilityStatus).toBe('TAX_NOT_ON_RECORD')
    })

    it('should set taxPayerWasUpdated to false when updatedAt is less than 1 second after createdAt', async () => {
      const mockTaxPayer = createMockTaxPayer({
        createdAt: new Date('2025-01-01T10:00:00.000Z'),
        updatedAt: new Date('2025-01-01T10:00:00.500Z'), // 500ms later
      })

      prismaMock.taxPayer.findUnique.mockResolvedValue(mockTaxPayer)
      prismaMock.tax.findMany.mockResolvedValue([])

      const result = await service.getListOfTaxesByBirthnumber('123456/789')

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

      const result = await service.getListOfTaxesByBirthnumber('123456/789')

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

      const result = await service.getListOfTaxesByBirthnumber('123456/789')

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

      const result = await service.getListOfTaxesByBirthnumber('123456/789')
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

      const result = await service.getListOfTaxesByBirthnumber('123456/789')
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

      const result = await service.getListOfTaxesByBirthnumber('123456/789')
      expect(result.availabilityStatus).toBe('TAX_NOT_ON_RECORD')
    })
  })

  describe('private methods', () => {
    describe('fetchTaxData', () => {
      it('should fetch tax data successfully', async () => {
        prismaMock.taxPayer.findUnique.mockResolvedValue({
          id: 1,
        } as TaxPayer)
        prismaMock.tax.findUnique.mockResolvedValue(mockTaxData as any)

        const result = await service['fetchTaxData'](
          { birthNumber: '123456/789' },
          { taxInstallments: true },
          2023,
        )

        expect(prismaMock.tax.findUnique).toHaveBeenCalledWith({
          where: {
            taxPayerId_year: {
              year: 2023,
              taxPayerId: 1,
            },
          },
          include: {
            taxInstallments: true,
          },
        })
        expect(result).toEqual(mockTaxData)
      })

      it('should throw error when tax not found', async () => {
        prismaMock.taxPayer.findUnique.mockResolvedValue({
          id: 1,
        } as TaxPayer)
        prismaMock.tax.findUnique.mockResolvedValue(null)
        const notFoundExceptionSpy = jest.spyOn(
          service['throwerErrorGuard'],
          'NotFoundException',
        )
        await expect(
          service['fetchTaxData']({ birthNumber: '123456/789' }, {}, 2023),
        ).rejects.toThrow()

        expect(notFoundExceptionSpy).toHaveBeenCalledWith(
          CustomErrorTaxTypesEnum.TAX_YEAR_OR_USER_NOT_FOUND,
          CustomErrorTaxTypesResponseEnum.TAX_YEAR_OR_USER_NOT_FOUND,
        )
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

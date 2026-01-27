import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { TaxType } from '@prisma/client'

import { RequestPostNorisLoadDataOptionsDto } from '../../../admin/dtos/requests.dto'
import { ErrorsEnum } from '../../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { NorisTaxSubservice } from '../noris-tax.subservice'
import { NorisTaxCommunalWasteSubservice } from '../noris-tax/noris-tax.communal-waste.subservice'
import { NorisTaxRealEstateSubservice } from '../noris-tax/noris-tax.real-estate.subservice'

describe('NorisTaxSubservice', () => {
  let service: NorisTaxSubservice
  let throwerErrorGuard: ThrowerErrorGuard
  let norisTaxRealEstateSubservice: jest.Mocked<NorisTaxRealEstateSubservice>
  let norisTaxCommunalWasteSubservice: jest.Mocked<NorisTaxCommunalWasteSubservice>

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NorisTaxSubservice,
        {
          provide: ThrowerErrorGuard,
          useValue: createMock<ThrowerErrorGuard>(),
        },
        {
          provide: NorisTaxRealEstateSubservice,
          useValue: createMock<NorisTaxRealEstateSubservice>(),
        },
        {
          provide: NorisTaxCommunalWasteSubservice,
          useValue: createMock<NorisTaxCommunalWasteSubservice>(),
        },
      ],
    }).compile()

    service = module.get<NorisTaxSubservice>(NorisTaxSubservice)
    throwerErrorGuard = module.get<ThrowerErrorGuard>(ThrowerErrorGuard)
    norisTaxRealEstateSubservice = module.get(NorisTaxRealEstateSubservice)
    norisTaxCommunalWasteSubservice = module.get(
      NorisTaxCommunalWasteSubservice,
    )
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getImplementationByType', () => {
    it('should return norisTaxRealEstateSubservice for TaxType.DZN', () => {
      const result = service['getImplementationByType'](TaxType.DZN)
      expect(result).toBe(norisTaxRealEstateSubservice)
    })

    it('should return norisTaxCommunalWasteSubservice for TaxType.KO', () => {
      const result = service['getImplementationByType'](TaxType.KO)
      expect(result).toBe(norisTaxCommunalWasteSubservice)
    })

    it('should throw InternalServerErrorException for unsupported tax type', () => {
      const mockError = new Error('Mock error')
      jest
        .spyOn(throwerErrorGuard, 'InternalServerErrorException')
        .mockImplementation(() => {
          throw mockError
        })

      const invalidTaxType = 'INVALID_TYPE' as TaxType

      expect(() => service['getImplementationByType'](invalidTaxType)).toThrow(
        mockError,
      )
      expect(
        throwerErrorGuard.InternalServerErrorException,
      ).toHaveBeenCalledWith(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Implementation for tax type INVALID_TYPE not found',
      )
    })
  })

  describe('processNorisTaxData', () => {
    const mockYear = 2024
    const mockOptions: RequestPostNorisLoadDataOptionsDto = {
      prepareOnly: true,
      ignoreBatchLimit: true,
    }

    it('should call DZN subservice when taxType is TaxType.DZN', async () => {
      const mockNorisData = [{ id: 1, data: 'test' }]
      const mockResponse = {
        birthNumbers: [
          '1234567890',
          '1234567891',
          '1234567892',
          '1234567893',
          '1234567894',
        ],
        foundInNoris: ['1234567890', '1234567891', '1234567892', '1234567893'],
      }

      norisTaxRealEstateSubservice.processNorisTaxData.mockResolvedValue(
        mockResponse,
      )

      const result = await service.processNorisTaxData(
        TaxType.DZN,
        mockNorisData as any,
        mockYear,
        mockOptions,
      )

      expect(
        norisTaxRealEstateSubservice.processNorisTaxData,
      ).toHaveBeenCalledWith(mockNorisData, mockYear, mockOptions)
      expect(
        norisTaxRealEstateSubservice.processNorisTaxData,
      ).toHaveBeenCalledTimes(1)
      expect(
        norisTaxCommunalWasteSubservice.processNorisTaxData,
      ).not.toHaveBeenCalled()
      expect(result).toBe(mockResponse)
    })

    it('should call KO subservice when taxType is TaxType.KO', async () => {
      const mockNorisData = [{ id: 2, data: 'test-ko' }]
      const mockResponse = {
        birthNumbers: [
          '1234567890',
          '1234567891',
          '1234567892',
          '1234567893',
          '1234567894',
        ],
        foundInNoris: ['1234567890', '1234567891', '1234567892', '1234567893'],
      }

      norisTaxCommunalWasteSubservice.processNorisTaxData.mockResolvedValue(
        mockResponse,
      )

      const result = await service.processNorisTaxData(
        TaxType.KO,
        mockNorisData as any,
        mockYear,
        mockOptions,
      )

      expect(
        norisTaxCommunalWasteSubservice.processNorisTaxData,
      ).toHaveBeenCalledWith(mockNorisData, mockYear, mockOptions)
      expect(
        norisTaxCommunalWasteSubservice.processNorisTaxData,
      ).toHaveBeenCalledTimes(1)
      expect(
        norisTaxRealEstateSubservice.processNorisTaxData,
      ).not.toHaveBeenCalled()
      expect(result).toBe(mockResponse)
    })

    it('should pass empty object as default options when not provided', async () => {
      const mockNorisData = [{ id: 1, data: 'test' }]
      const mockResponse = {
        birthNumbers: [
          '1234567890',
          '1234567891',
          '1234567892',
          '1234567893',
          '1234567894',
        ],
        foundInNoris: ['1234567890', '1234567891', '1234567892', '1234567893'],
      }

      norisTaxRealEstateSubservice.processNorisTaxData.mockResolvedValue(
        mockResponse,
      )

      await service.processNorisTaxData(
        TaxType.DZN,
        mockNorisData as any,
        mockYear,
      )

      expect(
        norisTaxRealEstateSubservice.processNorisTaxData,
      ).toHaveBeenCalledWith(mockNorisData, mockYear, {})
    })

    it('should throw for unknown tax type', async () => {
      const mockError = new Error('Unknown tax type')
      jest
        .spyOn(throwerErrorGuard, 'InternalServerErrorException')
        .mockImplementation(() => {
          throw mockError
        })

      const unknownTaxType = 'UNKNOWN' as TaxType

      await expect(
        service.processNorisTaxData(unknownTaxType, [] as any, mockYear),
      ).rejects.toThrow(mockError)

      expect(
        throwerErrorGuard.InternalServerErrorException,
      ).toHaveBeenCalledWith(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        expect.stringContaining('Unknown tax type'),
      )
    })
  })

  describe('getAndProcessNorisTaxDataByBirthNumberAndYear', () => {
    const mockYear = 2024
    const mockBirthNumbers = ['123456/7890', '987654/3210']
    const mockOptions: RequestPostNorisLoadDataOptionsDto = {
      prepareOnly: false,
      ignoreBatchLimit: true,
    }

    it('should call correct subservice for TaxType.DZN with all parameters', async () => {
      const mockResponse = {
        birthNumbers: [
          '1234567890',
          '1234567891',
          '1234567892',
          '1234567893',
          '1234567894',
        ],
        foundInNoris: ['1234567890', '1234567891', '1234567892', '1234567893'],
      }

      norisTaxRealEstateSubservice.getAndProcessNorisTaxDataByBirthNumberAndYear.mockResolvedValue(
        mockResponse,
      )

      const result =
        await service.getAndProcessNorisTaxDataByBirthNumberAndYear(
          TaxType.DZN,
          mockYear,
          mockBirthNumbers,
          mockOptions,
        )

      expect(
        norisTaxRealEstateSubservice.getAndProcessNorisTaxDataByBirthNumberAndYear,
      ).toHaveBeenCalledWith(mockYear, mockBirthNumbers, mockOptions)
      expect(
        norisTaxRealEstateSubservice.getAndProcessNorisTaxDataByBirthNumberAndYear,
      ).toHaveBeenCalledTimes(1)
      expect(result).toBe(mockResponse)
    })

    it('should call correct subservice for TaxType.KO with all parameters', async () => {
      const mockResponse = {
        birthNumbers: [
          '1234567890',
          '1234567891',
          '1234567892',
          '1234567893',
          '1234567894',
        ],
        foundInNoris: ['1234567890', '1234567891', '1234567892', '1234567893'],
      }

      norisTaxCommunalWasteSubservice.getAndProcessNorisTaxDataByBirthNumberAndYear.mockResolvedValue(
        mockResponse,
      )

      const result =
        await service.getAndProcessNorisTaxDataByBirthNumberAndYear(
          TaxType.KO,
          mockYear,
          mockBirthNumbers,
          mockOptions,
        )

      expect(
        norisTaxCommunalWasteSubservice.getAndProcessNorisTaxDataByBirthNumberAndYear,
      ).toHaveBeenCalledWith(mockYear, mockBirthNumbers, mockOptions)
      expect(
        norisTaxCommunalWasteSubservice.getAndProcessNorisTaxDataByBirthNumberAndYear,
      ).toHaveBeenCalledTimes(1)
      expect(result).toBe(mockResponse)
    })

    it('should pass empty object as default options when not provided', async () => {
      const mockResponse = {
        birthNumbers: [
          '1234567890',
          '1234567891',
          '1234567892',
          '1234567893',
          '1234567894',
        ],
        foundInNoris: ['1234567890', '1234567891', '1234567892', '1234567893'],
      }

      norisTaxRealEstateSubservice.getAndProcessNorisTaxDataByBirthNumberAndYear.mockResolvedValue(
        mockResponse,
      )

      await service.getAndProcessNorisTaxDataByBirthNumberAndYear(
        TaxType.DZN,
        mockYear,
        mockBirthNumbers,
      )

      expect(
        norisTaxRealEstateSubservice.getAndProcessNorisTaxDataByBirthNumberAndYear,
      ).toHaveBeenCalledWith(mockYear, mockBirthNumbers, {})
    })

    it('should throw if getImplementationByType throws for unsupported tax type', async () => {
      const mockError = new Error('Implementation not found')
      jest
        .spyOn(throwerErrorGuard, 'InternalServerErrorException')
        .mockImplementation(() => {
          throw mockError
        })

      const invalidTaxType = 'INVALID' as TaxType

      await expect(
        service.getAndProcessNorisTaxDataByBirthNumberAndYear(
          invalidTaxType,
          mockYear,
          mockBirthNumbers,
        ),
      ).rejects.toThrow(mockError)
    })
  })

  describe('getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords', () => {
    const mockYear = 2024
    const mockBirthNumbers = ['123456/7890', '987654/3210']

    it('should call correct subservice for TaxType.DZN with all parameters', async () => {
      const mockResponse = { updated: 10 }

      norisTaxRealEstateSubservice.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords.mockResolvedValue(
        mockResponse,
      )

      const result =
        await service.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
          TaxType.DZN,
          mockYear,
          mockBirthNumbers,
        )

      expect(
        norisTaxRealEstateSubservice.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords,
      ).toHaveBeenCalledWith(mockYear, mockBirthNumbers)
      expect(
        norisTaxRealEstateSubservice.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords,
      ).toHaveBeenCalledTimes(1)
      expect(result).toBe(mockResponse)
    })

    it('should call correct subservice for TaxType.KO with all parameters', async () => {
      const mockResponse = { updated: 15 }

      norisTaxCommunalWasteSubservice.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords.mockResolvedValue(
        mockResponse,
      )

      const result =
        await service.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
          TaxType.KO,
          mockYear,
          mockBirthNumbers,
        )

      expect(
        norisTaxCommunalWasteSubservice.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords,
      ).toHaveBeenCalledWith(mockYear, mockBirthNumbers)
      expect(
        norisTaxCommunalWasteSubservice.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords,
      ).toHaveBeenCalledTimes(1)
      expect(result).toBe(mockResponse)
    })

    it('should throw if getImplementationByType throws for unsupported tax type', async () => {
      const mockError = new Error('Implementation not found')
      jest
        .spyOn(throwerErrorGuard, 'InternalServerErrorException')
        .mockImplementation(() => {
          throw mockError
        })

      const invalidTaxType = 'INVALID' as TaxType

      await expect(
        service.getNorisTaxDataByBirthNumberAndYearAndUpdateExistingRecords(
          invalidTaxType,
          mockYear,
          mockBirthNumbers,
        ),
      ).rejects.toThrow(mockError)
    })
  })
})

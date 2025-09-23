describe('Minimal test suite', () => {
  test('should pass', () => {
    expect(true).toBe(true)
  })
})
/* TODO move tests to Noris module
import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import {
  DeliveryMethodNamed,
  PaymentStatus,
  Prisma,
  Tax,
  TaxPayer,
} from '@prisma/client'
import { ResponseUserByBirthNumberDto } from 'openapi-clients/city-account'

import { BloomreachService } from '../../bloomreach/bloomreach.service'
import { NorisPaymentsDto, NorisTaxPayersDto } from '../../noris/noris.dto'
import { NorisService } from '../../noris/noris.service'
import {
  AreaTypesEnum,
  DeliveryMethod,
  IsInCityAccount,
} from '../../noris/utils/noris.types'
import { PrismaService } from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../utils/subservices/cityaccount.subservice'
import { QrCodeSubservice } from '../../utils/subservices/qrcode.subservice'
import {
  TaxIdVariableSymbolYear,
  TaxWithTaxPayer,
} from '../../utils/types/types.prisma'
import { AdminService } from '../admin.service'
import { RequestUpdateNorisDeliveryMethodsData } from '../dtos/requests.dto'
import * as taxDetailHelper from '../../noris/utils/tax-detail.helper'

jest.mock('../../noris/utils/tax-detail.helper')

describe('AdminService', () => {
  let service: AdminService

  let prismaMock: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: createMock<PrismaService>() },
        { provide: QrCodeSubservice, useValue: createMock<QrCodeSubservice>() },
        {
          provide: CityAccountSubservice,
          useValue: createMock<CityAccountSubservice>(),
        },
        {
          provide: BloomreachService,
          useValue: createMock<BloomreachService>(),
        },
        { provide: NorisService, useValue: createMock<NorisService>() },
        ThrowerErrorGuard,
      ],
    }).compile()

    service = module.get<AdminService>(AdminService)
    prismaMock = module.get<PrismaService>(PrismaService)

    jest.spyOn(service['logger'], 'error').mockImplementation(() => {})
    jest.spyOn(service['logger'], 'log').mockImplementation(() => {})
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // eslint-disable-next-line no-secrets/no-secrets
  describe('updateDeliveryMethodsInNoris', () => {
    const mockDate1 = '2024-01-01'
    const mockDate2 = '2024-01-02'

    it('should correctly group and update delivery methods', async () => {
      const mockData: RequestUpdateNorisDeliveryMethodsData = {
        '123456/789': { deliveryMethod: DeliveryMethod.EDESK },
        '234567/890': { deliveryMethod: DeliveryMethod.EDESK },
        '345678/901': { deliveryMethod: DeliveryMethod.POSTAL },
        '345678/902': { deliveryMethod: DeliveryMethod.POSTAL },
        '456789/0123': {
          deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
          date: mockDate1,
        },
        '456789/0103': {
          deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
          date: mockDate2,
        },
      }

      await service.updateDeliveryMethodsInNoris({
        data: mockData,
      })

      expect(
        service['norisService'].updateDeliveryMethods,
      ).toHaveBeenCalledTimes(1)
      expect(
        service['norisService'].updateDeliveryMethods,
      ).toHaveBeenCalledWith([
        {
          birthNumbers: ['123456/789', '234567/890'],
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: DeliveryMethod.EDESK,
          date: null,
        },
        {
          birthNumbers: ['345678/901', '345678/902'],
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: DeliveryMethod.POSTAL,
          date: null,
        },
        {
          birthNumbers: ['456789/0123'],
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
          date: mockDate1,
        },
        {
          birthNumbers: ['456789/0103'],
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
          date: mockDate2,
        },
      ])
    })

    it('should skip empty groups', async () => {
      const mockData: RequestUpdateNorisDeliveryMethodsData = {
        '001234/567': { deliveryMethod: DeliveryMethod.EDESK },
        '000123/890': { deliveryMethod: DeliveryMethod.EDESK },
      }

      await service.updateDeliveryMethodsInNoris({
        data: mockData,
      })

      expect(
        service['norisService'].updateDeliveryMethods,
      ).toHaveBeenCalledTimes(1)
      expect(
        service['norisService'].updateDeliveryMethods,
      ).toHaveBeenCalledWith([
        {
          birthNumbers: ['001234/567', '000123/890'],
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: DeliveryMethod.EDESK,
          date: null,
        },
      ])
    })

    it('should handle empty input data', async () => {
      await service.updateDeliveryMethodsInNoris({ data: {} })

      expect(
        service['norisService'].updateDeliveryMethods,
      ).not.toHaveBeenCalled()
    })

    it('should handle invalid delivery methods', async () => {
      const mockData: RequestUpdateNorisDeliveryMethodsData = {
        '012345/678': { deliveryMethod: 'INVALID' as DeliveryMethod.POSTAL }, // Just to make TS happy
        '123456/789': { deliveryMethod: DeliveryMethod.EDESK },
      }

      await service.updateDeliveryMethodsInNoris({
        data: mockData,
      })

      expect(
        service['norisService'].updateDeliveryMethods,
      ).toHaveBeenCalledTimes(1)
      expect(
        service['norisService'].updateDeliveryMethods,
      ).toHaveBeenCalledWith([
        {
          birthNumbers: ['123456/789'],
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: DeliveryMethod.EDESK,
          date: null,
        },
      ])
    })

    it('should propagate errors from norisService', async () => {
      const mockError = new Error('Update failed')
      jest
        .spyOn(service['norisService'], 'updateDeliveryMethods')
        .mockRejectedValueOnce(mockError)

      const mockData: RequestUpdateNorisDeliveryMethodsData = {
        '000123/456': { deliveryMethod: DeliveryMethod.EDESK },
      }

      await expect(
        service.updateDeliveryMethodsInNoris({
          data: mockData,
        }),
      ).rejects.toThrow(mockError)
    })

    it('should throw if date is missing for CITY_ACCOUNT', async () => {
      const mockData: RequestUpdateNorisDeliveryMethodsData = {
        '123456/789': { deliveryMethod: DeliveryMethod.EDESK },
        '234567/890': { deliveryMethod: DeliveryMethod.EDESK },
        '345678/901': { deliveryMethod: DeliveryMethod.POSTAL },
        '345678/902': { deliveryMethod: DeliveryMethod.POSTAL },
        '456789/0123': {
          deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
          date: undefined,
        },
        '456789/0103': {
          deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
          date: mockDate2,
        },
      } as unknown as RequestUpdateNorisDeliveryMethodsData

      await expect(
        service.updateDeliveryMethodsInNoris({
          data: mockData,
        }),
      ).rejects.toThrow()
      expect(
        service['norisService'].updateDeliveryMethods,
      ).not.toHaveBeenCalled()
    })
  })

  describe('removeDeliveryMethodsFromNoris', () => {
    it('should call updateDeliveryMethods with correct parameters', async () => {
      const birthNumber = '123456/789'

      await service.removeDeliveryMethodsFromNoris(birthNumber)

      expect(
        service['norisService'].updateDeliveryMethods,
      ).toHaveBeenCalledTimes(1)
      expect(
        service['norisService'].updateDeliveryMethods,
      ).toHaveBeenCalledWith([
        {
          birthNumbers: [birthNumber],
          inCityAccount: IsInCityAccount.NO,
          deliveryMethod: null,
          date: null,
        },
      ])
    })

    it('should propagate errors from norisService', async () => {
      const birthNumber = '123456/789'
      const mockError = new Error('Update failed')

      jest
        .spyOn(service['norisService'], 'updateDeliveryMethods')
        .mockRejectedValueOnce(mockError)

      await expect(
        service.removeDeliveryMethodsFromNoris(birthNumber),
      ).rejects.toThrow(mockError)
    })
  })

  describe('updateTaxesFromNoris', () => {
    it('should update taxes with valid data', async () => {
      const mockTaxes: TaxIdVariableSymbolYear[] = [
        { id: 1, variableSymbol: 'VS1', year: 2024 },
        { id: 2, variableSymbol: 'VS2', year: 2025 },
      ]
      const mockData = [
        { variabilny_symbol: 'VS1', datum_platnosti: '2024-01-01' },
        { variabilny_symbol: 'VS2', datum_platnosti: '2024-01-02' },
      ]

      jest
        .spyOn(service['norisService'], 'getDataForUpdate')
        .mockResolvedValueOnce(mockData)
      jest
        .spyOn(service['prismaService'], '$transaction')
        .mockResolvedValueOnce(
          mockTaxes.map((tax) => ({
            ...tax,
            dateTaxRuling: mockData.find(
              (item) => item.variabilny_symbol === tax.variableSymbol,
            )?.datum_platnosti,
          })),
        )

      await service.updateTaxesFromNoris(mockTaxes)

      expect(service['norisService'].getDataForUpdate).toHaveBeenCalledWith(
        ['VS1', 'VS2'],
        [2024, 2025],
      )
      expect(service['prismaService'].$transaction).toHaveBeenCalledWith([
        expect.any(Function),
        expect.any(Function),
      ])
    })

    it('should not update taxes if datum_platnosti is null', async () => {
      const mockTaxes: TaxIdVariableSymbolYear[] = [
        { id: 1, variableSymbol: 'VS1', year: 2024 },
        { id: 2, variableSymbol: 'VS2', year: 2024 },
      ]
      const mockData = [
        { variabilny_symbol: 'VS1', datum_platnosti: null },
        { variabilny_symbol: 'VS2', datum_platnosti: null },
      ]

      jest
        .spyOn(service['norisService'], 'getDataForUpdate')
        .mockResolvedValueOnce(mockData)

      await service.updateTaxesFromNoris(mockTaxes)

      expect(service['norisService'].getDataForUpdate).toHaveBeenCalledWith(
        ['VS1', 'VS2'],
        [2024],
      )
      expect(service['prismaService'].$transaction).toHaveBeenCalledWith([])
    })

    it('should propagate errors from norisService', async () => {
      const mockTaxes: TaxIdVariableSymbolYear[] = [
        { id: 1, variableSymbol: 'VS1', year: 2024 },
      ]
      const mockError = new Error('Update failed')

      jest
        .spyOn(service['norisService'], 'getDataForUpdate')
        .mockRejectedValueOnce(mockError)

      await expect(service.updateTaxesFromNoris(mockTaxes)).rejects.toThrow(
        mockError,
      )
    })

    it('should propagate errors from prismaService', async () => {
      const mockTaxes: TaxIdVariableSymbolYear[] = [
        { id: 1, variableSymbol: 'VS1', year: 2024 },
      ]
      const mockData = [
        { variabilny_symbol: 'VS1', datum_platnosti: '2024-01-01' },
      ]
      const mockError = new Error('Transaction failed')

      jest
        .spyOn(service['norisService'], 'getDataForUpdate')
        .mockResolvedValueOnce(mockData)
      jest
        .spyOn(service['prismaService'], '$transaction')
        .mockRejectedValueOnce(mockError)

      await expect(service.updateTaxesFromNoris(mockTaxes)).rejects.toThrow(
        mockError,
      )
    })
  })

  describe('processNorisTaxData', () => {
    it('should process tax data correctly', async () => {
      const norisData: NorisTaxPayersDto[] = [
        {
          ICO_RC: '123456/789',
          dan_spolu: '1000',
        },
        {
          ICO_RC: '123456/9999',
          dan_spolu: '1000',
        },
      ] as NorisTaxPayersDto[]

      jest
        .spyOn(service['cityAccountSubservice'], 'getUserDataAdminBatch')
        .mockResolvedValue({
          '123456/9999': {
            externalId: '123456',
          } as ResponseUserByBirthNumberDto,
        })
      jest
        .spyOn(service['prismaService']['tax'], 'findMany')
        .mockResolvedValueOnce([])
      jest
        .spyOn(service['prismaService'], '$transaction')
        .mockImplementation((callback) => callback(prismaMock))

      const insertSpy = jest
        .spyOn(service as any, 'insertTaxPayerDataToDatabase')
        .mockImplementation((data) =>
          Promise.resolve({ birthNumber: (data as NorisTaxPayersDto).ICO_RC }),
        )
      const bloomreachSpy = jest.spyOn(
        service['bloomreachService'],
        'trackEventTax',
      )

      const result = await service.processNorisTaxData(norisData, 2025)

      expect(result).toEqual(['123456/789', '123456/9999'])
      expect(insertSpy).toHaveBeenCalledTimes(2)
      expect(bloomreachSpy).toHaveBeenCalledTimes(1)
    })

    it('should return only birth numbers that were processed', async () => {
      const norisData: NorisTaxPayersDto[] = [
        {
          ICO_RC: '123456/789',
          dan_spolu: '1000',
        },
        {
          ICO_RC: '123456/777',
          dan_spolu: '100',
        },
      ] as NorisTaxPayersDto[]

      jest
        .spyOn(service['cityAccountSubservice'], 'getUserDataAdminBatch')
        .mockResolvedValue({
          '123456/789': {
            externalId: '123456',
          } as ResponseUserByBirthNumberDto,
          '123456/777': {
            externalId: '123',
          } as ResponseUserByBirthNumberDto,
        })
      jest
        .spyOn(service['prismaService']['tax'], 'findMany')
        .mockResolvedValueOnce([])
      jest
        .spyOn(service['prismaService'], '$transaction')
        .mockImplementation((callback) => callback(prismaMock))

      const insertSpy = jest
        .spyOn(service as any, 'insertTaxPayerDataToDatabase')
        .mockImplementation((data) => {
          if ((data as NorisTaxPayersDto).ICO_RC === '123456/789') {
            return Promise.reject(new Error('Insert failed'))
          }
          return Promise.resolve({
            birthNumber: (data as NorisTaxPayersDto).ICO_RC,
          })
        })

      const result = await service.processNorisTaxData(norisData, 2025)

      expect(result).toEqual(['123456/777'])
      expect(insertSpy).toHaveBeenCalledTimes(2) // Called for both, but only one succeeded

      expect(service['logger'].error).toHaveBeenCalledTimes(1)
    })

    it('should create only taxes which are not already in the database', async () => {
      const norisData: NorisTaxPayersDto[] = [
        {
          ICO_RC: '123456/789',
          dan_spolu: '1000',
        },
        {
          ICO_RC: '123456/777',
          dan_spolu: '100',
        },
        {
          ICO_RC: '123456/888',
          dan_spolu: '100',
        },
      ] as NorisTaxPayersDto[]

      jest
        .spyOn(service['cityAccountSubservice'], 'getUserDataAdminBatch')
        .mockResolvedValue({
          '123456/789': {
            externalId: '123456',
          } as ResponseUserByBirthNumberDto,
          '123456/777': {
            externalId: '123',
          } as ResponseUserByBirthNumberDto,
          '123456/888': {
            externalId: '123',
          } as ResponseUserByBirthNumberDto,
        })
      jest
        .spyOn(service['prismaService']['tax'], 'findMany')
        .mockResolvedValueOnce([
          {
            taxPayer: {
              birthNumber: '123456/888',
            },
          },
        ] as unknown as Tax[])
      jest
        .spyOn(service['prismaService'], '$transaction')
        .mockImplementation((callback) => callback(prismaMock))

      const insertSpy = jest
        .spyOn(service as any, 'insertTaxPayerDataToDatabase')
        .mockImplementation((data) => {
          return Promise.resolve({
            birthNumber: (data as NorisTaxPayersDto).ICO_RC,
          })
        })

      const result = await service.processNorisTaxData(norisData, 2025)

      expect(result).toEqual(
        expect.arrayContaining(['123456/777', '123456/789', '123456/888']),
      )
      expect(result).toHaveLength(3)
      expect(insertSpy).toHaveBeenCalledTimes(2) // Called for only two new taxes
      expect(insertSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({ ICO_RC: '123456/888' }),
      )

      expect(service['logger'].error).toHaveBeenCalledTimes(0)
    })

    it('should log all errors, not just one', async () => {
      const norisData: NorisTaxPayersDto[] = [
        {
          ICO_RC: '123456/789',
          dan_spolu: '1000',
        },
        {
          ICO_RC: '123456/777',
          dan_spolu: '100',
        },
      ] as NorisTaxPayersDto[]

      jest
        .spyOn(service['cityAccountSubservice'], 'getUserDataAdminBatch')
        .mockResolvedValue({
          '123456/789': {
            externalId: '123456',
          } as ResponseUserByBirthNumberDto,
          '123456/777': {
            externalId: '123',
          } as ResponseUserByBirthNumberDto,
        })
      jest
        .spyOn(service['prismaService']['tax'], 'findMany')
        .mockResolvedValueOnce([])
      jest
        .spyOn(service['prismaService'], '$transaction')
        .mockImplementation((callback) => callback(prismaMock))

      const insertSpy = jest
        .spyOn(service as any, 'insertTaxPayerDataToDatabase')
        .mockRejectedValue(new Error('Insert failed'))

      const result = await service.processNorisTaxData(norisData, 2025)

      expect(result).toEqual([])
      expect(insertSpy).toHaveBeenCalledTimes(2) // Called for both, but none succeeded

      expect(service['logger'].error).toHaveBeenCalledTimes(2) // Both errors should be logged
    })
  })

  describe('insertTaxPayerDataToDatabase', () => {
    let mockTransaction: Prisma.TransactionClient

    beforeEach(() => {
      mockTransaction = createMock<Prisma.TransactionClient>()
    })

    it('should propagate errors', async () => {
      const mockData: NorisTaxPayersDto = {
        ICO_RC: '123456/789',
        dan_spolu: '1000',
        cislo_poradace: '123456',
        variabilny_symbol: 'VS123',
        dan_pozemky: '200',
        dan_stavby_SPOLU: '300',
        dan_byty: '400',
        SPL4_2: '',
        SPL1: '100',
      } as unknown as NorisTaxPayersDto

      jest.spyOn(mockTransaction['tax'], 'findMany').mockResolvedValueOnce([])

      const mockError = new Error('Insert failed')
      jest
        .spyOn(mockTransaction['tax'], 'upsert')
        .mockRejectedValueOnce(mockError)

      await expect(
        service['insertTaxPayerDataToDatabase'](
          mockData,
          2025,
          mockTransaction,
          {
            taxDeliveryMethodAtLockDate: DeliveryMethodNamed.EDESK,
          } as ResponseUserByBirthNumberDto,
        ),
      ).rejects.toThrow(mockError)
    })

    it('should insert tax payer data correctly', async () => {
      const mockData: NorisTaxPayersDto = {
        ICO_RC: '123456/789',
        dan_spolu: '1000',
        cislo_poradace: '123456',
        variabilny_symbol: 'VS123',
        dan_pozemky: '200',
        dan_stavby_SPOLU: '300',
        dan_byty: '400',
        SPL4_2: '',
        SPL1: '100',
      } as unknown as NorisTaxPayersDto

      jest.spyOn(mockTransaction['tax'], 'findMany').mockResolvedValueOnce([])

      const mockTaxPayer: TaxPayer = {
        id: 1,
        birthNumber: '123456/789',
        taxAdministratorId: 1,
        name: 'Test Name',
      } as TaxPayer

      jest
        .spyOn(mockTransaction['taxPayer'], 'upsert')
        .mockResolvedValueOnce(mockTaxPayer)

      jest
        .spyOn(taxDetailHelper, 'mapNorisToTaxDetailData')
        .mockReturnValueOnce([
          {
            taxId: 1,
            areaType: 'A',
            type: AreaTypesEnum.APARTMENT,
            base: 100,
            amount: 400,
            area: null,
          },
          {
            taxId: 1,
            areaType: 'B',
            type: AreaTypesEnum.CONSTRUCTION,
            base: 200,
            amount: 300,
            area: null,
          },
          {
            taxId: 1,
            areaType: 'C',
            type: AreaTypesEnum.GROUND,
            base: 0,
            amount: 200,
            area: null,
          },
        ])

      const result = await service['insertTaxPayerDataToDatabase'](
        mockData,
        2025,
        mockTransaction,
        {
          taxDeliveryMethodAtLockDate: DeliveryMethodNamed.EDESK,
        } as ResponseUserByBirthNumberDto,
      )
      expect(result).toEqual(mockTaxPayer)

      // Check that all has been created (all creates had been called)
      expect(mockTransaction['taxPayer'].upsert).toHaveBeenCalled()
      expect(mockTransaction['tax'].upsert).toHaveBeenCalled()
      expect(mockTransaction['taxDetail'].createMany).toHaveBeenCalled()
      expect(mockTransaction['taxInstallment'].createMany).toHaveBeenCalled()
      expect(mockTransaction['taxAdministrator'].upsert).toHaveBeenCalled()
    })
  })

  // eslint-disable-next-line no-secrets/no-secrets
  describe('processIndividualPayment', () => {
    beforeEach(() => {
      jest
        .spyOn(service['prismaService'], '$transaction')
        .mockImplementation((callback) => callback(prismaMock))
    })

    it('should process individual payment correctly', async () => {
      const mockPayment: NorisPaymentsDto = {
        variabilny_symbol: 'VS123',
        uhrazeno: '500.0',
        zbyva_uhradit: '0',
        specificky_symbol: 'SS123',
      } as NorisPaymentsDto

      const taxesDataByVsMap: Map<string, TaxWithTaxPayer> = new Map([
        [
          'VS123',
          {
            id: 1,
            variableSymbol: 'VS123',
            taxPayer: {
              birthNumber: '123456/789',
            },
          } as unknown as TaxWithTaxPayer,
        ],
      ])

      const taxPaymentDataMap: Map<number, { sum: number; count: number }> =
        new Map([[1, { sum: 30_000, count: 2 }]])

      const userDataFromCityAccount: Record<
        string,
        ResponseUserByBirthNumberDto
      > = {
        '123456/789': {
          externalId: '123456',
        } as ResponseUserByBirthNumberDto,
      }

      // eslint-disable-next-line no-secrets/no-secrets
      const result = await service['processIndividualPayment'](
        mockPayment,
        taxesDataByVsMap,
        taxPaymentDataMap,
        userDataFromCityAccount,
      )

      expect(result).toBe('CREATED')
      expect(prismaMock['taxPayment'].create).toHaveBeenCalledWith({
        data: {
          amount: 20_000,
          source: 'BANK_ACCOUNT',
          taxId: 1,
          status: PaymentStatus.SUCCESS,
          specificSymbol: 'SS123',
        },
      })
      expect(
        service['bloomreachService'].trackEventTaxPayment,
      ).toHaveBeenCalled()
    })

    it('should process already paid tax with no action', async () => {
      const mockPayment: NorisPaymentsDto = {
        variabilny_symbol: 'VS123',
        uhrazeno: '500.00',
        zbyva_uhradit: '0',
        specificky_symbol: 'SS123',
      } as NorisPaymentsDto

      const taxesDataByVsMap: Map<string, TaxWithTaxPayer> = new Map([
        [
          'VS123',
          {
            id: 1,
            variableSymbol: 'VS123',
            taxPayer: {
              birthNumber: '123456/789',
            },
          } as unknown as TaxWithTaxPayer,
        ],
      ])

      const taxPaymentDataMap: Map<number, { sum: number; count: number }> =
        new Map([[1, { sum: 50_000, count: 2 }]])

      const userDataFromCityAccount: Record<
        string,
        ResponseUserByBirthNumberDto
      > = {
        '123456/789': {
          externalId: '123456',
        } as ResponseUserByBirthNumberDto,
      }

      // eslint-disable-next-line no-secrets/no-secrets
      const result = await service['processIndividualPayment'](
        mockPayment,
        taxesDataByVsMap,
        taxPaymentDataMap,
        userDataFromCityAccount,
      )

      expect(result).toBe('ALREADY_CREATED')
      expect(prismaMock['taxPayment'].create).not.toHaveBeenCalled()
    })
  })
})
*/

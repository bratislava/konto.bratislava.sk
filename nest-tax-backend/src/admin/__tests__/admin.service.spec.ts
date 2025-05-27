import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'

import { BloomreachService } from '../../bloomreach/bloomreach.service'
import { NorisService } from '../../noris/noris.service'
import { DeliveryMethod, IsInCityAccount } from '../../noris/noris.types'
import { PrismaService } from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { CityAccountSubservice } from '../../utils/subservices/cityaccount.subservice'
import { QrCodeSubservice } from '../../utils/subservices/qrcode.subservice'
import { TaxIdVariableSymbolYear } from '../../utils/types/types.prisma'
import { AdminService } from '../admin.service'
import { RequestUpdateNorisDeliveryMethodsData } from '../dtos/requests.dto'

describe('TasksService', () => {
  let service: AdminService

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
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

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
})

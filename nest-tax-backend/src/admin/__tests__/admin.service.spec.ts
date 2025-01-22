import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'

import { BloomreachService } from '../../bloomreach/bloomreach.service'
import { NorisService } from '../../noris/noris.service'
import { DeliveryMethod, IsInCityAccount } from '../../noris/noris.types'
import { PrismaService } from '../../prisma/prisma.service'
import { CityAccountSubservice } from '../../utils/subservices/cityaccount.subservice'
import { QrCodeSubservice } from '../../utils/subservices/qrcode.subservice'
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
      ],
    }).compile()

    service = module.get<AdminService>(AdminService)
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
      ).toHaveBeenCalledTimes(4)
      expect(
        service['norisService'].updateDeliveryMethods,
      ).toHaveBeenCalledWith({
        birthNumbers: ['123456/789', '234567/890'],
        inCityAccount: IsInCityAccount.YES,
        deliveryMethod: DeliveryMethod.EDESK,
        date: null,
      })
      expect(
        service['norisService'].updateDeliveryMethods,
      ).toHaveBeenCalledWith({
        birthNumbers: ['345678/901', '345678/902'],
        inCityAccount: IsInCityAccount.YES,
        deliveryMethod: DeliveryMethod.POSTAL,
        date: null,
      })
      expect(
        service['norisService'].updateDeliveryMethods,
      ).toHaveBeenCalledWith({
        birthNumbers: ['456789/0123'],
        inCityAccount: IsInCityAccount.YES,
        deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
        date: mockDate1,
      })
      expect(
        service['norisService'].updateDeliveryMethods,
      ).toHaveBeenCalledWith({
        birthNumbers: ['456789/0103'],
        inCityAccount: IsInCityAccount.YES,
        deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
        date: mockDate2,
      })
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
      ).toHaveBeenCalledWith({
        birthNumbers: ['001234/567', '000123/890'],
        inCityAccount: IsInCityAccount.YES,
        deliveryMethod: DeliveryMethod.EDESK,
        date: null,
      })
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
      ).toHaveBeenCalledWith({
        birthNumbers: ['123456/789'],
        inCityAccount: IsInCityAccount.YES,
        deliveryMethod: DeliveryMethod.EDESK,
        date: null,
      })
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
      ).toHaveBeenCalledWith({
        birthNumbers: [birthNumber],
        inCityAccount: IsInCityAccount.NO,
        deliveryMethod: null,
        date: null,
      })
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
})

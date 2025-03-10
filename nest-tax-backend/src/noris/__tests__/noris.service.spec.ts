import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import * as mssql from 'mssql'

import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { NorisService } from '../noris.service'
import { DeliveryMethod, IsInCityAccount } from '../noris.types'

const mockConnection = {
  close: jest.fn(),
}

const mockRequest = {
  query: jest.fn(),
  input: jest.fn(),
}

jest.mock('mssql', () => ({
  connect: jest.fn().mockImplementation(() => mockConnection),
  Request: jest.fn().mockImplementation(() => mockRequest),
}))

describe('NorisService', () => {
  let service: NorisService

  beforeAll(() => {
    process.env = {
      ...process.env,
      MSSQL_HOST: 'mock-host',
      MSSQL_DB: 'mock-db',
      MSSQL_USERNAME: 'mock-username',
      MSSQL_PASSWORD: 'mock-password',
    }
  })

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NorisService,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        ThrowerErrorGuard,
      ],
    }).compile()

    service = module.get<NorisService>(NorisService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('updateDeliveryMethods', () => {
    it('should call for each data', async () => {
      const requestSpy = jest.spyOn(mssql, 'Request')
      const querySpy = jest.spyOn(mockRequest, 'query')
      const closeSpy = jest.spyOn(mockConnection, 'close')

      await service.updateDeliveryMethods([
        {
          birthNumbers: ['003322/4455', '003322/4456'],
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: DeliveryMethod.POSTAL,
          date: null,
        },
        {
          birthNumbers: ['003322/4455', '003322/4456'],
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: DeliveryMethod.EDESK,
          date: null,
        },
        {
          birthNumbers: ['003322/4455', '003322/4456'],
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
          date: '2024-01-01',
        },
      ])

      expect(requestSpy).toHaveBeenCalledTimes(3)
      expect(querySpy).toHaveBeenCalledTimes(3)
      expect(closeSpy).toHaveBeenCalledTimes(1)
    })

    it('should throw if something throws', async () => {
      jest.spyOn(mssql, 'Request').mockImplementation(() => {
        throw new Error('mock-error')
      })
      const querySpy = jest.spyOn(mockRequest, 'query')
      const closeSpy = jest.spyOn(mockConnection, 'close')

      await expect(
        service.updateDeliveryMethods([
          {
            birthNumbers: ['003322/4455', '003322/4456'],
            inCityAccount: IsInCityAccount.YES,
            deliveryMethod: DeliveryMethod.POSTAL,
            date: null,
          },
          {
            birthNumbers: ['003322/4455', '003322/4456'],
            inCityAccount: IsInCityAccount.YES,
            deliveryMethod: DeliveryMethod.EDESK,
            date: null,
          },
          {
            birthNumbers: ['003322/4455', '003322/4456'],
            inCityAccount: IsInCityAccount.YES,
            deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
            date: '2024-01-01',
          },
        ]),
      ).rejects.toThrow()

      expect(querySpy).not.toHaveBeenCalled()
      expect(closeSpy).toHaveBeenCalled()
    })
  })
})

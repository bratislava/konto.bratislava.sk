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
    jest
      .mocked(mssql.Request)
      .mockReturnValue(mockRequest as unknown as mssql.Request)

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

  describe('getDataForUpdate', () => {
    beforeEach(() => {
      service['waitForConnection'] = jest.fn().mockResolvedValue(true) // So that it will not be stuck
    })

    it('should return data for given variable symbols', async () => {
      const requestSpy = jest.spyOn(mssql, 'Request')
      const querySpy = jest.spyOn(mockRequest, 'query').mockResolvedValue({
        recordset: [{ mockData: 'mockData' }],
      })
      const closeSpy = jest.spyOn(mockConnection, 'close')

      const result = await service.getDataForUpdate(
        ['123456', '789012'],
        [2024],
      )

      expect(requestSpy).toHaveBeenCalledTimes(1)
      expect(querySpy).toHaveBeenCalledTimes(1)
      expect(closeSpy).toHaveBeenCalledTimes(1)
      expect(result).toEqual([{ mockData: 'mockData' }])
    })

    it('should throw if something throws', async () => {
      jest.spyOn(mssql, 'Request').mockImplementation(() => {
        throw new Error('mock-error')
      })
      const querySpy = jest.spyOn(mockRequest, 'query')
      const closeSpy = jest.spyOn(mockConnection, 'close')

      await expect(
        service.getDataForUpdate(['123456', '789012'], [2024, 2025]),
      ).rejects.toThrow()

      expect(querySpy).not.toHaveBeenCalled()
      expect(closeSpy).toHaveBeenCalled()
    })
  })

  describe('waitForConnection', () => {
    it('should resolve if connection is established', async () => {
      await service['waitForConnection']({
        connected: true,
      } as mssql.ConnectionPool)
      expect(true).toBe(true) // Just to ensure it resolves
    })

    it('should throw if connection fails after deadline', async () => {
      await expect(
        service['waitForConnection']({
          connected: false,
        } as mssql.ConnectionPool),
      ).rejects.toThrow()
    }, 11_000) // 11 seconds to allow for the timeout

    it('should resolve if at first the connection is not established but later it is', async () => {
      let isConnected = false
      let connectedCheckCalls = 0 // Counter for how many times we checked the connection

      // After 5 seconds, set isConnected to true
      setTimeout(() => {
        isConnected = true
      }, 1000)

      const connectionPool = {
        connectedCalls: 0,
        get connected() {
          connectedCheckCalls += 1
          return isConnected
        },
      } as unknown as mssql.ConnectionPool

      await service['waitForConnection'](connectionPool)
      expect(connectionPool.connected).toBe(true)
      expect(connectedCheckCalls).toBeGreaterThan(1) // Should check at least once before timeout
    })
  })
})

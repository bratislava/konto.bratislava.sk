import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import * as mssql from 'mssql'

import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { DeliveryMethod, IsInCityAccount } from '../../types/noris.enums'
import { NorisConnectionService } from '../noris-connection.service'
import {
  NorisDeliveryMethodService,
  UpdateNorisDeliveryMethodsData,
} from '../noris-delivery-method.service'
import { NorisValidatorService } from '../noris-validator.service'

interface NorisDeliveryMethodsUpdateResult {
  cislo_subjektu: number
}

const mockQuery = jest.fn()
const mockInput = jest.fn()

const mockRequest = createMock<mssql.Request>({
  query: mockQuery,
  input: mockInput,
})

jest.mock('mssql', () => ({
  Request: jest.fn().mockImplementation(() => mockRequest),
  VarChar: jest.fn().mockImplementation((length: number) => ({ length })),
  DateTime: jest.fn(),
}))

describe('NorisDeliveryMethodService', () => {
  let service: NorisDeliveryMethodService
  let connectionService: NorisConnectionService
  let norisValidatorService: NorisValidatorService

  beforeEach(async () => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
    jest.mocked(mssql.Request).mockImplementation(() => mockRequest)

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NorisDeliveryMethodService,
        {
          provide: NorisConnectionService,
          useValue: createMock<NorisConnectionService>(),
        },
        ThrowerErrorGuard,
        {
          provide: NorisValidatorService,
          useValue: createMock<NorisValidatorService>(),
        },
      ],
    }).compile()

    service = module.get<NorisDeliveryMethodService>(NorisDeliveryMethodService)
    connectionService = module.get<NorisConnectionService>(NorisConnectionService)
    norisValidatorService = module.get<NorisValidatorService>(NorisValidatorService)

    jest
      .spyOn(norisValidatorService, 'validateNorisData')
      .mockImplementation((schema, data) => (data as unknown[]).map((item) => schema.parse(item)))

    jest.spyOn(connectionService, 'withConnection').mockImplementation(async (fn) => {
      return fn(createMock<mssql.ConnectionPool>())
    })
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('updateDeliveryMethods', () => {
    it('should successfully update delivery methods for EDESK', async () => {
      const mockData = {
        '010366/4554': { deliveryMethod: DeliveryMethod.EDESK },
      } as const

      const mockUpdateResult = [{ cislo_subjektu: 12_345 }]
      const mockBirthNumbersResult = [{ ico: '010366/4554' }]

      mockQuery
        .mockResolvedValueOnce({ recordset: mockUpdateResult })
        .mockResolvedValueOnce({ recordset: mockBirthNumbersResult })

      const result = await service.updateDeliveryMethods({ data: mockData })

      expect(result).toEqual({ birthNumbers: ['010366/4554'] })
      expect(connectionService.withConnection).toHaveBeenCalled()
      expect(mockRequest.input).toHaveBeenCalledWith(
        'dkba_stav',
        expect.anything(),
        IsInCityAccount.YES
      )
      expect(mockRequest.input).toHaveBeenCalledWith(
        'dkba_sposob_dorucovania',
        expect.anything(),
        DeliveryMethod.EDESK
      )
    })

    it('should successfully update delivery methods for POSTAL', async () => {
      const mockData = {
        '010366/4554': { deliveryMethod: DeliveryMethod.POSTAL },
      } as const

      mockQuery
        .mockResolvedValueOnce({ recordset: [{ cislo_subjektu: 12_345 }] })
        .mockResolvedValueOnce({ recordset: [{ ico: '010366/4554' }] })

      const result = await service.updateDeliveryMethods({ data: mockData })

      expect(result).toEqual({ birthNumbers: ['010366/4554'] })
      expect(mockRequest.input).toHaveBeenCalledWith(
        'dkba_sposob_dorucovania',
        expect.anything(),
        DeliveryMethod.EDESK // POSTAL is mapped to EDESK in Noris
      )
    })

    it('should successfully update delivery methods for CITY_ACCOUNT with date', async () => {
      const mockData = {
        '010366/4554': { deliveryMethod: DeliveryMethod.CITY_ACCOUNT, date: '2024-01-01' },
      } as const

      mockQuery
        .mockResolvedValueOnce({ recordset: [{ cislo_subjektu: 12_345 }] })
        .mockResolvedValueOnce({ recordset: [{ ico: '010366/4554' }] })

      const result = await service.updateDeliveryMethods({ data: mockData })

      expect(result).toEqual({ birthNumbers: ['010366/4554'] })
      expect(mockRequest.input).toHaveBeenCalledWith(
        'dkba_datum_suhlasu',
        expect.anything(),
        expect.any(Date)
      )
      expect(mockRequest.input).toHaveBeenCalledWith(
        'dkba_sposob_dorucovania',
        expect.anything(),
        DeliveryMethod.CITY_ACCOUNT
      )
    })

    it('should throw error when CITY_ACCOUNT delivery method is missing date', async () => {
      const invalidCityAccountData = {
        '010366/4554': { deliveryMethod: DeliveryMethod.CITY_ACCOUNT },
      } as unknown as UpdateNorisDeliveryMethodsData

      await expect(service.updateDeliveryMethods({ data: invalidCityAccountData })).rejects.toThrow(
        'Date must be provided'
      )
    })

    it('should handle multiple birth numbers with different delivery methods', async () => {
      const mockData = {
        '010366/4554': { deliveryMethod: DeliveryMethod.EDESK },
        '010366/554': { deliveryMethod: DeliveryMethod.POSTAL },
        '017766/2244': { deliveryMethod: DeliveryMethod.CITY_ACCOUNT, date: '2024-01-01' },
      } as const

      mockQuery
        .mockResolvedValueOnce({ recordset: [{ cislo_subjektu: 12_345 }] })
        .mockResolvedValueOnce({ recordset: [{ cislo_subjektu: 12_346 }] })
        .mockResolvedValueOnce({ recordset: [{ cislo_subjektu: 12_347 }] })
        .mockResolvedValueOnce({
          recordset: [{ ico: '010366/4554' }, { ico: '010366/554' }, { ico: '017766/2244' }],
        })

      const result = await service.updateDeliveryMethods({ data: mockData })

      expect(result.birthNumbers).toHaveLength(3)
      expect(result.birthNumbers).toContain('010366/4554')
      expect(result.birthNumbers).toContain('010366/554')
      expect(result.birthNumbers).toContain('017766/2244')
    })

    it('should return empty birthNumbers when no updates are provided', async () => {
      const mockData = {} as const

      const result = await service.updateDeliveryMethods({ data: mockData })

      expect(result).toEqual({ birthNumbers: [] })
      expect(connectionService.withConnection).not.toHaveBeenCalled()
    })

    it('should filter out invalid delivery methods', async () => {
      const mockData = {
        '010366/4554': { deliveryMethod: DeliveryMethod.EDESK },
        '010366/554': { deliveryMethod: 'INVALID_METHOD' as DeliveryMethod },
      } as unknown as UpdateNorisDeliveryMethodsData

      mockQuery
        .mockResolvedValueOnce({ recordset: [{ cislo_subjektu: 12_345 }] })
        .mockResolvedValueOnce({ recordset: [{ ico: '010366/4554' }] })

      const result = await service.updateDeliveryMethods({ data: mockData })

      expect(result.birthNumbers).toEqual(['010366/4554'])
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('uda_21_organizacia_mag'))
    })

    it('should handle connection errors and throw appropriate exception', async () => {
      const mockData = {
        '010366/4554': { deliveryMethod: DeliveryMethod.EDESK },
      } as const

      jest
        .spyOn(connectionService, 'withConnection')
        .mockRejectedValue(new Error('Database connection failed'))

      await expect(service.updateDeliveryMethods({ data: mockData })).rejects.toThrow()
    })

    it('should handle empty update results', async () => {
      const mockData = {
        '010366/4554': { deliveryMethod: DeliveryMethod.EDESK },
      } as const

      mockQuery.mockResolvedValueOnce({ recordset: [] })

      let callCount = 0
      jest.spyOn(connectionService, 'withConnection').mockImplementation(async (fn) => {
        callCount++
        return fn({} as mssql.ConnectionPool)
      })

      const result = await service.updateDeliveryMethods({ data: mockData })

      expect(result).toEqual({ birthNumbers: [] })
      expect(callCount).toBe(1) // Only update, no birth-number lookup needed
    })

    it('should handle errors when getting birth numbers for updated subjects', async () => {
      const mockData = {
        '010366/4554': { deliveryMethod: DeliveryMethod.EDESK },
      } as const

      mockQuery
        .mockResolvedValueOnce({ recordset: [{ cislo_subjektu: 12_345 }] })
        .mockRejectedValueOnce(new Error('Query failed'))

      jest
        .spyOn(connectionService, 'withConnection')
        .mockImplementation(async (fn) => fn({} as mssql.ConnectionPool))

      await expect(service.updateDeliveryMethods({ data: mockData })).rejects.toThrow()
    })

    it('should add slash to birth numbers correctly', async () => {
      const mockData = {
        '0103664554': { deliveryMethod: DeliveryMethod.EDESK }, // Without slash
      } as const

      mockQuery
        .mockResolvedValueOnce({ recordset: [{ cislo_subjektu: 12_345 }] })
        .mockResolvedValueOnce({ recordset: [{ ico: '010366/4554' }] })

      const result = await service.updateDeliveryMethods({ data: mockData })

      expect(result.birthNumbers).toEqual(['010366/4554'])
      expect(mockRequest.input).toHaveBeenCalledWith(
        'birthnumber0',
        expect.anything(),
        '010366/4554'
      )
    })

    it('should handle multiple birth numbers in a single update', async () => {
      const mockData = {
        '010366/4554': { deliveryMethod: DeliveryMethod.EDESK },
        '010366/4555': { deliveryMethod: DeliveryMethod.EDESK },
      } as const

      mockQuery
        .mockResolvedValueOnce({
          recordset: [{ cislo_subjektu: 12_345 }, { cislo_subjektu: 12_346 }],
        })
        .mockResolvedValueOnce({ recordset: [{ ico: '010366/4554' }, { ico: '010366/4555' }] })

      const result = await service.updateDeliveryMethods({ data: mockData })

      expect(result.birthNumbers).toHaveLength(2)
      expect(result.birthNumbers).toContain('010366/4554')
      expect(result.birthNumbers).toContain('010366/4555')

      const numberOfUpdateCalls = (mockQuery.mock.calls as string[][]).filter((call) =>
        call[0].includes('uda_21_organizacia_mag')
      ).length
      expect(numberOfUpdateCalls).toBe(1)
      expect(mockInput).toHaveBeenCalledWith('birthnumber0', expect.anything(), '010366/4554')
      expect(mockInput).toHaveBeenCalledWith('birthnumber1', expect.anything(), '010366/4555')
    })

    it('should group all delivery methods into single query, other than CITY_ACCOUNT', async () => {
      const mockData = {
        '010366/4554': { deliveryMethod: DeliveryMethod.EDESK },
        '010366/4555': { deliveryMethod: DeliveryMethod.EDESK },
        '010366/4556': { deliveryMethod: DeliveryMethod.CITY_ACCOUNT, date: '2024-01-01' },
        '010366/4557': { deliveryMethod: DeliveryMethod.POSTAL },
        '010366/4558': { deliveryMethod: DeliveryMethod.POSTAL },
      } as const

      mockQuery
        .mockResolvedValueOnce({
          recordset: [{ cislo_subjektu: 12_345 }, { cislo_subjektu: 12_346 }],
        })
        .mockResolvedValueOnce({ recordset: [{ cislo_subjektu: 12_347 }] })
        .mockResolvedValueOnce({
          recordset: [{ cislo_subjektu: 12_348 }, { cislo_subjektu: 12_349 }],
        })
        .mockResolvedValueOnce({
          recordset: [
            { ico: '010366/4554' },
            { ico: '010366/4555' },
            { ico: '010366/4556' },
            { ico: '010366/4557' },
            { ico: '010366/4558' },
          ],
        })

       
      const executeDeliveryMethodUpdateSpy = jest.spyOn(
        service as any,
        'executeDeliveryMethodUpdate'
      )

      const result = await service.updateDeliveryMethods({ data: mockData })

      expect(result.birthNumbers).toHaveLength(5)
      expect(executeDeliveryMethodUpdateSpy).toHaveBeenCalledTimes(3)
      expect(executeDeliveryMethodUpdateSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          birthNumbers: ['010366/4554', '010366/4555'],
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: DeliveryMethod.EDESK,
          date: null,
        })
      )
      expect(executeDeliveryMethodUpdateSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          birthNumbers: ['010366/4556'],
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
          date: '2024-01-01',
        })
      )
      expect(executeDeliveryMethodUpdateSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          birthNumbers: ['010366/4557', '010366/4558'],
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: DeliveryMethod.POSTAL,
          date: null,
        })
      )
    })
  })

  describe('removeDeliveryMethodsFromNoris', () => {
    it('should successfully remove delivery methods from Noris', async () => {
      mockQuery
        .mockResolvedValueOnce({ recordset: [{ cislo_subjektu: 12_345 }] })
        .mockResolvedValueOnce({ recordset: [{ ico: '010366/4554' }] })

      await service.removeDeliveryMethodsFromNoris('010366/4554')

      expect(connectionService.withConnection).toHaveBeenCalled()
      expect(mockRequest.input).toHaveBeenCalledWith(
        'dkba_stav',
        expect.anything(),
        IsInCityAccount.NO
      )
      expect(mockRequest.input).toHaveBeenCalledWith(
        'dkba_sposob_dorucovania',
        expect.anything(),
        null
      )
      expect(mockRequest.input).toHaveBeenCalledWith(
        'birthnumber0',
        expect.anything(),
        '010366/4554'
      )
    })

    it('should add slash to birth number when removing delivery methods', async () => {
      mockQuery
        .mockResolvedValueOnce({ recordset: [{ cislo_subjektu: 12_345 }] })
        .mockResolvedValueOnce({ recordset: [{ ico: '010366/4554' }] })

      await service.removeDeliveryMethodsFromNoris('0103664554') // Without slash

      expect(mockRequest.input).toHaveBeenCalledWith(
        'birthnumber0',
        expect.anything(),
        '010366/4554'
      )
    })
  })

  describe('private methods', () => {
    describe('updateDeliveryMethodsInNoris', () => {
      it('should successfully update delivery methods and return birth numbers', async () => {
        const mockData = [
          {
            birthNumbers: ['010366/4554', '010366/4555'],
            inCityAccount: IsInCityAccount.YES,
            deliveryMethod: DeliveryMethod.EDESK,
            date: null,
          },
        ]

        mockQuery
          .mockResolvedValueOnce({
            recordset: [{ cislo_subjektu: 12_345 }, { cislo_subjektu: 12_346 }],
          })
          .mockResolvedValueOnce({ recordset: [{ ico: '010366/4554' }, { ico: '010366/4555' }] })

        const withConnectionSpy = jest
          .spyOn(connectionService, 'withConnection')
          .mockImplementation(async (fn) => fn({} as mssql.ConnectionPool))

        const result = await service['updateDeliveryMethodsInNoris'](mockData)

        expect(result).toEqual(['010366/4554', '010366/4555'])
        expect(withConnectionSpy).toHaveBeenCalledTimes(2) // update + birth-number lookup
      })

      it('should handle connection errors during update', async () => {
        const mockData = [
          {
            birthNumbers: ['010366/4554'],
            inCityAccount: IsInCityAccount.YES,
            deliveryMethod: DeliveryMethod.EDESK,
            date: null,
          },
        ]

        jest
          .spyOn(connectionService, 'withConnection')
          .mockRejectedValue(new Error('Database connection failed'))

        await expect(service['updateDeliveryMethodsInNoris'](mockData)).rejects.toThrow(
          'Database connection failed'
        )
      })

      it('should handle multiple update items', async () => {
        const mockData = [
          {
            birthNumbers: ['010366/4554'],
            inCityAccount: IsInCityAccount.YES,
            deliveryMethod: DeliveryMethod.EDESK,
            date: null,
          },
          {
            birthNumbers: ['010366/4555'],
            inCityAccount: IsInCityAccount.YES,
            deliveryMethod: DeliveryMethod.POSTAL,
            date: null,
          },
        ]

        mockQuery
          .mockResolvedValueOnce({ recordset: [{ cislo_subjektu: 12_345 }] })
          .mockResolvedValueOnce({ recordset: [{ cislo_subjektu: 12_346 }] })
          .mockResolvedValueOnce({ recordset: [{ ico: '010366/4554' }, { ico: '010366/4555' }] })

        jest
          .spyOn(connectionService, 'withConnection')
          .mockImplementation(async (fn) => fn({} as mssql.ConnectionPool))

        const result = await service['updateDeliveryMethodsInNoris'](mockData)

        expect(result).toEqual(['010366/4554', '010366/4555'])
        expect(mockRequest.query).toHaveBeenCalledTimes(3) // 2 updates + 1 birth-number lookup
      })
    })

    describe('executeDeliveryMethodUpdate', () => {
      it('should execute delivery method update with correct parameters', async () => {
        const dataItem = {
          birthNumbers: ['010366/4554', '010366/4555'],
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: DeliveryMethod.EDESK,
          date: null,
        }

        mockQuery.mockResolvedValueOnce({
          recordset: [{ cislo_subjektu: 12_345 }, { cislo_subjektu: 12_346 }],
        })

        const result = await service['executeDeliveryMethodUpdate'](
          {} as mssql.ConnectionPool,
          dataItem
        )

        expect(result).toEqual([{ cislo_subjektu: 12_345 }, { cislo_subjektu: 12_346 }])
        expect(mockRequest.input).toHaveBeenCalledWith(
          'dkba_stav',
          expect.anything(),
          IsInCityAccount.YES
        )
        expect(mockRequest.input).toHaveBeenCalledWith(
          'dkba_datum_suhlasu',
          expect.anything(),
          null
        )
        expect(mockRequest.input).toHaveBeenCalledWith(
          'dkba_sposob_dorucovania',
          expect.anything(),
          DeliveryMethod.EDESK
        )
        expect(mockRequest.input).toHaveBeenCalledWith(
          'birthnumber0',
          expect.anything(),
          '010366/4554'
        )
        expect(mockRequest.input).toHaveBeenCalledWith(
          'birthnumber1',
          expect.anything(),
          '010366/4555'
        )
      })

      it('should handle date parameter correctly', async () => {
        const dataItem = {
          birthNumbers: ['010366/4554'],
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
          date: '2024-01-15',
        }

        mockQuery.mockResolvedValueOnce({ recordset: [{ cislo_subjektu: 12_345 }] })

        await service['executeDeliveryMethodUpdate']({} as mssql.ConnectionPool, dataItem)

        expect(mockRequest.input).toHaveBeenCalledWith(
          'dkba_datum_suhlasu',
          expect.anything(),
          new Date('2024-01-15')
        )
      })

      it('should map POSTAL to EDESK correctly', async () => {
        const dataItem = {
          birthNumbers: ['010366/4554'],
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: DeliveryMethod.POSTAL,
          date: null,
        }

        mockQuery.mockResolvedValueOnce({ recordset: [{ cislo_subjektu: 12_345 }] })

        await service['executeDeliveryMethodUpdate']({} as mssql.ConnectionPool, dataItem)

        expect(mockRequest.input).toHaveBeenCalledWith(
          'dkba_sposob_dorucovania',
          expect.anything(),
          DeliveryMethod.EDESK // POSTAL is mapped to EDESK
        )
      })
    })

    describe('getBirthNumbersWithUpdatedDeliveryMethods', () => {
      it('should return birth numbers for updated subjects', async () => {
        const mockData: NorisDeliveryMethodsUpdateResult[] = [
          { cislo_subjektu: 12_345 },
          { cislo_subjektu: 12_346 },
        ]

        mockQuery.mockResolvedValueOnce({
          recordset: [{ ico: '010366/4554' }, { ico: '010366/4555' }],
        })

        jest
          .spyOn(connectionService, 'withConnection')
          .mockImplementation(async (fn) => fn({} as mssql.ConnectionPool))

        const result = await service['getBirthNumbersWithUpdatedDeliveryMethods'](mockData)

        expect(result).toEqual(['010366/4554', '010366/4555'])
        expect(mockRequest.input).toHaveBeenCalledWith('subject0', 12_345)
        expect(mockRequest.input).toHaveBeenCalledWith('subject1', 12_346)
      })

      it('should return empty array when no subjects provided', async () => {
        const result = await service['getBirthNumbersWithUpdatedDeliveryMethods']([])

        expect(result).toEqual([])
        expect(connectionService.withConnection).not.toHaveBeenCalled()
      })

      it('should handle connection errors', async () => {
        jest
          .spyOn(connectionService, 'withConnection')
          .mockRejectedValue(new Error('Database connection failed'))

        await expect(
          service['getBirthNumbersWithUpdatedDeliveryMethods']([{ cislo_subjektu: 12_345 }])
        ).rejects.toThrow('Database connection failed')
      })

      it('should trim birth numbers from ico field', async () => {
        mockQuery.mockResolvedValueOnce({ recordset: [{ ico: '  010366/4554  ' }] })

        jest
          .spyOn(connectionService, 'withConnection')
          .mockImplementation(async (fn) => fn({} as mssql.ConnectionPool))

        const result = await service['getBirthNumbersWithUpdatedDeliveryMethods']([
          { cislo_subjektu: 12_345 },
        ])

        expect(result).toEqual(['010366/4554'])
      })
    })
  })
})

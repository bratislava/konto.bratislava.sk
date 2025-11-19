/* eslint-disable no-secrets/no-secrets */
import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import * as mssql from 'mssql'

import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { DeliveryMethod, IsInCityAccount } from '../../utils/noris.types'
import { NorisConnectionSubservice } from '../noris-connection.subservice'
import { NorisDeliveryMethodSubservice } from '../noris-delivery-method.subservice'
import { NorisValidatorSubservice } from '../noris-validator.subservice'

const mockRequest = {
  query: jest.fn(),
  input: jest.fn(),
}

jest.mock('mssql', () => ({
  Request: jest.fn().mockImplementation(() => mockRequest),
  VarChar: jest.fn().mockImplementation((length) => ({ length })),
  DateTime: jest.fn(),
}))

describe('NorisDeliveryMethodSubservice', () => {
  let service: NorisDeliveryMethodSubservice
  let connectionService: NorisConnectionSubservice
  let norisValidatorSubservice: NorisValidatorSubservice

  beforeEach(async () => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
    jest
      .mocked(mssql.Request)
      .mockReturnValue(mockRequest as unknown as mssql.Request)

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NorisDeliveryMethodSubservice,
        {
          provide: NorisConnectionSubservice,
          useValue: createMock<NorisConnectionSubservice>(),
        },
        ThrowerErrorGuard,
        {
          provide: NorisValidatorSubservice,
          useValue: createMock<NorisValidatorSubservice>(),
        },
      ],
    }).compile()

    service = module.get<NorisDeliveryMethodSubservice>(
      NorisDeliveryMethodSubservice,
    )
    connectionService = module.get<NorisConnectionSubservice>(
      NorisConnectionSubservice,
    )
    norisValidatorSubservice = module.get<NorisValidatorSubservice>(
      NorisValidatorSubservice,
    )

    jest
      .spyOn(norisValidatorSubservice, 'validateNorisData')
      .mockImplementation((schema, data) => {
        if (Array.isArray(data)) {
          return data.map((item) => schema.parse(item))
        }
        return schema.parse(data)
      })

    jest
      .spyOn(connectionService, 'withConnection')
      .mockImplementation(async (fn) => {
        return fn({} as mssql.ConnectionPool)
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

      mockRequest.query
        .mockResolvedValueOnce({ recordset: mockUpdateResult })
        .mockResolvedValueOnce({ recordset: mockBirthNumbersResult })

      const result = await service.updateDeliveryMethods({ data: mockData })

      expect(result).toEqual({
        birthNumbers: ['010366/4554'],
      })
      expect(connectionService.withConnection).toHaveBeenCalled()
      expect(mockRequest.input).toHaveBeenCalledWith(
        'dkba_stav',
        expect.anything(),
        IsInCityAccount.YES,
      )
      expect(mockRequest.input).toHaveBeenCalledWith(
        'dkba_sposob_dorucovania',
        expect.anything(),
        DeliveryMethod.EDESK,
      )
    })

    it('should successfully update delivery methods for POSTAL', async () => {
      const mockData = {
        '010366/4554': { deliveryMethod: DeliveryMethod.POSTAL },
      } as const

      const mockUpdateResult = [{ cislo_subjektu: 12_345 }]

      const mockBirthNumbersResult = [{ ico: '010366/4554' }]

      mockRequest.query
        .mockResolvedValueOnce({ recordset: mockUpdateResult })
        .mockResolvedValueOnce({ recordset: mockBirthNumbersResult })

      const result = await service.updateDeliveryMethods({ data: mockData })

      expect(result).toEqual({
        birthNumbers: ['010366/4554'],
      })
      expect(mockRequest.input).toHaveBeenCalledWith(
        'dkba_sposob_dorucovania',
        expect.anything(),
        DeliveryMethod.EDESK, // POSTAL is mapped to EDESK in Noris
      )
    })

    it('should successfully update delivery methods for CITY_ACCOUNT with date', async () => {
      const mockData = {
        '010366/4554': {
          deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
          date: '2024-01-01',
        },
      } as const

      const mockUpdateResult = [{ cislo_subjektu: 12_345 }]

      const mockBirthNumbersResult = [{ ico: '010366/4554' }]

      mockRequest.query
        .mockResolvedValueOnce({ recordset: mockUpdateResult })
        .mockResolvedValueOnce({ recordset: mockBirthNumbersResult })

      const result = await service.updateDeliveryMethods({ data: mockData })

      expect(result).toEqual({
        birthNumbers: ['010366/4554'],
      })
      expect(mockRequest.input).toHaveBeenCalledWith(
        'dkba_datum_suhlasu',
        expect.anything(),
        expect.any(Date),
      )
      expect(mockRequest.input).toHaveBeenCalledWith(
        'dkba_sposob_dorucovania',
        expect.anything(),
        DeliveryMethod.CITY_ACCOUNT,
      )
    })

    it('should throw error when CITY_ACCOUNT delivery method is missing date', async () => {
      const mockData = {
        '010366/4554': {
          deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
        },
      } as any

      await expect(
        service.updateDeliveryMethods({ data: mockData }),
      ).rejects.toThrow('Date must be provided')
    })

    it('should handle multiple birth numbers with different delivery methods', async () => {
      const mockData = {
        '010366/4554': { deliveryMethod: DeliveryMethod.EDESK },
        '010366/554': { deliveryMethod: DeliveryMethod.POSTAL },
        '017766/2244': {
          deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
          date: '2024-01-01',
        },
      } as const

      const mockUpdateResult1 = [{ cislo_subjektu: 12_345 }]
      const mockUpdateResult2 = [{ cislo_subjektu: 12_346 }]
      const mockUpdateResult3 = [{ cislo_subjektu: 12_347 }]

      const mockBirthNumbersResult = [
        { ico: '010366/4554' },
        { ico: '010366/554' },
        { ico: '017766/2244' },
      ]

      mockRequest.query
        .mockResolvedValueOnce({ recordset: mockUpdateResult1 })
        .mockResolvedValueOnce({ recordset: mockUpdateResult2 })
        .mockResolvedValueOnce({ recordset: mockUpdateResult3 })
        .mockResolvedValueOnce({ recordset: mockBirthNumbersResult })

      const result = await service.updateDeliveryMethods({ data: mockData })

      expect(result.birthNumbers).toHaveLength(3)
      expect(result.birthNumbers).toContain('010366/4554')
      expect(result.birthNumbers).toContain('010366/554')
      expect(result.birthNumbers).toContain('017766/2244')
    })

    it('should return empty birthNumbers when no updates are provided', async () => {
      const mockData = {} as const

      const result = await service.updateDeliveryMethods({ data: mockData })

      expect(result).toEqual({
        birthNumbers: [],
      })
      expect(connectionService.withConnection).not.toHaveBeenCalled()
    })

    it('should filter out invalid delivery methods', async () => {
      const mockData = {
        '010366/4554': { deliveryMethod: DeliveryMethod.EDESK },
        '010366/554': { deliveryMethod: 'INVALID_METHOD' as DeliveryMethod },
      } as any

      const mockUpdateResult = [{ cislo_subjektu: 12_345 }]
      const mockBirthNumbersResult = [{ ico: '010366/4554' }]

      mockRequest.query
        .mockResolvedValueOnce({ recordset: mockUpdateResult })
        .mockResolvedValueOnce({ recordset: mockBirthNumbersResult })

      const executeDeliveryMethodUpdateSpy = jest.spyOn(
        service as any,
        'executeDeliveryMethodUpdate',
      )

      const result = await service.updateDeliveryMethods({ data: mockData })

      expect(result.birthNumbers).toEqual(['010366/4554'])
      expect(executeDeliveryMethodUpdateSpy).toHaveBeenCalledTimes(1)
    })

    it('should handle connection errors and throw appropriate exception', async () => {
      const mockData = {
        '010366/4554': { deliveryMethod: DeliveryMethod.EDESK },
      } as const

      const connectionError = new Error('Database connection failed')
      jest
        .spyOn(connectionService, 'withConnection')
        .mockImplementation(async () => {
          throw connectionError
        })

      await expect(
        service.updateDeliveryMethods({ data: mockData }),
      ).rejects.toThrow()
    })

    it('should handle empty update results', async () => {
      const mockData = {
        '010366/4554': { deliveryMethod: DeliveryMethod.EDESK },
      } as const

      // First query returns empty (no subjects updated)
      // Second query should not be called because getBirthNumbersWithUpdatedDeliveryMethods
      // returns early when data is empty
      mockRequest.query.mockResolvedValueOnce({ recordset: [] })

      let callCount = 0
      jest
        .spyOn(connectionService, 'withConnection')
        .mockImplementation(async (fn) => {
          callCount += 1
          return fn({} as mssql.ConnectionPool)
        })

      const result = await service.updateDeliveryMethods({ data: mockData })

      expect(result).toEqual({
        birthNumbers: [],
      })
      // Only one withConnection call should happen (for the update)
      // The second one (for getting birth numbers) should not happen because data is empty
      expect(callCount).toBe(1)
    })

    it('should handle errors when getting birth numbers for updated subjects', async () => {
      const mockData = {
        '010366/4554': { deliveryMethod: DeliveryMethod.EDESK },
      } as const

      const mockUpdateResult = [{ cislo_subjektu: 12_345 }]

      mockRequest.query
        .mockResolvedValueOnce({ recordset: mockUpdateResult })
        .mockRejectedValueOnce(new Error('Query failed'))

      jest
        .spyOn(connectionService, 'withConnection')
        .mockImplementation(async (fn, errorHandler) => {
          try {
            const result = await fn({} as mssql.ConnectionPool)
            return result
          } catch (error) {
            return errorHandler(error)
          }
        })

      await expect(
        service.updateDeliveryMethods({ data: mockData }),
      ).rejects.toThrow()
    })

    it('should add slash to birth numbers correctly', async () => {
      const mockData = {
        '0103664554': { deliveryMethod: DeliveryMethod.EDESK }, // Without slash
      } as const

      const mockUpdateResult = [{ cislo_subjektu: 12_345 }]
      const mockBirthNumbersResult = [{ ico: '010366/4554' }]

      mockRequest.query
        .mockResolvedValueOnce({ recordset: mockUpdateResult })
        .mockResolvedValueOnce({ recordset: mockBirthNumbersResult })

      const result = await service.updateDeliveryMethods({ data: mockData })

      expect(result.birthNumbers).toEqual(['010366/4554'])
      // Verify that the input was called with birth number containing slash
      expect(mockRequest.input).toHaveBeenCalledWith(
        'birthnumber0',
        expect.anything(),
        '010366/4554',
      )
    })

    it('should handle multiple birth numbers in a single update', async () => {
      const mockData = {
        '010366/4554': { deliveryMethod: DeliveryMethod.EDESK },
        '010366/4555': { deliveryMethod: DeliveryMethod.EDESK },
      } as const

      // Both birth numbers are updated in a single query
      const mockUpdateResult = [
        { cislo_subjektu: 12_345 },
        { cislo_subjektu: 12_346 },
      ]

      const mockBirthNumbersResult = [
        { ico: '010366/4554' },
        { ico: '010366/4555' },
      ]

      mockRequest.query
        .mockResolvedValueOnce({ recordset: mockUpdateResult })
        .mockResolvedValueOnce({ recordset: mockBirthNumbersResult })

      const executeDeliveryMethodUpdateSpy = jest.spyOn(
        service as any,
        'executeDeliveryMethodUpdate',
      )

      const result = await service.updateDeliveryMethods({ data: mockData })

      expect(result.birthNumbers).toHaveLength(2)
      expect(result.birthNumbers).toContain('010366/4554')
      expect(result.birthNumbers).toContain('010366/4555')

      // it should group the birth numbers into a single query
      expect(executeDeliveryMethodUpdateSpy).toHaveBeenCalledTimes(1)
      expect(executeDeliveryMethodUpdateSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          birthNumbers: ['010366/4554', '010366/4555'],
        }),
      )
    })

    it('should group all delivery methods into single query, other than CITY_ACCOUNT', async () => {
      const mockData = {
        '010366/4554': { deliveryMethod: DeliveryMethod.EDESK },
        '010366/4555': { deliveryMethod: DeliveryMethod.EDESK },
        '010366/4556': {
          deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
          date: '2024-01-01',
        },
        '010366/4557': { deliveryMethod: DeliveryMethod.POSTAL },
        '010366/4558': { deliveryMethod: DeliveryMethod.POSTAL },
      } as const

      const mockUpdateResult1 = [
        { cislo_subjektu: 12_345 },
        { cislo_subjektu: 12_346 },
      ]
      const mockUpdateResult2 = [{ cislo_subjektu: 12_347 }]
      const mockUpdateResult3 = [
        { cislo_subjektu: 12_348 },
        { cislo_subjektu: 12_349 },
      ]
      const mockBirthNumbersResult = [
        { ico: '010366/4554' },
        { ico: '010366/4555' },
        { ico: '010366/4556' },
        { ico: '010366/4557' },
        { ico: '010366/4558' },
      ]

      mockRequest.query
        .mockResolvedValueOnce({ recordset: mockUpdateResult1 })
        .mockResolvedValueOnce({ recordset: mockUpdateResult2 })
        .mockResolvedValueOnce({ recordset: mockUpdateResult3 })
        .mockResolvedValueOnce({ recordset: mockBirthNumbersResult })

      const executeDeliveryMethodUpdateSpy = jest.spyOn(
        service as any,
        'executeDeliveryMethodUpdate',
      )

      const result = await service.updateDeliveryMethods({ data: mockData })

      expect(result.birthNumbers).toHaveLength(5)
      expect(result.birthNumbers).toContain('010366/4554')
      expect(result.birthNumbers).toContain('010366/4555')
      expect(result.birthNumbers).toContain('010366/4556')
      expect(result.birthNumbers).toContain('010366/4557')
      expect(result.birthNumbers).toContain('010366/4558')

      expect(executeDeliveryMethodUpdateSpy).toHaveBeenCalledTimes(3)
      expect(executeDeliveryMethodUpdateSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          birthNumbers: ['010366/4554', '010366/4555'],
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: DeliveryMethod.EDESK,
          date: null,
        }),
      )
      expect(executeDeliveryMethodUpdateSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          birthNumbers: ['010366/4556'],
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
          date: '2024-01-01',
        }),
      )
      expect(executeDeliveryMethodUpdateSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          birthNumbers: ['010366/4557', '010366/4558'],
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: DeliveryMethod.POSTAL,
          date: null,
        }),
      )
    })
  })

  describe('removeDeliveryMethodsFromNoris', () => {
    it('should successfully remove delivery methods from Noris', async () => {
      const birthNumber = '010366/4554'

      const mockUpdateResult = [{ cislo_subjektu: 12_345 }]
      const mockBirthNumbersResult = [{ ico: '010366/4554' }]

      mockRequest.query
        .mockResolvedValueOnce({ recordset: mockUpdateResult })
        .mockResolvedValueOnce({ recordset: mockBirthNumbersResult })

      await service.removeDeliveryMethodsFromNoris(birthNumber)

      expect(connectionService.withConnection).toHaveBeenCalled()
      expect(mockRequest.input).toHaveBeenCalledWith(
        'dkba_stav',
        expect.anything(),
        IsInCityAccount.NO,
      )
      expect(mockRequest.input).toHaveBeenCalledWith(
        'dkba_sposob_dorucovania',
        expect.anything(),
        null,
      )
      expect(mockRequest.input).toHaveBeenCalledWith(
        'birthnumber0',
        expect.anything(),
        '010366/4554',
      )
    })

    it('should add slash to birth number when removing delivery methods', async () => {
      const birthNumber = '0103664554' // Without slash

      const mockUpdateResult = [{ cislo_subjektu: 12_345 }]
      const mockBirthNumbersResult = [{ ico: '010366/4554' }]

      mockRequest.query
        .mockResolvedValueOnce({ recordset: mockUpdateResult })
        .mockResolvedValueOnce({ recordset: mockBirthNumbersResult })

      await service.removeDeliveryMethodsFromNoris(birthNumber)

      expect(mockRequest.input).toHaveBeenCalledWith(
        'birthnumber0',
        expect.anything(),
        '010366/4554', // Should have slash added
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

        const mockUpdateResult1 = [
          { cislo_subjektu: 12_345 },
          { cislo_subjektu: 12_346 },
        ]
        const mockBirthNumbersResult = [
          { ico: '010366/4554' },
          { ico: '010366/4555' },
        ]

        mockRequest.query
          .mockResolvedValueOnce({ recordset: mockUpdateResult1 })
          .mockResolvedValueOnce({ recordset: mockBirthNumbersResult })

        const withConnectionSpy = jest
          .spyOn(connectionService, 'withConnection')
          .mockImplementation(async (fn) => {
            return fn({} as mssql.ConnectionPool)
          })

        const result = await service['updateDeliveryMethodsInNoris'](mockData)

        expect(result).toEqual(['010366/4554', '010366/4555'])
        expect(withConnectionSpy).toHaveBeenCalledTimes(2) // One for update, one for getting birth numbers
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

        const connectionError = new Error('Database connection failed')
        jest
          .spyOn(connectionService, 'withConnection')
          .mockImplementation(async (fn, errorHandler) => {
            errorHandler(connectionError)
            throw connectionError
          })

        await expect(
          service['updateDeliveryMethodsInNoris'](mockData),
        ).rejects.toThrow()
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

        const mockUpdateResult1 = [{ cislo_subjektu: 12_345 }]
        const mockUpdateResult2 = [{ cislo_subjektu: 12_346 }]
        const mockBirthNumbersResult = [
          { ico: '010366/4554' },
          { ico: '010366/4555' },
        ]

        mockRequest.query
          .mockResolvedValueOnce({ recordset: mockUpdateResult1 })
          .mockResolvedValueOnce({ recordset: mockUpdateResult2 })
          .mockResolvedValueOnce({ recordset: mockBirthNumbersResult })

        jest
          .spyOn(connectionService, 'withConnection')
          .mockImplementation(async (fn) => {
            return fn({} as mssql.ConnectionPool)
          })

        const result = await service['updateDeliveryMethodsInNoris'](mockData)

        expect(result).toEqual(['010366/4554', '010366/4555'])
        expect(mockRequest.query).toHaveBeenCalledTimes(3) // 2 updates + 1 birth numbers query
      })
    })

    describe('executeDeliveryMethodUpdate', () => {
      it('should execute delivery method update with correct parameters', async () => {
        const connection = {} as mssql.ConnectionPool
        const dataItem = {
          birthNumbers: ['010366/4554', '010366/4555'],
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: DeliveryMethod.EDESK,
          date: null,
        }

        const mockUpdateResult = [
          { cislo_subjektu: 12_345 },
          { cislo_subjektu: 12_346 },
        ]

        mockRequest.query.mockResolvedValueOnce({
          recordset: mockUpdateResult,
        })

        const result = await service['executeDeliveryMethodUpdate'](
          connection,
          dataItem,
        )

        expect(result).toEqual(mockUpdateResult)
        expect(mockRequest.input).toHaveBeenCalledWith(
          'dkba_stav',
          expect.anything(),
          IsInCityAccount.YES,
        )
        expect(mockRequest.input).toHaveBeenCalledWith(
          'dkba_datum_suhlasu',
          expect.anything(),
          null,
        )
        expect(mockRequest.input).toHaveBeenCalledWith(
          'dkba_sposob_dorucovania',
          expect.anything(),
          DeliveryMethod.EDESK,
        )
        expect(mockRequest.input).toHaveBeenCalledWith(
          'birthnumber0',
          expect.anything(),
          '010366/4554',
        )
        expect(mockRequest.input).toHaveBeenCalledWith(
          'birthnumber1',
          expect.anything(),
          '010366/4555',
        )
      })

      it('should handle date parameter correctly', async () => {
        const connection = {} as mssql.ConnectionPool
        const dataItem = {
          birthNumbers: ['010366/4554'],
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
          date: '2024-01-15',
        }

        const mockUpdateResult = [{ cislo_subjektu: 12_345 }]

        mockRequest.query.mockResolvedValueOnce({
          recordset: mockUpdateResult,
        })

        await service['executeDeliveryMethodUpdate'](connection, dataItem)

        expect(mockRequest.input).toHaveBeenCalledWith(
          'dkba_datum_suhlasu',
          expect.anything(),
          new Date('2024-01-15'),
        )
      })

      it('should map POSTAL to EDESK correctly', async () => {
        const connection = {} as mssql.ConnectionPool
        const dataItem = {
          birthNumbers: ['010366/4554'],
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: DeliveryMethod.POSTAL,
          date: null,
        }

        const mockUpdateResult = [{ cislo_subjektu: 12_345 }]

        mockRequest.query.mockResolvedValueOnce({
          recordset: mockUpdateResult,
        })

        await service['executeDeliveryMethodUpdate'](connection, dataItem)

        expect(mockRequest.input).toHaveBeenCalledWith(
          'dkba_sposob_dorucovania',
          expect.anything(),
          DeliveryMethod.EDESK, // POSTAL is mapped to EDESK
        )
      })
    })

    describe('getBirthNumbersWithUpdatedDeliveryMethods', () => {
      it('should return birth numbers for updated subjects', async () => {
        const mockData = [
          { cislo_subjektu: 12_345 },
          { cislo_subjektu: 12_346 },
        ]

        const mockBirthNumbersResult = [
          { ico: '010366/4554' },
          { ico: '010366/4555' },
        ]

        mockRequest.query.mockResolvedValueOnce({
          recordset: mockBirthNumbersResult,
        })

        jest
          .spyOn(connectionService, 'withConnection')
          .mockImplementation(async (fn) => {
            return fn({} as mssql.ConnectionPool)
          })

        const result =
          await service['getBirthNumbersWithUpdatedDeliveryMethods'](mockData)

        expect(result).toEqual(['010366/4554', '010366/4555'])
        expect(mockRequest.input).toHaveBeenCalledWith('subject0', 12_345)
        expect(mockRequest.input).toHaveBeenCalledWith('subject1', 12_346)
      })

      it('should return empty array when no subjects provided', async () => {
        const mockData: any[] = []

        const result =
          await service['getBirthNumbersWithUpdatedDeliveryMethods'](mockData)

        expect(result).toEqual([])
        expect(connectionService.withConnection).not.toHaveBeenCalled()
      })

      it('should handle connection errors', async () => {
        const mockData = [{ cislo_subjektu: 12_345 }]

        const connectionError = new Error('Database connection failed')
        jest
          .spyOn(connectionService, 'withConnection')
          .mockImplementation(async (fn, errorHandler) => {
            errorHandler(connectionError)
            throw connectionError
          })

        await expect(
          service['getBirthNumbersWithUpdatedDeliveryMethods'](mockData),
        ).rejects.toThrow()
      })

      it('should trim birth numbers from ico field', async () => {
        const mockData = [{ cislo_subjektu: 12_345 }]

        const mockBirthNumbersResult = [{ ico: '  010366/4554  ' }] // With spaces

        mockRequest.query.mockResolvedValueOnce({
          recordset: mockBirthNumbersResult,
        })

        jest
          .spyOn(connectionService, 'withConnection')
          .mockImplementation(async (fn) => {
            return fn({} as mssql.ConnectionPool)
          })

        const result =
          await service['getBirthNumbersWithUpdatedDeliveryMethods'](mockData)

        expect(result).toEqual(['010366/4554']) // Should be trimmed
      })
    })
  })
})
/* eslint-enable no-secrets/no-secrets */

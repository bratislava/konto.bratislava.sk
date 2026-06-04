import { createMock } from '@golevelup/ts-jest'
import { HttpException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ConnectionPool } from 'mssql'
import * as mssql from 'mssql'

import { EdeskRecordSchema, EdeskStatus } from '../../types/noris.types'
import { NorisConnectionService } from '../noris-connection.service'
import { NorisEdeskService } from '../noris-edesk.service'
import { NorisValidatorService } from '../noris-validator.service'

describe('NorisEdeskService', () => {
  let service: NorisEdeskService
  let validatorService: NorisValidatorService
  let connectionService: NorisConnectionService

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NorisEdeskService,
        {
          provide: NorisConnectionService,
          useValue: createMock<NorisConnectionService>(),
        },
        {
          provide: NorisValidatorService,
          useValue: createMock<NorisValidatorService>(),
        },
      ],
    }).compile()

    service = module.get<NorisEdeskService>(NorisEdeskService)
    validatorService = module.get<NorisValidatorService>(NorisValidatorService)
    connectionService = module.get<NorisConnectionService>(NorisConnectionService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getExternalEdeskChecks', () => {
    it('should pass physicalPersons and legalPersons to request and return validated data', async () => {
      const physicalPersons = 5
      const legalPersons = 3
      const mockRecordset = [{ id_noris: 1 }, { id_noris: 2 }]
      const validatedData = mockRecordset as any
      const mockRequest = {
        input: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ recordset: mockRecordset }),
      }
      const mockConnection = {
        connected: true,
        close: jest.fn().mockResolvedValue(undefined),
        request: jest.fn().mockReturnValue(mockRequest),
      } as any

      jest
        .mocked(connectionService.withConnection)
        .mockImplementation((operation: any) => operation(mockConnection))
      jest.mocked(validatorService.validateNorisData).mockReturnValue(validatedData)

      const result = await service.getExternalEdeskChecks(physicalPersons, legalPersons)

      expect(result).toEqual(validatedData)
      expect(mockRequest.input).toHaveBeenCalledWith('numSO', expect.anything(), physicalPersons)
      expect(mockRequest.input).toHaveBeenCalledWith('numPO', expect.anything(), legalPersons)
      expect(mockRequest.execute).toHaveBeenCalledWith('lcs.usp21_ino_check_edesk')
      expect(validatorService.validateNorisData).toHaveBeenCalledWith(
        EdeskRecordSchema,
        mockRecordset
      )
    })

    it('should throw when validator throws', async () => {
      const validatorError = new HttpException('Validation failed', 400)
      const mockConnection = {
        connected: true,
        close: jest.fn().mockResolvedValue(undefined),
        request: jest.fn().mockReturnValue({
          input: jest.fn().mockReturnThis(),
          execute: jest.fn().mockResolvedValue({ recordset: [{}] }),
        }),
      } as any

      jest
        .mocked(connectionService.withConnection)
        .mockImplementation((operation: any) => operation(mockConnection))
      jest.mocked(validatorService.validateNorisData).mockImplementation(() => {
        throw validatorError
      })

      await expect(service.getExternalEdeskChecks(1, 2)).rejects.toThrow(validatorError)
    })

    it('should throw when execute fails', async () => {
      const dbError = new Error('Execute failed')
      const mockConnection = {
        connected: true,
        close: jest.fn().mockResolvedValue(undefined),
        request: jest.fn().mockReturnValue({
          input: jest.fn().mockReturnThis(),
          execute: jest.fn().mockRejectedValue(dbError),
        }),
      } as any

      jest
        .mocked(connectionService.withConnection)
        .mockImplementation((operation: any) => operation(mockConnection))

      await expect(service.getExternalEdeskChecks(10, 20)).rejects.toThrow(dbError)
    })
  })

  describe('updateEdeskChecks', () => {
    beforeEach(() => {
      jest.mocked(connectionService.withConnection).mockResolvedValue(undefined)
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should call withConnection for each edesk check', async () => {
      const edeskChecks = [
        {
          idNoris: 42,
          lastCheck: new Date('2024-01-15'),
          edeskStatus: EdeskStatus.ACTIVE,
          edeskNumber: '12345',
          uri: 'https://edesk.example/sk/123',
          deathDate: null,
        },
      ]

      await expect(service.updateEdeskChecks(edeskChecks)).resolves.toBeUndefined()
      expect(connectionService.withConnection).toHaveBeenCalled()
    })

    it('should process empty array without calling withConnection', async () => {
      await expect(service.updateEdeskChecks([])).resolves.toBeUndefined()
      expect(connectionService.withConnection).not.toHaveBeenCalled()
    })

    it('should reject when withConnection rejects', async () => {
      const internalError = new HttpException('Internal', 500)
      jest.mocked(connectionService.withConnection).mockRejectedValue(internalError)

      await expect(
        service.updateEdeskChecks([
          {
            idNoris: 42,
            lastCheck: new Date('2024-01-15'),
            edeskStatus: EdeskStatus.ACTIVE,
            edeskNumber: '12345',
            uri: 'https://edesk.example/sk/123',
            deathDate: null,
          },
        ])
      ).rejects.toThrow(internalError)
    })

    it('should pass deathDate to death_date SQL parameter', async () => {
      const deathDate = '2023-06-15'
      const mockRequest = createMock<mssql.Request>()
      mockRequest.input.mockReturnValue(mockRequest)

      const mockPool = createMock<ConnectionPool>()
      mockPool.request.mockReturnValue(mockRequest)

      jest
        .mocked(connectionService.withConnection)
        .mockImplementation((operation: any) => operation(mockPool))

      await service.updateEdeskChecks([
        {
          idNoris: 1,
          lastCheck: new Date('2024-01-15'),
          edeskStatus: EdeskStatus.ACTIVE,
          edeskNumber: '12345',
          uri: 'https://edesk.example/sk/123',
          deathDate,
        },
      ])

      expect(mockRequest.input).toHaveBeenCalledWith('death_date', mssql.VarChar, deathDate)
    })

    it('should pass null to death_date SQL parameter when deathDate is null', async () => {
      const mockRequest = createMock<mssql.Request>()
      mockRequest.input.mockReturnValue(mockRequest)

      const mockPool = createMock<ConnectionPool>()
      mockPool.request.mockReturnValue(mockRequest)

      jest
        .mocked(connectionService.withConnection)
        .mockImplementation((operation: any) => operation(mockPool))

      await service.updateEdeskChecks([
        {
          idNoris: 1,
          lastCheck: new Date('2024-01-15'),
          edeskStatus: EdeskStatus.ACTIVE,
          edeskNumber: '12345',
          uri: 'https://edesk.example/sk/123',
          deathDate: null,
        },
      ])

      expect(mockRequest.input).toHaveBeenCalledWith('death_date', mssql.VarChar, null)
    })
  })
})

import { createMock } from '@golevelup/ts-jest'
import { HttpException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { ConnectionPool } from 'mssql'

import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { NorisService } from '../noris.service'
import { NorisValidatorSubservice } from '../subservices/noris-validator.subservice'
import { EdeskRecordSchema, EdeskStatus } from '../types/noris.types'

describe('NorisService', () => {
  let service: NorisService
  let configService: ConfigService
  let throwerErrorGuard: ThrowerErrorGuard
  let norisValidatorSubservice: NorisValidatorSubservice

  const envBackup: NodeJS.ProcessEnv = { ...process.env }

  beforeEach(async () => {
    process.env.MSSQL_HOST = 'localhost'
    process.env.MSSQL_PORT = '1433'
    process.env.MSSQL_DB = 'testdb'
    process.env.MSSQL_USERNAME = 'user'
    // eslint-disable-next-line sonarjs/no-hardcoded-passwords
    process.env.MSSQL_PASSWORD = 'pass'

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NorisService,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        { provide: ThrowerErrorGuard, useValue: createMock<ThrowerErrorGuard>() },
        {
          provide: NorisValidatorSubservice,
          useValue: createMock<NorisValidatorSubservice>(),
        },
      ],
    }).compile()

    service = module.get<NorisService>(NorisService)
    configService = module.get<ConfigService>(ConfigService)
    throwerErrorGuard = module.get<ThrowerErrorGuard>(ThrowerErrorGuard)
    norisValidatorSubservice = module.get<NorisValidatorSubservice>(NorisValidatorSubservice)

    jest.mocked(configService.getOrThrow).mockImplementation((key: string) => {
      const map: Record<string, string> = {
        MSSQL_HOST: 'localhost',
        MSSQL_PORT: '1433',
        MSSQL_DB: 'testdb',
        MSSQL_USERNAME: 'user',
        // eslint-disable-next-line sonarjs/no-hardcoded-passwords
        MSSQL_PASSWORD: 'pass',
      }
      if (key in map) {
        return map[key]
      }
      throw new Error(`Environment variable ${key} not found`)
    })
  })

  afterEach(() => {
    process.env = { ...envBackup }
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('waitForConnection', () => {
    it('should resolve immediately when connection is already connected', async () => {
      const mockConnection = { connected: true } as ConnectionPool
      await expect(service['waitForConnection'](mockConnection, 10_000)).resolves.toBeUndefined()
    })

    it('should reject with timeout error when connection is not established within maxWaitTime', async () => {
      const mockConnection = { connected: false } as ConnectionPool
      const maxWaitTime = 150

      await expect(service['waitForConnection'](mockConnection, maxWaitTime)).rejects.toThrow(
        'Connection timeout: Database connection not established within timeout period'
      )
    })

    it('should resolve when connection becomes connected before maxWaitTime', async () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout')
      const mockConnection = { connected: false } as ConnectionPool
      const maxWaitTime = 500
      setTimeout(() => {
        ;(mockConnection as any).connected = true
      }, 50)

      await expect(
        service['waitForConnection'](mockConnection, maxWaitTime)
      ).resolves.toBeUndefined()
      expect(setTimeoutSpy).toHaveBeenCalled()
    })
  })

  describe('withConnection', () => {
    it('should throw when operation throws and errorHandler rethrows', async () => {
      const mockConnection = {
        connected: true,
        close: jest.fn().mockResolvedValue(undefined),
      } as any
      const opError = new Error('DB operation failed')
      const handlerError = new HttpException('Handled', 500)
      jest.spyOn(service as any, 'createConnection').mockResolvedValue(mockConnection)

      const operation = jest.fn().mockRejectedValue(opError)
      const errorHandler = jest.fn().mockImplementation(() => {
        throw handlerError
      })

      await expect((service as any).withConnection(operation, errorHandler)).rejects.toThrow(
        handlerError
      )
      expect(errorHandler).toHaveBeenCalledWith(opError)
      expect(mockConnection.close).toHaveBeenCalled()
    })

    it('should return operation result and close connection on success', async () => {
      const mockConnection = {
        connected: true,
        close: jest.fn().mockResolvedValue(undefined),
      } as any
      const result = { data: 'ok' }
      jest.spyOn(service as any, 'createConnection').mockResolvedValue(mockConnection)

      const operation = jest.fn().mockResolvedValue(result)

      await expect(
        (service as any).withConnection(operation, () => {
          throw new Error('unexpected')
        })
      ).resolves.toEqual(result)
      expect(operation).toHaveBeenCalledWith(mockConnection)
      expect(mockConnection.close).toHaveBeenCalled()
    })
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

      jest.spyOn(service as any, 'createConnection').mockResolvedValue(mockConnection)
      jest.spyOn(service as any, 'waitForConnection').mockResolvedValue(undefined)
      jest.mocked(norisValidatorSubservice.validateNorisData).mockReturnValue(validatedData)

      const result = await service.getExternalEdeskChecks(physicalPersons, legalPersons)

      expect(result).toEqual(validatedData)
      expect(mockRequest.input).toHaveBeenCalledWith('numSO', expect.anything(), physicalPersons)
      expect(mockRequest.input).toHaveBeenCalledWith('numPO', expect.anything(), legalPersons)
      expect(mockRequest.execute).toHaveBeenCalledWith('lcs.usp21_ino_check_edesk')
      expect(norisValidatorSubservice.validateNorisData).toHaveBeenCalledWith(
        EdeskRecordSchema,
        mockRecordset
      )
    })

    it('should throw InternalServerError when validator throws', async () => {
      const validatorError = new HttpException('Validation failed', 400)
      jest.spyOn(service as any, 'createConnection').mockResolvedValue({
        connected: true,
        close: jest.fn().mockResolvedValue(undefined),
        request: jest.fn().mockReturnValue({
          input: jest.fn().mockReturnThis(),
          execute: jest.fn().mockResolvedValue({ recordset: [{}] }),
        }),
      } as any)
      jest.spyOn(service as any, 'waitForConnection').mockResolvedValue(undefined)
      jest.mocked(norisValidatorSubservice.validateNorisData).mockImplementation(() => {
        throw validatorError
      })
      const internalError = new HttpException('Internal', 500)
      jest.mocked(throwerErrorGuard.InternalServerErrorException).mockReturnValue(internalError)

      await expect(service.getExternalEdeskChecks(1, 2)).rejects.toThrow(internalError)
    })

    it('should throw when execute fails', async () => {
      const dbError = new Error('Execute failed')
      jest.spyOn(service as any, 'createConnection').mockResolvedValue({
        connected: true,
        close: jest.fn().mockResolvedValue(undefined),
        request: jest.fn().mockReturnValue({
          input: jest.fn().mockReturnThis(),
          execute: jest.fn().mockRejectedValue(dbError),
        }),
      } as any)
      jest.spyOn(service as any, 'waitForConnection').mockResolvedValue(undefined)
      const internalError = new HttpException('Internal', 500)
      jest.mocked(throwerErrorGuard.InternalServerErrorException).mockReturnValue(internalError)

      await expect(service.getExternalEdeskChecks(10, 20)).rejects.toThrow(internalError)
    })
  })

  describe('updateEdeskChecks', () => {
    beforeEach(() => {
      jest.spyOn(service as any, 'withConnection').mockResolvedValue(undefined)
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should accept idNoris as string and call withConnection', async () => {
      const edeskChecks = [
        {
          idNoris: 42,
          lastCheck: new Date('2024-01-15'),
          edeskStatus: EdeskStatus.ACTIVE,
          edeskNumber: '12345',
          uri: 'https://edesk.example/sk/123',
        },
      ]
      const withConnectionSpy = jest.spyOn(service as any, 'withConnection')

      await expect(service.updateEdeskChecks(edeskChecks)).resolves.toBeUndefined()

      expect(withConnectionSpy).toHaveBeenCalled()
    })

    it('should process empty array without throwing', async () => {
      const withConnectionSpy = jest.spyOn(service as any, 'withConnection')
      await expect(service.updateEdeskChecks([])).resolves.toBeUndefined()
      expect(withConnectionSpy).not.toHaveBeenCalled()
    })
  })
})

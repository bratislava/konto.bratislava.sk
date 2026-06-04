import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { ConnectionPool } from 'mssql'
import * as mssql from 'mssql'

import prismaMock from '../../../../test/singleton'
import { PrismaService } from '../../../prisma/prisma.service'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { NorisConnectionService } from '../noris-connection.service'

jest.mock('mssql', () => ({
  ...jest.requireActual('mssql'),
  connect: jest.fn(),
}))

describe('NorisConnectionService', () => {
  let module: TestingModule
  let service: NorisConnectionService
  let throwerErrorGuard: ThrowerErrorGuard

  let mockMssqlConnect: jest.Mock

  const mockConnectionPool = {
    connected: true,
    close: jest.fn().mockResolvedValue(undefined),
  }

  const envBackup: NodeJS.ProcessEnv = { ...process.env }

  beforeEach(async () => {
    jest.clearAllMocks()

    mockMssqlConnect = mssql.connect as jest.Mock

    process.env.MSSQL_HOST = 'localhost'
    process.env.MSSQL_PORT = '1433'
    process.env.MSSQL_DB = 'testdb'
    process.env.MSSQL_USERNAME = 'user'
    // eslint-disable-next-line sonarjs/no-hardcoded-passwords
    process.env.MSSQL_PASSWORD = 'pass'

    module = await Test.createTestingModule({
      providers: [
        NorisConnectionService,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        { provide: ThrowerErrorGuard, useValue: createMock<ThrowerErrorGuard>() },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()

    service = module.get<NorisConnectionService>(NorisConnectionService)
    throwerErrorGuard = module.get<ThrowerErrorGuard>(ThrowerErrorGuard)

    jest.mocked(module.get(ConfigService).getOrThrow).mockImplementation((key: string) => {
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

  describe('onModuleDestroy', () => {
    it('should close the pool connection on shutdown', async () => {
      mockMssqlConnect.mockResolvedValue(mockConnectionPool)

      await module.close()

      expect(mockConnectionPool.close).toHaveBeenCalledTimes(1)
    })

    it('should not throw when connect() fails during shutdown', async () => {
      mockMssqlConnect.mockRejectedValue(new Error('MSSQL unreachable'))
      const warnSpy = jest.spyOn(service['logger'], 'warn')

      await expect(module.close()).resolves.not.toThrow()
      expect(warnSpy).toHaveBeenCalled()
    })
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
    it('should return operation result on success', async () => {
      const mockConnection = {
        connected: true,
        close: jest.fn().mockResolvedValue(undefined),
      } as any
      const result = { data: 'ok' }
      jest.spyOn(service as any, 'createConnection').mockResolvedValue(mockConnection)

      const operation = jest.fn().mockResolvedValue(result)

      await expect(service.withConnection(operation, 'error message')).resolves.toEqual(result)
      expect(operation).toHaveBeenCalledWith(mockConnection)
    })

    it('should call handleDatabaseError when operation throws', async () => {
      const mockConnection = {
        connected: true,
        close: jest.fn().mockResolvedValue(undefined),
      } as any
      const opError = new Error('DB operation failed')
      jest.spyOn(service as any, 'createConnection').mockResolvedValue(mockConnection)
      const handleDbErrorSpy = jest
        .spyOn(service as any, 'handleDatabaseError')
        .mockRejectedValue(new Error('handled'))

      const operation = jest.fn().mockRejectedValue(opError)

      await expect(service.withConnection(operation, 'error message')).rejects.toThrow('handled')
      expect(handleDbErrorSpy).toHaveBeenCalledWith(opError, 'error message')
    })

    it('should throw InternalServerError for non-MSSQL errors', async () => {
      const mockConnection = { connected: true } as any
      jest.spyOn(service as any, 'createConnection').mockResolvedValue(mockConnection)
      const internalError = new Error('internal')
      jest
        .mocked(throwerErrorGuard.InternalServerErrorException)
        .mockReturnValue(internalError as any)

      const operation = jest.fn().mockRejectedValue(new Error('generic error'))

      await expect(service.withConnection(operation, 'fail')).rejects.toThrow()
      expect(throwerErrorGuard.InternalServerErrorException).toHaveBeenCalled()
    })

    it('should throw BadRequestException and increment counter for MSSQL connection errors', async () => {
      const mockConnection = { connected: true } as any
      jest.spyOn(service as any, 'createConnection').mockResolvedValue(mockConnection)
      const badRequestError = new Error('bad request') as any
      jest.mocked(throwerErrorGuard.BadRequestException).mockReturnValue(badRequestError)
      ;(prismaMock.$executeRaw as jest.Mock).mockResolvedValue(1)

      const mssqlError = Object.assign(new mssql.MSSQLError('timeout', 'ETIMEOUT'), {
        code: 'ETIMEOUT',
      })
      const operation = jest.fn().mockRejectedValue(mssqlError)

      await expect(service.withConnection(operation, 'fail')).rejects.toThrow()
      expect(prismaMock.$executeRaw).toHaveBeenCalled()
      expect(throwerErrorGuard.BadRequestException).toHaveBeenCalled()
    })
  })
})

import { ErrorEnum, ErrorFactoryService, LineLoggerService } from '@bratislava/log-nest'
import { createMock } from '@golevelup/ts-vitest'
import { Test, TestingModule } from '@nestjs/testing'
import * as mssql from 'mssql'
import { ConnectionPool } from 'mssql'
import type { Mock } from 'vitest'

import prismaMock from '../../../../test/singleton'
import BaConfigService from '../../../config/ba-config.service'
import { PrismaService } from '../../../prisma/prisma.service'
import alertReporting from '../../../utils/constants/error.alerts'
import { CustomErrorNorisTypesEnum } from '../../noris.errors'
import { NorisConnectionService } from '../noris-connection.service'

// mssql is CommonJS, so its exports are only on `default` and are spread into the named exports.
vi.mock('mssql', async (importOriginal) => {
  const actual = await importOriginal<typeof mssql & { default: typeof mssql }>()
  return { ...actual, ...actual.default, connect: vi.fn() }
})

describe('NorisConnectionService', () => {
  let module: TestingModule
  let service: NorisConnectionService
  let errorFactoryService: ErrorFactoryService
  let logger: LineLoggerService

  let mockMssqlConnect: Mock

  const mockConnectionPool = {
    connected: true,
    close: vi.fn().mockResolvedValue(undefined),
  }

  beforeEach(async () => {
    mockMssqlConnect = mssql.connect as Mock

    module = await Test.createTestingModule({
      providers: [
        { provide: LineLoggerService, useValue: createMock<LineLoggerService>() },
        NorisConnectionService,
        {
          provide: BaConfigService,
          useValue: {
            noris: {
              host: 'localhost',
              port: 1433,
              database: 'testdb',
              username: 'user',
              password: 'pass',
            },
          },
        },
        { provide: ErrorFactoryService, useValue: new ErrorFactoryService({ alertReporting }) },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile()

    service = module.get<NorisConnectionService>(NorisConnectionService)
    errorFactoryService = module.get<ErrorFactoryService>(ErrorFactoryService)
    logger = module.get(LineLoggerService)
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
      const connectError = new Error('MSSQL unreachable')
      mockMssqlConnect.mockRejectedValue(connectError)

      await expect(module.close()).resolves.not.toThrow()
      expect(vi.mocked(logger.warn)).toHaveBeenCalledWith(
        errorFactoryService.BadRequestException({
          errorEnum: ErrorEnum.BAD_REQUEST_ERROR,
          message: 'Failed to close MSSQL connection on shutdown',
          error: connectError,
        })
      )
    })
  })

  describe('waitForConnection', () => {
    it('should resolve immediately when connection is already connected', async () => {
      const mockConnection = createMock<ConnectionPool>({ connected: true })
      await expect(service['waitForConnection'](mockConnection, 10_000)).resolves.toBeUndefined()
    })

    it('should reject with timeout error when connection is not established within maxWaitTime', async () => {
      const mockConnection = createMock<ConnectionPool>({ connected: false })
      const maxWaitTime = 150

      await expect(service['waitForConnection'](mockConnection, maxWaitTime)).rejects.toThrow(
        'Connection timeout: Database connection not established within timeout period'
      )
    })

    it('should resolve when connection becomes connected before maxWaitTime', async () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout')
      const mockConnection = createMock<ConnectionPool>({ connected: false })
      const maxWaitTime = 500
      setTimeout(() => {
        // `connected` is readonly on ConnectionPool; the mock is deliberately mutated here
        // to simulate the pool transitioning to connected mid-wait.
        ;(mockConnection as { connected: boolean }).connected = true
      }, 50)

      await expect(
        service['waitForConnection'](mockConnection, maxWaitTime)
      ).resolves.toBeUndefined()
      expect(setTimeoutSpy).toHaveBeenCalled()
    })
  })

  describe('withConnection', () => {
    beforeEach(() => {
      mockMssqlConnect.mockResolvedValue(mockConnectionPool)
    })

    it('should return operation result on success', async () => {
      const result = { data: 'ok' }
      const operation = vi.fn().mockResolvedValue(result)

      await expect(service.withConnection(operation, 'error message')).resolves.toEqual(result)
      expect(operation).toHaveBeenCalledWith(mockConnectionPool)
    })

    it('should throw InternalServerError for non-MSSQL errors', async () => {
      const opError = new Error('generic error')
      const operation = vi.fn().mockRejectedValue(opError)
      const errorMessage = 'fail'

      await expect(service.withConnection(operation, errorMessage)).rejects.toThrow(
        errorFactoryService.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message: errorMessage,
          error: opError,
        })
      )
    })

    it('should throw BadRequestException and increment counter for MSSQL connection errors', async () => {
      ;(prismaMock.$executeRaw as Mock).mockResolvedValue(1)

      const mssqlError = Object.assign(new mssql.MSSQLError('timeout', 'ETIMEOUT'), {
        code: 'ETIMEOUT',
      })
      const operation = vi.fn().mockRejectedValue(mssqlError)
      const errorMessage = 'fail'

      await expect(service.withConnection(operation, errorMessage)).rejects.toThrow(
        errorFactoryService.BadRequestException({
          errorEnum: CustomErrorNorisTypesEnum.CONNECTION_ERROR,
          message: `${errorMessage}: {"code":"${mssqlError.code}","name":"${mssqlError.name}"}`,
          error: mssqlError,
        })
      )
      expect(prismaMock.$executeRaw).toHaveBeenCalled()
    })
  })
})

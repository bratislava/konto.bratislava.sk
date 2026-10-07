import {
  ErrorEnum,
  ErrorFactoryService,
  LineLoggerService,
} from '@bratislava/log-nest'
import { createMock } from '@golevelup/ts-vitest'
import { Test, TestingModule } from '@nestjs/testing'
import mssql, { MSSQLError } from 'mssql'
import type { Mock, Mocked } from 'vitest'

import BaConfigService from '../../../config/ba-config.service'
import { PrismaService } from '../../../prisma/prisma.service'
import alertReporting from '../../../utils/constants/error.alerts'
import { CustomErrorNorisTypesEnum } from '../../noris.errors'
import { NorisConnectionSubservice } from '../noris-connection.subservice'

const { mockConnect } = vi.hoisted(() => ({ mockConnect: vi.fn() }))
// The service imports `connect` by name, so the module is mocked rather than spied on. mssql is
// CommonJS, so its exports are only on `default` and are spread into the named exports too.
vi.mock('mssql', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('mssql') & { default: typeof import('mssql') }
  >()
  return {
    ...actual,
    ...actual.default,
    connect: mockConnect,
    default: { ...actual.default, connect: mockConnect },
  }
})

describe('NorisConnectionSubservice', () => {
  let module: TestingModule
  let service: NorisConnectionSubservice
  let baConfigService: BaConfigService
  const errorFactoryService = new ErrorFactoryService({ alertReporting })
  let logger: LineLoggerService
  let prismaService: Mocked<PrismaService>

  let mockMssqlConnect: Mock

  const mockConnectionPool = {
    connected: true,
    close: vi.fn().mockResolvedValue(undefined),
  }

  beforeEach(async () => {
    mockMssqlConnect = mssql.connect as Mock

    baConfigService = createMock<BaConfigService>({
      noris: {
        host: 'localhost',
        database: 'testdb',
        username: 'user',
        password: 'pass',
      },
    })

    prismaService = createMock<PrismaService>()

    module = await Test.createTestingModule({
      providers: [
        {
          provide: LineLoggerService,
          useValue: createMock<LineLoggerService>(),
        },
        NorisConnectionSubservice,
        { provide: BaConfigService, useValue: baConfigService },
        { provide: ErrorFactoryService, useValue: errorFactoryService },
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile()

    service = module.get<NorisConnectionSubservice>(NorisConnectionSubservice)
    logger = module.get(LineLoggerService)
  })

  afterEach(async () => {
    await module.close()
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
        }),
      )
    })
  })

  describe('withConnection', () => {
    beforeEach(() => {
      mockMssqlConnect.mockResolvedValue(mockConnectionPool)
    })

    it('should call mssql.connect() on every invocation so the pool is always obtained or recreated', async () => {
      // connect() is idempotent: it resolves immediately when already connected
      await service.withConnection(async () => Promise.resolve('a'), 'err')
      await service.withConnection(async () => Promise.resolve('b'), 'err')

      expect(mockMssqlConnect).toHaveBeenCalledTimes(2)
    })
  })

  describe('handleDatabaseError (via withConnection)', () => {
    beforeEach(() => {
      mockMssqlConnect.mockResolvedValue(mockConnectionPool)
    })

    const errorMessage = 'Test error message'

    it('should throw getNorisUrgentError when error is not an MSSQLError', async () => {
      const genericError = new Error('Generic failure')

      await expect(
        service.withConnection(async () => {
          return Promise.reject(genericError)
        }, errorMessage),
      ).rejects.toThrow(
        errorFactoryService.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message: errorMessage,
          error: genericError,
        }),
      )
      expect(prismaService.$transaction).not.toHaveBeenCalled()
    })

    it('should throw getNorisUrgentError when error is MSSQLError with code not in the silent list', async () => {
      const mssqlError = new MSSQLError(
        'Query failed',
        'ESOMEOTHER' as mssql.MSSQL_ERROR_CODE,
      )
      await expect(
        service.withConnection(async () => {
          return Promise.reject(mssqlError)
        }, errorMessage),
      ).rejects.toThrow(
        errorFactoryService.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message: `${errorMessage}: {"code":"${mssqlError.code}","name":"${mssqlError.name}"}`,
          error: mssqlError,
        }),
      )
      expect(prismaService.$transaction).not.toHaveBeenCalled()
    })

    it.each([
      ['ETIMEOUT'],
      ['ENOTOPEN'],
      ['ECONNCLOSED'],
      ['EABORT'],
      ['ECANCEL'],
    ] as const)(
      'should log, increment config value, then throw when MSSQLError has code %s',
      async (code) => {
        const mssqlError = new MSSQLError('Connection problem', code)

        await expect(
          service.withConnection(async () => {
            return Promise.reject(mssqlError)
          }, errorMessage),
        ).rejects.toThrow(
          errorFactoryService.BadRequestException({
            errorEnum: CustomErrorNorisTypesEnum.CONNECTION_ERROR,
            message: `${errorMessage}: {"code":"${code}","name":"${mssqlError.name}"}`,
            error: mssqlError,
          }),
        )

        expect(prismaService.$executeRaw).toHaveBeenCalledTimes(1)
      },
    )

    it('should run increment SQL when config row may not exist', async () => {
      const mssqlError = new MSSQLError('Timeout', 'ETIMEOUT')

      await expect(
        service.withConnection(async () => {
          return Promise.reject(mssqlError)
        }, errorMessage),
      ).rejects.toThrow(
        errorFactoryService.BadRequestException({
          errorEnum: CustomErrorNorisTypesEnum.CONNECTION_ERROR,
          message: `${errorMessage}: {"code":"${mssqlError.code}","name":"${mssqlError.name}"}`,
          error: mssqlError,
        }),
      )

      expect(prismaService.$executeRaw).toHaveBeenCalledTimes(1)
    })
  })
})

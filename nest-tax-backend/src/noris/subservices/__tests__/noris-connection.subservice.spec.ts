import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import * as mssql from 'mssql'
import { MSSQLError } from 'mssql'

import { PrismaService } from '../../../prisma/prisma.service'
import { ErrorsEnum } from '../../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { CustomErrorNorisTypesEnum } from '../../noris.errors'
import { NorisConnectionSubservice } from '../noris-connection.subservice'

// Inline jest.fn() avoids the temporal-dead-zone issue that occurs when const
// variables declared outside the factory are referenced inside jest.mock().
jest.mock('mssql', () => ({
  ...jest.requireActual('mssql'),
  connect: jest.fn(),
}))

describe('NorisConnectionSubservice', () => {
  let module: TestingModule
  let service: NorisConnectionSubservice
  let configService: jest.Mocked<ConfigService>
  let throwerErrorGuard: ThrowerErrorGuard
  let prismaService: jest.Mocked<PrismaService>

  let mockMssqlConnect: jest.Mock

  const mockConnectionPool = {
    connected: true,
    close: jest.fn().mockResolvedValue(undefined),
  }

  const originalEnv = process.env

  beforeEach(async () => {
    jest.clearAllMocks()

    // Assign after clearAllMocks so we hold references to the (now-cleared) mock.
    mockMssqlConnect = mssql.connect as jest.Mock

    process.env = {
      ...originalEnv,
      MSSQL_HOST: 'localhost',
      MSSQL_DB: 'testdb',
      MSSQL_USERNAME: 'user',
      // eslint-disable-next-line sonarjs/no-hardcoded-passwords
      MSSQL_PASSWORD: 'pass',
    }

    configService = createMock<ConfigService>({
      getOrThrow: jest.fn((key: string) => {
        const map: Record<string, string> = {
          MSSQL_HOST: 'localhost',
          MSSQL_DB: 'testdb',
          MSSQL_USERNAME: 'user',
          // eslint-disable-next-line sonarjs/no-hardcoded-passwords
          MSSQL_PASSWORD: 'pass',
        }
        if (key in map) {
          return map[key]
        }
        throw new Error(`Unknown key: ${key}`)
      }),
    })

    prismaService = createMock<PrismaService>()

    module = await Test.createTestingModule({
      providers: [
        NorisConnectionSubservice,
        { provide: ConfigService, useValue: configService },
        ThrowerErrorGuard,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile()

    service = module.get<NorisConnectionSubservice>(NorisConnectionSubservice)
    throwerErrorGuard = module.get<ThrowerErrorGuard>(ThrowerErrorGuard)
  })

  afterEach(async () => {
    process.env = originalEnv
    await module.close()
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

  describe('withConnection', () => {
    beforeEach(() => {
      mockMssqlConnect.mockResolvedValue(mockConnectionPool)
    })

    it('should call mssql.connect() on every invocation so the pool is always obtained or recreated', async () => {
      // connect() is idempotent: it resolves immediately when already connected
      await service.withConnection(
        async () => Promise.resolve('a' as unknown as never),
        'err',
      )
      await service.withConnection(
        async () => Promise.resolve('b' as unknown as never),
        'err',
      )

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
      const throwerErrorGuardSpy = jest.spyOn(
        throwerErrorGuard,
        'InternalServerErrorException',
      )

      await expect(
        service.withConnection(async () => {
          return Promise.reject(genericError)
        }, errorMessage),
      ).rejects.toThrow(errorMessage)

      expect(throwerErrorGuardSpy).toHaveBeenCalledWith(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        errorMessage,
        undefined,
        undefined,
        genericError,
      )
      expect(prismaService.$transaction).not.toHaveBeenCalled()
    })

    it('should throw getNorisUrgentError when error is MSSQLError with code not in the silent list', async () => {
      const mssqlError = new MSSQLError('Query failed', 'ESOMEOTHER')
      const throwerErrorGuardSpy = jest.spyOn(
        throwerErrorGuard,
        'InternalServerErrorException',
      )
      await expect(
        service.withConnection(async () => {
          return Promise.reject(mssqlError)
        }, errorMessage),
      ).rejects.toThrow(errorMessage)

      expect(throwerErrorGuardSpy).toHaveBeenCalledWith(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        expect.stringContaining(errorMessage),
        undefined,
        undefined,
        mssqlError,
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
        const badRequestSpy = jest.spyOn(
          throwerErrorGuard,
          'BadRequestException',
        )
        const internalErrorSpy = jest.spyOn(
          throwerErrorGuard,
          'InternalServerErrorException',
        )

        await expect(
          service.withConnection(async () => {
            return Promise.reject(mssqlError)
          }, errorMessage),
        ).rejects.toThrow(errorMessage)

        expect(badRequestSpy).toHaveBeenCalledWith(
          CustomErrorNorisTypesEnum.CONNECTION_ERROR,
          expect.stringContaining(errorMessage),
          undefined,
          undefined,
          mssqlError,
        )

        expect(prismaService.$executeRaw).toHaveBeenCalledTimes(1)

        expect(internalErrorSpy).not.toHaveBeenCalled()
      },
    )

    it('should run increment SQL when config row may not exist', async () => {
      const mssqlError = new MSSQLError('Timeout', 'ETIMEOUT')
      const badRequestSpy = jest.spyOn(throwerErrorGuard, 'BadRequestException')
      const internalErrorSpy = jest.spyOn(
        throwerErrorGuard,
        'InternalServerErrorException',
      )

      await expect(
        service.withConnection(async () => {
          return Promise.reject(mssqlError)
        }, errorMessage),
      ).rejects.toThrow()

      expect(prismaService.$executeRaw).toHaveBeenCalledTimes(1)
      expect(badRequestSpy).toHaveBeenCalledWith(
        CustomErrorNorisTypesEnum.CONNECTION_ERROR,
        expect.stringContaining(errorMessage),
        undefined,
        undefined,
        mssqlError,
      )
      expect(internalErrorSpy).not.toHaveBeenCalled()
    })
  })
})

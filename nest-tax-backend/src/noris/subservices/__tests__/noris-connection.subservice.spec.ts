import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { MSSQLError } from 'mssql'

import { ErrorsEnum } from '../../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { CustomErrorNorisTypesEnum } from '../../noris.errors'
import { NORIS_SILENT_CONNECTION_ERRORS_KEY } from '../../../tasks/tasks.service'
import { PrismaService } from '../../../prisma/prisma.service'
import { NorisConnectionSubservice } from '../noris-connection.subservice'

const mockConnect = jest.fn()
jest.mock('mssql', () => {
  const actual = jest.requireActual('mssql')
  return {
    ...actual,
    connect: (...args: unknown[]) => mockConnect(...args),
  }
})

describe('NorisConnectionSubservice', () => {
  let service: NorisConnectionSubservice
  let configService: jest.Mocked<ConfigService>
  let throwerErrorGuard: ThrowerErrorGuard
  let prismaService: jest.Mocked<PrismaService>

  const mockConnectionPool = {
    connected: true,
    close: jest.fn().mockResolvedValue(undefined),
  }

  const originalEnv = process.env

  beforeEach(async () => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      MSSQL_HOST: 'localhost',
      MSSQL_DB: 'testdb',
      MSSQL_USERNAME: 'user',
      MSSQL_PASSWORD: 'pass',
    }

    mockConnect.mockResolvedValue(mockConnectionPool)

    configService = createMock<ConfigService>({
      getOrThrow: jest.fn((key: string) => {
        const map: Record<string, string> = {
          MSSQL_HOST: 'localhost',
          MSSQL_DB: 'testdb',
          MSSQL_USERNAME: 'user',
          MSSQL_PASSWORD: 'pass',
        }
        if (key in map) {
          return map[key]
        }
        throw new Error(`Unknown key: ${key}`)
      }),
    })

    prismaService = createMock<PrismaService>()

    const module: TestingModule = await Test.createTestingModule({
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

  afterEach(() => {
    process.env = originalEnv
  })

  describe('handleDatabaseError (via withConnection)', () => {
    const errorMessage = 'Test error message'

    it('should throw getNorisUrgentError when error is not an MSSQLError', async () => {
      const genericError = new Error('Generic failure')
      const throwerErrorGuardSpy = jest.spyOn(throwerErrorGuard, 'InternalServerErrorException')

      await expect(
        service.withConnection(async () => {
          throw genericError
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
      const throwerErrorGuardSpy = jest.spyOn(throwerErrorGuard, 'InternalServerErrorException')
      await expect(
        service.withConnection(async () => {
          throw mssqlError
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
        const throwerErrorGuardSpy = jest.spyOn(throwerErrorGuard, 'InternalServerErrorException')
        const mockTx = {
          config: {
            findFirst: jest.fn().mockResolvedValue({
              key: NORIS_SILENT_CONNECTION_ERRORS_KEY,
              value: '3',
            }),
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
        }
        prismaService.$transaction.mockImplementation(async (cb: any) => {
          await cb(mockTx)
        })

        await expect(
          service.withConnection(async () => {
            throw mssqlError
          }, errorMessage),
        ).rejects.toThrow(errorMessage)

        expect(throwerErrorGuardSpy).toHaveBeenCalledWith(
          CustomErrorNorisTypesEnum.CONNECTION_ERROR,
          expect.stringContaining(errorMessage),
          undefined,
          undefined,
          mssqlError,
        )

        expect(prismaService.$transaction).toHaveBeenCalledTimes(1)
        expect(mockTx.config.findFirst).toHaveBeenCalledWith({
          where: { key: NORIS_SILENT_CONNECTION_ERRORS_KEY },
        })
        expect(mockTx.config.updateMany).toHaveBeenCalledWith({
          where: { key: NORIS_SILENT_CONNECTION_ERRORS_KEY },
          data: { value: '4' },
        })

        expect(throwerErrorGuardSpy).not.toHaveBeenCalledWith(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          expect.stringContaining(errorMessage),
          undefined,
          undefined,
          mssqlError,
        )
      },
    )

    it('should use currentValue 0 when config row does not exist and increment to 1', async () => {
      const mssqlError = new MSSQLError('Timeout', 'ETIMEOUT')
      const throwerErrorGuardSpy = jest.spyOn(throwerErrorGuard, 'InternalServerErrorException')
      const mockTx = {
        config: {
          findFirst: jest.fn().mockResolvedValue(null),
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
      }
      prismaService.$transaction.mockImplementation(async (cb: any) => {
        await cb(mockTx)
      })

      await expect(
        service.withConnection(async () => {
          throw mssqlError
        }, errorMessage),
      ).rejects.toThrow()

      expect(mockTx.config.findFirst).toHaveBeenCalledWith({
        where: { key: NORIS_SILENT_CONNECTION_ERRORS_KEY },
      })
      expect(mockTx.config.updateMany).toHaveBeenCalledWith({
        where: { key: NORIS_SILENT_CONNECTION_ERRORS_KEY },
        data: { value: '1' },
      })
      expect(throwerErrorGuardSpy).not.toHaveBeenCalledWith(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        expect.stringContaining(errorMessage),
        undefined,
        undefined,
        mssqlError,
      )
    })
  })
})

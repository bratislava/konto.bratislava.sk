import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { MSSQLError } from 'mssql'

import { PrismaService } from '../../../prisma/prisma.service'
import { ErrorsEnum } from '../../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { CustomErrorNorisTypesEnum } from '../../noris.errors'
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
    close: jest.fn(),
  }

  const originalEnv = process.env

  beforeEach(async () => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      MSSQL_HOST: 'localhost',
      MSSQL_DB: 'testdb',
      MSSQL_USERNAME: 'user',
      // eslint-disable-next-line sonarjs/no-hardcoded-passwords
      MSSQL_PASSWORD: 'pass',
    }

    mockConnect.mockResolvedValue(mockConnectionPool)

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

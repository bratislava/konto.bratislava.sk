import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { connect, ConnectionError, ConnectionPool, MSSQLError } from 'mssql'

import { PrismaService } from '../prisma/prisma.service'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { CustomErrorNorisTypesEnum } from './noris.errors'

const NORIS_SILENT_CONNECTION_ERRORS_KEY = 'NORIS_SILENT_CONNECTION_ERRORS'

@Injectable()
export class NorisConnectionService implements OnModuleDestroy {
  private readonly logger = new LineLoggerSubservice(NorisConnectionService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly prismaService: PrismaService
  ) {
    if (
      !process.env.MSSQL_HOST ||
      !process.env.MSSQL_DB ||
      !process.env.MSSQL_USERNAME ||
      !process.env.MSSQL_PASSWORD ||
      !process.env.MSSQL_PORT
    ) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Missing one of noris envs: MSSQL_HOST, MSSQL_DB, MSSQL_USERNAME, MSSQL_PASSWORD, MSSQL_PORT.'
      )
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      const connection = await this.createConnection()
      await connection.close()
    } catch (error) {
      this.logger.warn(
        this.throwerErrorGuard.BadRequestException(
          ErrorsEnum.BAD_REQUEST_ERROR,
          'Failed to close MSSQL connection on shutdown',
          undefined,
          error
        )
      )
    }
  }

  private async createConnection(): Promise<ConnectionPool> {
    return await connect({
      server: this.configService.getOrThrow<string>('MSSQL_HOST'),
      port: Number(this.configService.getOrThrow<string>('MSSQL_PORT')),
      database: this.configService.getOrThrow<string>('MSSQL_DB'),
      user: this.configService.getOrThrow<string>('MSSQL_USERNAME'),
      connectionTimeout: 120_000,
      requestTimeout: 120_000,
      password: this.configService.getOrThrow<string>('MSSQL_PASSWORD'),
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    })
  }

  private async waitForConnection(connection: ConnectionPool, maxWaitTime = 10_000): Promise<void> {
    const startTime = Date.now()

    return new Promise((resolve, reject) => {
      const checkConnection = () => {
        if (connection.connected) {
          resolve()
        } else if (Date.now() - startTime >= maxWaitTime) {
          reject(
            new ConnectionError(
              'Connection timeout: Database connection not established within timeout period',
              'ENOTOPEN'
            )
          )
        } else {
          setTimeout(checkConnection, 100)
        }
      }
      checkConnection()
    })
  }

  private addMssqlErrorDetailsToErrorMessage(errorMessage: string, error: unknown): string {
    if (error instanceof MSSQLError) {
      const mssqlErrorDetails = {
        code: error.code,
        message: error.message,
        name: error.name,
      }
      return `${errorMessage}: ${JSON.stringify(mssqlErrorDetails)}`
    }
    return errorMessage
  }

  private getNorisUrgentError(errorMessage: string, error: unknown) {
    return this.throwerErrorGuard.InternalServerErrorException(
      ErrorsEnum.INTERNAL_SERVER_ERROR,
      this.addMssqlErrorDetailsToErrorMessage(errorMessage, error),
      undefined,
      error
    )
  }

  private async handleDatabaseError(error: unknown, errorMessage: string): Promise<never> {
    // https://www.npmjs.com/package/mssql#errors
    if (!(error instanceof MSSQLError)) {
      throw this.getNorisUrgentError(errorMessage, error)
    }

    if (['ETIMEOUT', 'ENOTOPEN', 'ECONNCLOSED', 'EABORT', 'ECANCEL'].includes(error.code)) {
      await this.prismaService.$executeRaw`
        UPDATE "Config"
        SET "value" = (COALESCE("value",'0')::int + 1)::text
        WHERE "key" = ${NORIS_SILENT_CONNECTION_ERRORS_KEY}
      `

      throw this.throwerErrorGuard.BadRequestException(
        CustomErrorNorisTypesEnum.CONNECTION_ERROR,
        this.addMssqlErrorDetailsToErrorMessage(errorMessage, error),
        undefined,
        error
      )
    }

    throw this.getNorisUrgentError(errorMessage, error)
  }

  /**
   * Executes a function using the mssql global connection pool.
   *
   * mssql.connect() is idempotent:
   * - Pool already connected → resolves immediately (next tick via setImmediate)
   * - Pool null or disconnected → creates a new pool
   * Concurrent callers while a pool is being established are serialised by
   * mssql's internal _connectStack, so only one ConnectionPool is ever created.
   *
   * The connection is not closed, as it is expected to be shared and used for the lifetime of the application.
   *
   * @param operation - Function to execute with the connection pool
   * @param errorMessage - Message passed to {@link handleDatabaseError} on failure
   * @returns Result of the operation
   */
  async withConnection<T>(
    operation: (connection: ConnectionPool) => Promise<T>,
    errorMessage: string
  ): Promise<T> {
    try {
      const connection = await this.createConnection()
      await this.waitForConnection(connection)
      return await operation(connection)
    } catch (error) {
      return await this.handleDatabaseError(error, errorMessage)
    }
  }
}

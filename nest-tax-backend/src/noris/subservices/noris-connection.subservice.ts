import {
  ErrorEnum,
  ErrorFactoryService,
  LineLoggerSubservice,
} from '@bratislava/log-nest'
import { Injectable, OnModuleDestroy } from '@nestjs/common'
import {
  connect,
  ConnectionError,
  ConnectionPool,
  MSSQLError,
  RequestError,
} from 'mssql'

import BaConfigService from '../../config/ba-config.service'
import { PrismaService } from '../../prisma/prisma.service'
import { NORIS_SILENT_CONNECTION_ERRORS_KEY } from '../../utils/constants'
import { CustomErrorNorisTypesEnum } from '../noris.errors'

@Injectable()
export class NorisConnectionSubservice implements OnModuleDestroy {
  constructor(
    private readonly baConfigService: BaConfigService,
    private readonly errorFactoryService: ErrorFactoryService,
    private readonly prismaService: PrismaService,
    private readonly logger: LineLoggerSubservice,
  ) {}

  async onModuleDestroy(): Promise<void> {
    try {
      const connection = await this.createConnection()
      await connection.close()
    } catch (error) {
      this.logger.warn(
        this.errorFactoryService.BadRequestException({
          errorEnum: ErrorEnum.BAD_REQUEST_ERROR,
          message: 'Failed to close MSSQL connection on shutdown',
          error,
        }),
      )
    }
  }

  private async createConnection(): Promise<ConnectionPool> {
    return await connect({
      server: this.baConfigService.noris.host,
      port: 1433,
      database: this.baConfigService.noris.database,
      user: this.baConfigService.noris.username,
      connectionTimeout: 120_000,
      requestTimeout: 120_000,
      password: this.baConfigService.noris.password,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    })
  }

  private async waitForConnection(
    connection: ConnectionPool,
    maxWaitTime = 10_000,
  ): Promise<void> {
    const startTime = Date.now()

    return new Promise((resolve, reject) => {
      const checkConnection = () => {
        if (connection.connected) {
          resolve()
        } else if (Date.now() - startTime >= maxWaitTime) {
          reject(
            new ConnectionError(
              'Connection timeout: Database connection not established within timeout period',
              'ENOTOPEN',
            ),
          )
        } else {
          setTimeout(checkConnection, 100)
        }
      }
      checkConnection()
    })
  }

  private addMssqlErrorDetailsToErrorMessage(
    errorMessage: string,
    error: unknown,
  ): string {
    if (error instanceof MSSQLError) {
      const mssqlErrorDetails = {
        code: error.code,
        name: error.name,
      }
      return `${errorMessage}: ${JSON.stringify(mssqlErrorDetails)}`
    }
    return errorMessage
  }

  /**
   * Request error messages can quote bound parameter values (e.g. "Conversion failed when
   * converting the varchar value '…'"), and birth numbers / variable symbols are bound as
   * parameters, so only the structured fields of request errors are logged.
   */
  private toLoggableError(error: unknown): unknown {
    if (!(error instanceof RequestError)) {
      return error
    }
    const sanitizedError = new Error(
      `MSSQL request failed: ${JSON.stringify({
        code: error.code,
        number: error.number,
        state: error.state,
        class: error.class,
        lineNumber: error.lineNumber,
        procName: error.procName,
      })}`,
    )
    sanitizedError.name = error.name
    return sanitizedError
  }

  private getNorisUrgentError(
    errorMessage: string,
    error: unknown,
    logContext: Record<string, unknown>,
  ) {
    return this.errorFactoryService.InternalServerErrorException({
      errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
      message: this.addMssqlErrorDetailsToErrorMessage(errorMessage, error),
      console: error instanceof Error ? logContext : { ...logContext, error },
      error: error instanceof Error ? this.toLoggableError(error) : undefined,
    })
  }

  private async handleDatabaseError(
    error: unknown,
    errorMessage: string,
    logContext: Record<string, unknown>,
  ): Promise<never> {
    // https://www.npmjs.com/package/mssql#errors
    if (!(error instanceof MSSQLError)) {
      throw this.getNorisUrgentError(errorMessage, error, logContext)
    }

    if (
      ['ETIMEOUT', 'ENOTOPEN', 'ECONNCLOSED', 'EABORT', 'ECANCEL'].includes(
        error.code,
      )
    ) {
      await this.prismaService.$executeRaw`
        UPDATE "Config"
        SET "value" = (COALESCE("value",'0')::int + 1)::text
        WHERE "key" = ${NORIS_SILENT_CONNECTION_ERRORS_KEY}
      `

      throw this.errorFactoryService.BadRequestException({
        errorEnum: CustomErrorNorisTypesEnum.CONNECTION_ERROR,
        message: this.addMssqlErrorDetailsToErrorMessage(errorMessage, error),
        console: logContext,
        error: this.toLoggableError(error),
      })
    }

    throw this.getNorisUrgentError(errorMessage, error, logContext)
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
   * @param logContext - Non-PII values logged on failure (e.g. year, date range)
   * @returns Result of the operation
   */
  async withConnection<T>(
    operation: (connection: ConnectionPool) => Promise<T>,
    errorMessage: string,
    logContext?: Record<string, unknown>,
  ): Promise<T> {
    const startTime = Date.now()
    try {
      const connection = await this.createConnection()
      await this.waitForConnection(connection)
      return await operation(connection)
    } catch (error) {
      return await this.handleDatabaseError(error, errorMessage, {
        ...logContext,
        elapsedMs: Date.now() - startTime,
      })
    }
  }
}

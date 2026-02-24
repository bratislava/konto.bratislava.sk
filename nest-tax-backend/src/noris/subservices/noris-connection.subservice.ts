import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { config, connect, ConnectionPool, MSSQLError } from 'mssql'

import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { CustomErrorNorisTypesEnum } from '../noris.errors'
import { PrismaService } from '../../prisma/prisma.service'
import { NORIS_SILENT_CONNECTION_ERRORS_KEY } from '../../tasks/tasks.service'

@Injectable()
export class NorisConnectionSubservice {
  constructor(
    private readonly configService: ConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly prismaService: PrismaService,
  ) {
    if (
      !process.env.MSSQL_HOST ||
      !process.env.MSSQL_DB ||
      !process.env.MSSQL_USERNAME ||
      !process.env.MSSQL_PASSWORD
    ) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Missing one of pricing api envs: MSSQL_HOST, MSSQL_DB, MSSQL_USERNAME, MSSQL_PASSWORD.',
      )
    }
  }

  private async createConnection(
    configOverrides?: Partial<config>,
  ): Promise<ConnectionPool> {
    const connection = await connect({
      server: this.configService.getOrThrow<string>('MSSQL_HOST'),
      port: 1433,
      database: this.configService.getOrThrow<string>('MSSQL_DB'),
      user: this.configService.getOrThrow<string>('MSSQL_USERNAME'),
      connectionTimeout: 120_000,
      requestTimeout: 120_000,
      password: this.configService.getOrThrow<string>('MSSQL_PASSWORD'),
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
      ...configOverrides,
    })

    return connection
  }

  private async createOptimizedConnection(): Promise<ConnectionPool> {
    return this.createConnection({
      connectionTimeout: 60_000,
      requestTimeout: 180_000,
    })
  }

  private async waitForConnection(
    connection: ConnectionPool,
    maxWaitTime: number = 10_000,
  ): Promise<void> {
    const startTime = Date.now()

    return new Promise((resolve, reject) => {
      const checkConnection = () => {
        if (connection.connected) {
          resolve()
        } else if (Date.now() - startTime >= maxWaitTime) {
          reject(
            new Error(
              'Connection timeout: Database connection not established within timeout period',
            ),
          )
        } else {
          setTimeout(checkConnection, 100)
        }
      }
      checkConnection()
    })
  }

  private addMssqlErrorDetailsToErrorMessage(errorMessage: string, error: any): string {
    if (error instanceof MSSQLError) {
      const mssqlErrorDetails = {
        code: error.code,
        message: error.message,
        number: error.name,
      }
      return `${errorMessage}: ${JSON.stringify(mssqlErrorDetails)}`
    }
    return errorMessage
  }

  private getNorisUrgentError(errorMessage: string, error: any) {
    return this.throwerErrorGuard.InternalServerErrorException(
      ErrorsEnum.INTERNAL_SERVER_ERROR,
      this.addMssqlErrorDetailsToErrorMessage(errorMessage, error),
      undefined,
      error instanceof Error ? undefined : <string>error,
      error instanceof Error ? error : undefined,
    )
  }

  private async handleDatabaseError(error: any, errorMessage: string): Promise<never> {
    // https://www.npmjs.com/package/mssql#errors
    if (!(error instanceof MSSQLError)) {
      throw this.getNorisUrgentError(errorMessage, error)
    }
    
    if ([
      'ETIMEOUT',
      'ENOTOPEN',
      'ECONNCLOSED',
      'EABORT',
      'ECANCEL',
      'ETIMEOUT'
    ].includes(error.code)) {
      await this.prismaService.$transaction(async (tx) => {
        const config = await tx.config.findFirst({
          where: {
            key: NORIS_SILENT_CONNECTION_ERRORS_KEY,
          },
        })
        const currentValue = config ? Number(config.value) : 0

        await tx.config.updateMany({
          where: {
            key: NORIS_SILENT_CONNECTION_ERRORS_KEY,
          },
          data: {
            value: (currentValue + 1).toString(),
          },
        })
      })

      throw this.throwerErrorGuard.InternalServerErrorException(
        CustomErrorNorisTypesEnum.CONNECTION_ERROR,
        this.addMssqlErrorDetailsToErrorMessage(errorMessage, error),
        undefined,
        error instanceof Error ? undefined : <string>error,
        error instanceof Error ? error : undefined,
      )
    }
    
    throw this.getNorisUrgentError(errorMessage, error)
  }

  /**
   * Executes a function within a database connection context.
   * Creates a connection, executes the function, and ensures proper cleanup.
   *
   * @param operation - Function to execute within the connection context
   * @param errorHandler - Error handler for any errors that occur during the operation
   * @param useOptimized - Whether to use optimized connection settings
   * @returns Result of the operation
   */
  async withConnection<T>(
    operation: (connection: ConnectionPool) => Promise<T>,
    errorMessage: string,
    useOptimized: boolean = false,
  ): Promise<T> {
    const connection = useOptimized
      ? await this.createOptimizedConnection()
      : await this.createConnection()

    try {
      await this.waitForConnection(connection)
      const result = await operation(connection)
      return result
    } catch (error) {
      return await this.handleDatabaseError(error, errorMessage)
    } finally {
      await connection.close()
    }
  }
}

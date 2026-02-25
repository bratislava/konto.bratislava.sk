import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import { config, connect, ConnectionPool, Int } from 'mssql'
import { EdeskRecord, EdeskRecordSchema } from './types/noris.types'
import { NorisValidatorSubservice } from './subservices/noris-validator.subservice'

@Injectable()
export class NorisService {
  constructor(
    private readonly configService: ConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly norisValidatorSubservice: NorisValidatorSubservice
  ) {
    if (
      !process.env.MSSQL_HOST ||
      !process.env.MSSQL_DB ||
      !process.env.MSSQL_USERNAME ||
      !process.env.MSSQL_PASSWORD
    ) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Missing one of pricing api envs: MSSQL_HOST, MSSQL_DB, MSSQL_USERNAME, MSSQL_PASSWORD.'
      )
    }
    this.getExternalEdeskChecks(10, 10).then(console.log)
  }

  private async createConnection(configOverrides?: Partial<config>): Promise<ConnectionPool> {
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

  private async waitForConnection(
    connection: ConnectionPool,
    maxWaitTime: number = 10_000
  ): Promise<void> {
    const startTime = Date.now()

    return new Promise((resolve, reject) => {
      const checkConnection = () => {
        if (connection.connected) {
          resolve()
        } else if (Date.now() - startTime >= maxWaitTime) {
          reject(
            new Error(
              'Connection timeout: Database connection not established within timeout period'
            )
          )
        } else {
          setTimeout(checkConnection, 100)
        }
      }
      checkConnection()
    })
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
  private async withConnection<T>(
    operation: (connection: ConnectionPool) => Promise<T>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errorHandler: (error: any) => never
  ): Promise<T> {
    const connection = await this.createConnection()

    try {
      await this.waitForConnection(connection)
      const result = await operation(connection)
      return result
    } catch (error) {
      return errorHandler(error)
    } finally {
      await connection.close()
    }
  }

  async getExternalEdeskChecks(
    physicalPersons: number,
    legalPersons: number
  ): Promise<EdeskRecord[]> {
    return this.withConnection(
      async (connection) => {
        const result = await connection
          .request()
          .input('numso', Int, physicalPersons)
          .input('numpo', Int, legalPersons)
          .execute('lcs.usp21_ino_check_edesk')

        return this.norisValidatorSubservice.validateNorisData(EdeskRecordSchema, result.recordset)
      },
      (error) => {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to get external edesk checks',
          undefined,
          error
        )
      }
    )
  }
}

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import { config, connect, ConnectionPool } from 'mssql'
import { EdeskRecord, EdeskRecordSchema, UpdateEdeskChecks } from './types/noris.types'
import { NorisValidatorSubservice } from './subservices/noris-validator.subservice'
import * as mssql from 'mssql'
import pLimit from 'p-limit'

@Injectable()
export class NorisService {
  private readonly concurrency = Number(process.env.DB_CONCURRENCY ?? 10)

  private readonly concurrencyLimit = pLimit(this.concurrency)

  constructor(
    private readonly configService: ConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly norisValidatorSubservice: NorisValidatorSubservice
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

  private async createConnection(configOverrides?: Partial<config>): Promise<ConnectionPool> {
    const connection = await connect({
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
          .input('numSO', mssql.Int, physicalPersons)
          .input('numPO', mssql.Int, legalPersons)
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

  async updateEdeskChecks(edeskChecks: UpdateEdeskChecks[]): Promise<void> {
    const edeskUpdateProcessed = edeskChecks.map((edeskCheck) =>
      this.concurrencyLimit(async () =>
        this.withConnection(
          async (connection) => {
            await connection
              .request()
              .input('id_noris', mssql.Int, edeskCheck.idNoris)
              .input('edesk_status', mssql.VarChar, edeskCheck.edeskStatus)
              .input('edesk_number', mssql.VarChar, edeskCheck.edeskNumber)
              .input('edesk_uri', mssql.VarChar, edeskCheck.uri)
              .input('edesk_pco', mssql.VarChar, null)
              .input('last_check', mssql.DateTime, edeskCheck.lastCheck)
              .execute('lcs.usp21_ino_edesk_update')
          },
          (error) => {
            throw this.throwerErrorGuard.InternalServerErrorException(
              ErrorsEnum.INTERNAL_SERVER_ERROR,
              'Failed to update edesk checks',
              undefined,
              error
            )
          }
        )
      )
    )

    await Promise.all(edeskUpdateProcessed)
  }
}

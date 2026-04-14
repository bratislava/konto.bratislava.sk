import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import { connect, ConnectionError, ConnectionPool } from 'mssql'
import { EdeskRecord, EdeskRecordSchema, UpdateEdeskChecks } from './types/noris.types'
import { NorisValidatorSubservice } from './subservices/noris-validator.subservice'
import * as mssql from 'mssql'
import pLimit from 'p-limit'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'

@Injectable()
export class NorisService implements OnModuleDestroy {
  private readonly concurrency = Number(process.env.DB_CONCURRENCY ?? 10)

  private readonly concurrencyLimit = pLimit(this.concurrency)

  private readonly logger = new LineLoggerSubservice(NorisService.name)

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
   * @param operation - Function to execute within the connection context
   * @param errorHandler - Error handler for any errors that occur during the operation
   * @returns Result of the operation
   */
  private async withConnection<T>(
    operation: (connection: ConnectionPool) => Promise<T>,
    errorHandler: (error: unknown) => never
  ): Promise<T> {
    try {
      const connection = await this.createConnection()
      await this.waitForConnection(connection)
      return await operation(connection)
    } catch (error) {
      return errorHandler(error)
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

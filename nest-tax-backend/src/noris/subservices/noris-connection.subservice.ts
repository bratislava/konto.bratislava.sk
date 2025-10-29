import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { config, connect, ConnectionPool } from 'mssql'

import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'

@Injectable()
export class NorisConnectionSubservice
  implements OnModuleInit, OnModuleDestroy
{
  private connectionPool: ConnectionPool

  constructor(
    private readonly configService: ConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
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

  async onModuleInit() {
    this.connectionPool = await this.createConnectionPool()
  }

  async onModuleDestroy() {
    await this.connectionPool.close()
  }

  private async createConnectionPool(
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

  /**
   * Executes a function within a database connection context.
   * Creates a connection, executes the function, and ensures proper cleanup.
   *
   * @param operation - Function to execute within the connection context
   * @param useOptimized - Whether to use optimized connection settings
   * @returns Result of the operation
   */
  async withConnection<T>(
    operation: (connection: ConnectionPool) => Promise<T>,
    errorHandler: (error: any) => never,
  ): Promise<T> {
    try {
      await this.waitForConnection(this.connectionPool)
      const result = await operation(this.connectionPool)
      return result
    } catch (error) {
      return errorHandler(error)
    }
  }
}

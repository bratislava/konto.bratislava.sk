import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { connect, Request } from 'mssql'
import {
  RequestPostNorisLoadDataDto,
  RequestPostNorisPaymentDataLoadByVariableSymbolsDto,
  RequestPostNorisPaymentDataLoadDto,
} from 'src/admin/dtos/requests.dto'

import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import {
  queryPayersFromNoris,
  queryPaymentsFromNoris,
  setDeliveryMethodsForUser,
} from './noris.queries'
import { UpdateNorisDeliveryMethods } from './noris.types'

@Injectable()
export class NorisService {
  private readonly logger: Logger = new Logger('NorisService')

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

  async getDataFromNoris(data: RequestPostNorisLoadDataDto) {
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
    })

    let birthNumbers = ''
    if (data.birthNumbers !== 'All') {
      data.birthNumbers.forEach((birthNumber) => {
        birthNumbers += `'${birthNumber}',`
      })
      if (birthNumbers.length > 0) {
        birthNumbers = `AND lcs.dane21_priznanie.rodne_cislo IN (${birthNumbers.slice(0, -1)})`
      }
    }
    const norisData = await connection.query(
      queryPayersFromNoris
        .replaceAll('{%YEAR%}', data.year.toString())
        .replaceAll('{%BIRTHNUMBERS%}', birthNumbers),
    )
    connection.close()
    return norisData.recordset
  }

  async getPaymentDataFromNoris(data: RequestPostNorisPaymentDataLoadDto) {
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
    })
    let { fromDate } = data
    let { toDate } = data
    if (!fromDate) {
      const newFromDate = new Date(`${data.year}-04-01`)
      fromDate = newFromDate.toDateString()
    }
    if (!toDate) {
      const newToDate = new Date()
      newToDate.setHours(0, 0, 0, 0)
      toDate = newToDate.toDateString()
    }
    let overpayments = ''
    if (data.overPayments) {
      overpayments =
        'OR lcs.dane21_doklad_sum_saldo.datum_posledni_platby is NULL'
    }
    const norisData = await connection.query(
      queryPaymentsFromNoris
        .replaceAll(
          '{%FROM_TO_AND_OVERPAYMENTS_SETTINGS%}',
          `AND (
            (lcs.dane21_doklad_sum_saldo.datum_posledni_platby >= '${fromDate}' AND lcs.dane21_doklad_sum_saldo.datum_posledni_platby <= '${toDate}')
            ${overpayments}
        )`,
        )
        .replaceAll('{%YEARS%}', `= ${data.year.toString()}`)
        .replaceAll('{%VARIABLE_SYMBOLS%}', ''),
    )
    connection.close()
    return norisData.recordset
  }

  async getPaymentDataFromNorisByVariableSymbols(
    data: RequestPostNorisPaymentDataLoadByVariableSymbolsDto,
  ) {
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
    })

    let variableSymbols = ''
    data.variableSymbols.forEach((variableSymbol) => {
      if (/^\d+$/.test(variableSymbol)) {
        variableSymbols += `'${variableSymbol}',`
      } else {
        this.logger.error(
          this.throwerErrorGuard.InternalServerErrorException(
            ErrorsEnum.INTERNAL_SERVER_ERROR,
            `Variable symbol has a wrong format: "${variableSymbol}"`,
          ),
        )
      }
    })
    variableSymbols = `(${variableSymbols.slice(0, -1)})`

    if (data.years.length === 0) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Years are empty in payment data import from Noris request.',
      )
    }

    const norisData = await connection.query(
      queryPaymentsFromNoris
        .replaceAll('{%YEARS%}', `IN (${data.years.join(',')})`)
        .replaceAll(
          '{%VARIABLE_SYMBOLS%}',
          `AND dane21_doklad.variabilny_symbol IN ${variableSymbols}`,
        )
        .replaceAll('{%FROM_TO_AND_OVERPAYMENTS_SETTINGS%}', ''),
    )
    connection.close()
    return norisData.recordset
  }

  async updateDeliveryMethods(
    data: UpdateNorisDeliveryMethods[],
  ): Promise<void> {
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
    })

    try {
      await Promise.all(
        data.map(async (dataItem) => {
          const request = new Request(connection)

          // Set parameters for the query
          request.input('dkba_stav', dataItem.inCityAccount)
          request.input(
            'dkba_datum_suhlasu',
            dataItem.date ? new Date(dataItem.date) : null,
          )
          request.input('dkba_sposob_dorucovania', dataItem.deliveryMethod)

          const birthNumberPlaceholders = dataItem.birthNumbers
            .map((_, index) => `@birthnumber${index}`)
            .join(',')
          dataItem.birthNumbers.forEach((birthNumber, index) => {
            request.input(`birthnumber${index}`, birthNumber)
          })
          const queryWithPlaceholders = setDeliveryMethodsForUser.replaceAll(
            '@birth_numbers',
            birthNumberPlaceholders,
          )

          // Execute the query
          return request.query(queryWithPlaceholders)
        }),
      )
    } catch (error) {
      if (error instanceof Error) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to update delivery methods',
          undefined,
          undefined,
          error,
        )
      }
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Failed to update delivery methods',
        undefined,
        <string>error,
      )
    } finally {
      // Always close the connection
      await connection.close()
    }
  }
}

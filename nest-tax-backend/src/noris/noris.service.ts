import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { connect } from 'mssql'
import {
  RequestPostNorisLoadDataDto,
  RequestPostNorisPaymentDataLoadByVariableSymbolsDto,
  RequestPostNorisPaymentDataLoadDto,
} from 'src/admin/dtos/requests.dto'

import { queryPayersFromNoris, queryPaymentsFromNoris } from './noris.queries'

@Injectable()
export class NorisService {
  private logger: Logger = new Logger('NorisService')

  constructor(private readonly configService: ConfigService) {
    if (
      !process.env.MSSQL_HOST ||
      !process.env.MSSQL_DB ||
      !process.env.MSSQL_USERNAME ||
      !process.env.MSSQL_PASSWORD
    ) {
      throw new Error(
        'Missing on of pricing api envs: MSSQL_HOST, MSSQL_DB, MSSQL_USERNAME, MSSQL_PASSWORD.',
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
        .replaceAll('{%YEAR%}', data.year.toString())
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
          `ERROR 500 - variable symbol has a wrong format: "${variableSymbol}"`,
        )
      }
    })
    variableSymbols = `(${variableSymbols.slice(0, -1)})`

    const norisData = await connection.query(
      queryPaymentsFromNoris
        .replaceAll('{%YEAR%}', data.year.toString())
        .replaceAll(
          '{%VARIABLE_SYMBOLS%}',
          `AND dane21_doklad.variabilny_symbol IN ${variableSymbols}`,
        )
        .replaceAll('{%FROM_TO_AND_OVERPAYMENTS_SETTINGS%}', ''),
    )
    connection.close()
    return norisData.recordset
  }
}

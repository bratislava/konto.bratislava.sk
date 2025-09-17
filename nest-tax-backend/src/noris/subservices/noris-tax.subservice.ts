import { Injectable } from '@nestjs/common'
import { Request } from 'mssql'

import { RequestPostNorisLoadDataDto } from '../../admin/dtos/requests.dto'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { NorisTaxPayersDto, NorisUpdateDto } from '../noris.dto'
import {
  getNorisDataForUpdate,
  queryPayersFromNoris,
} from '../utils/noris.queries'
import { NorisConnectionSubservice } from './noris-connection.subservice'

@Injectable()
export class NorisTaxSubservice {
  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly connectionService: NorisConnectionSubservice,
  ) {}

  async getTaxDataByYearAndBirthNumber(
    data: RequestPostNorisLoadDataDto,
  ): Promise<NorisTaxPayersDto[]> {
    const connection = await this.connectionService.createConnection()

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

  async getDataForUpdate(
    variableSymbols: string[],
    years: number[],
  ): Promise<NorisUpdateDto[]> {
    const connection = await this.connectionService.createOptimizedConnection()

    try {
      // Wait for connection to be fully established
      await this.connectionService.waitForConnection(connection)

      const request = new Request(connection)

      const variableSymbolsPlaceholders = variableSymbols
        .map((_, index) => `@variablesymbol${index}`)
        .join(',')
      variableSymbols.forEach((variableSymbol, index) => {
        request.input(`variablesymbol${index}`, variableSymbol)
      })

      const yearsPlaceholders = years
        .map((_, index) => `@year${index}`)
        .join(',')
      years.forEach((year, index) => {
        request.input(`year${index}`, year)
      })

      const queryWithPlaceholders = getNorisDataForUpdate
        .replaceAll('@variable_symbols', variableSymbolsPlaceholders)
        .replaceAll('@years', yearsPlaceholders)

      const norisData = await request.query(queryWithPlaceholders)
      return norisData.recordset
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        `Failed to get data from Noris during tax update`,
        undefined,
        error instanceof Error ? undefined : <string>error,
        error instanceof Error ? error : undefined,
      )
    } finally {
      // Always close the connection
      await connection.close()
    }
  }
}

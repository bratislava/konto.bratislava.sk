import { Injectable, Logger } from '@nestjs/common'

import {
  RequestPostNorisPaymentDataLoadByVariableSymbolsDto,
  RequestPostNorisPaymentDataLoadDto,
} from '../../admin/dtos/requests.dto'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { queryPaymentsFromNoris } from '../utils/noris.queries'
import { NorisConnectionSubservice } from './noris-connection.subservice'

@Injectable()
export class NorisPaymentSubservice {
  private readonly logger: Logger = new Logger('NorisService')

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly connectionService: NorisConnectionSubservice,
  ) {}

  async getPaymentDataFromNoris(data: RequestPostNorisPaymentDataLoadDto) {
    const connection = await this.connectionService.createConnection()
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
    const connection = await this.connectionService.createConnection()

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
}

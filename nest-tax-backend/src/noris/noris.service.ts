import { Injectable } from '@nestjs/common'
import { LoadingPaymentsFromNoris } from '@prisma/client'
import { connect } from 'mssql'
import {
  RequestPostNorisLoadDataDto,
  RequestPostNorisPaymentDataLoadDto,
} from 'src/admin/dtos/requests.dto'

import { queryPayersFromNoris, queryPaymentsFromNoris } from './noris.queries'

@Injectable()
export class NorisService {
  constructor() {
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
      server: process.env.MSSQL_HOST,
      port: 1433,
      database: process.env.MSSQL_DB,
      user: process.env.MSSQL_USERNAME,
      connectionTimeout: 120_000,
      requestTimeout: 120_000,
      password: process.env.MSSQL_PASSWORD,
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

  async getPaymentDataFromNoris(
    data: RequestPostNorisPaymentDataLoadDto,
    lastLodedPayment?: LoadingPaymentsFromNoris | null,
  ) {
    const connection = await connect({
      server: process.env.MSSQL_HOST,
      port: 1433,
      database: process.env.MSSQL_DB,
      user: process.env.MSSQL_USERNAME,
      connectionTimeout: 120_000,
      requestTimeout: 120_000,
      password: process.env.MSSQL_PASSWORD,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    })
    let { fromDate } = data
    let { toDate } = data
    if (!fromDate) {
      if (lastLodedPayment) {
        fromDate = lastLodedPayment.loadingDateTo.toDateString()
      } else {
        const newFromDate = new Date(`${data.year}-04-01`)
        fromDate = newFromDate.toDateString()
      }
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
        .replaceAll('{%YEAR%}', data.year.toString())
        .replaceAll('{%FROM_DATE%}', fromDate)
        .replaceAll('{%TO_DATE%}', toDate)
        .replaceAll('{%OVERPAYMENTS%}', overpayments),
    )
    connection.close()
    return norisData.recordset
  }
}

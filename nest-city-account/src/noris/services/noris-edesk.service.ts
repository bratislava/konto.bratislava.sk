import { Injectable } from '@nestjs/common'
import * as mssql from 'mssql'
import pLimit from 'p-limit'

import { EdeskRecord, EdeskRecordSchema, UpdateEdeskChecks } from '../types/noris.types'
import { NorisConnectionService } from './noris-connection.service'
import { NorisValidatorService } from './noris-validator.service'

@Injectable()
export class NorisEdeskService {
  private readonly concurrency = Number(process.env.DB_CONCURRENCY ?? 10)

  private readonly concurrencyLimit = pLimit(this.concurrency)

  constructor(
    private readonly connectionService: NorisConnectionService,
    private readonly validatorService: NorisValidatorService
  ) {}

  async getExternalEdeskChecks(
    physicalPersons: number,
    legalPersons: number
  ): Promise<EdeskRecord[]> {
    return this.connectionService.withConnection(async (connection) => {
      const result = await connection
        .request()
        .input('numSO', mssql.Int, physicalPersons)
        .input('numPO', mssql.Int, legalPersons)
        .execute('lcs.usp21_ino_check_edesk')

      return this.validatorService.validateNorisData(EdeskRecordSchema, result.recordset)
    }, 'Failed to get external edesk checks')
  }

  async updateEdeskChecks(edeskChecks: UpdateEdeskChecks[]): Promise<void> {
    const edeskUpdateProcessed = edeskChecks.map(async (edeskCheck) =>
      this.concurrencyLimit(async () =>
        this.connectionService.withConnection(async (connection) => {
          await connection
            .request()
            .input('id_noris', mssql.Int, edeskCheck.idNoris)
            .input('edesk_status', mssql.VarChar, edeskCheck.edeskStatus)
            .input('edesk_number', mssql.VarChar, edeskCheck.edeskNumber)
            .input('edesk_uri', mssql.VarChar, edeskCheck.uri)
            .input('edesk_pco', mssql.VarChar, null)
            .input('last_check', mssql.DateTime, edeskCheck.lastCheck)
            .input('death_date', mssql.VarChar, edeskCheck.deathDate)
            .execute('lcs.usp21_ino_edesk_update')
        }, 'Failed to update edesk checks')
      )
    )

    await Promise.all(edeskUpdateProcessed)
  }
}

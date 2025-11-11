import { Injectable } from '@nestjs/common'
import * as mssql from 'mssql'

import { RequestUpdateNorisDeliveryMethodsDto } from '../../admin/dtos/requests.dto'
import { UpdateDeliveryMethodsInNorisResponseDto } from '../../admin/dtos/responses.dto'
import { addSlashToBirthNumber } from '../../utils/functions/birthNumber'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import {
  NorisDeliveryMethodsUpdateResultSchema,
  NorisOrganizationResultSchema,
} from '../types/noris.schema'
import { NorisDeliveryMethodsUpdateResult } from '../types/noris.types'
import { mapDeliveryMethodToNoris } from '../utils/mapping.helper'
import {
  getBirthNumbersForSubjects,
  setDeliveryMethodsForUser,
} from '../utils/noris.queries'
import {
  DeliveryMethod,
  IsInCityAccount,
  UpdateNorisDeliveryMethods,
} from '../utils/noris.types'
import { NorisConnectionSubservice } from './noris-connection.subservice'
import { NorisValidatorSubservice } from './noris-validator.subservice'

@Injectable()
export class NorisDeliveryMethodSubservice {
  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly connectionService: NorisConnectionSubservice,
    private readonly norisValidatorSubservice: NorisValidatorSubservice,
  ) {}

  private async updateDeliveryMethodsInNoris(
    data: UpdateNorisDeliveryMethods[],
  ): Promise<string[]> {
    const updatedSubjects = await this.connectionService.withConnection(
      async (connection) => {
        const updatePromises = data.map((dataItem) =>
          this.executeDeliveryMethodUpdate(connection, dataItem),
        )
        return Promise.all(updatePromises)
      },
      (error) => {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to update delivery methods',
          undefined,
          undefined,
          error,
        )
      },
    )

    return this.getBirthNumbersWithUpdatedDeliveryMethods(
      updatedSubjects.flat(),
    )
  }

  private async executeDeliveryMethodUpdate(
    connection: mssql.ConnectionPool,
    dataItem: UpdateNorisDeliveryMethods,
  ): Promise<NorisDeliveryMethodsUpdateResult[]> {
    const request = new mssql.Request(connection)

    // Set parameters for the query
    request.input('dkba_stav', mssql.VarChar(1), dataItem.inCityAccount)
    request.input(
      'dkba_datum_suhlasu',
      mssql.DateTime,
      dataItem.date ? new Date(dataItem.date) : null,
    )
    request.input(
      'dkba_sposob_dorucovania',
      mssql.VarChar(1),
      mapDeliveryMethodToNoris(dataItem.deliveryMethod),
    )

    const birthNumberPlaceholders = dataItem.birthNumbers
      .map((_, index) => `@birthnumber${index}`)
      .join(',')
    dataItem.birthNumbers.forEach((birthNumber, index) => {
      request.input(`birthnumber${index}`, mssql.VarChar(20), birthNumber)
    })
    const queryWithPlaceholders = setDeliveryMethodsForUser.replaceAll(
      '@birth_numbers',
      birthNumberPlaceholders,
    )

    const result = await request.query(queryWithPlaceholders)
    return this.norisValidatorSubservice.validateNorisData(
      NorisDeliveryMethodsUpdateResultSchema,
      result.recordset,
    )
  }

  private async getBirthNumbersWithUpdatedDeliveryMethods(
    data: NorisDeliveryMethodsUpdateResult[],
  ): Promise<string[]> {
    const updatedSubjects = data.map((item) => item.cislo_subjektu)

    if (updatedSubjects.length === 0) {
      return []
    }

    return this.connectionService.withConnection(
      async (connection) => {
        const request = new mssql.Request(connection)

        // Set parameters for the query
        const subjectPlaceholders = updatedSubjects
          .map((_, index) => `@subject${index}`)
          .join(',')
        updatedSubjects.forEach((subject, index) => {
          request.input(`subject${index}`, subject)
        })
        const queryWithPlaceholders = getBirthNumbersForSubjects.replaceAll(
          '@subjects',
          subjectPlaceholders,
        )

        // Execute the query
        const result = await request.query(queryWithPlaceholders)
        const validatedResult = this.norisValidatorSubservice.validateNorisData(
          NorisOrganizationResultSchema,
          result.recordset,
        )
        return validatedResult.map((record: { ico: string }) =>
          record.ico.trim(),
        ) // Birth numbers are stored in `ico` column in the respective table
      },
      (error) => {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to get birth numbers for updated subjects',
          undefined,
          error instanceof Error ? undefined : <string>error,
          error instanceof Error ? error : undefined,
        )
      },
    )
  }

  async updateDeliveryMethods({ data }: RequestUpdateNorisDeliveryMethodsDto) {
    /**
     * TODO - concurrency (if someone somehow changes his delivery method during its updating in Noris)
     */
    const deliveryGroups: Record<
      DeliveryMethod,
      { birthNumber: string; date: string | null }[]
    > = {
      [DeliveryMethod.EDESK]: [],
      [DeliveryMethod.CITY_ACCOUNT]: [],
      [DeliveryMethod.POSTAL]: [],
    }

    Object.entries(data).forEach(([birthNumber, methodInfo]) => {
      if (!(methodInfo.deliveryMethod in deliveryGroups)) {
        return
      }

      if (
        methodInfo.deliveryMethod === DeliveryMethod.CITY_ACCOUNT &&
        !methodInfo.date
      ) {
        // We must enforce that the date is present for CITY_ACCOUNT delivery method.
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `Date must be provided for birth number ${birthNumber} when delivery method is CITY_ACCOUNT`,
        )
      }

      deliveryGroups[methodInfo.deliveryMethod].push({
        birthNumber: addSlashToBirthNumber(birthNumber),
        date:
          methodInfo.deliveryMethod === DeliveryMethod.CITY_ACCOUNT
            ? methodInfo.date
            : null,
      })
    })

    const updates: UpdateNorisDeliveryMethods[] = Object.entries(deliveryGroups)
      .filter(
        ([deliveryMethod, birthNumbers]) =>
          birthNumbers.length > 0 &&
          deliveryMethod !== DeliveryMethod.CITY_ACCOUNT,
      )
      .map(([deliveryMethod, birthNumbers]) => {
        return {
          birthNumbers: birthNumbers.map((item) => item.birthNumber),
          inCityAccount: IsInCityAccount.YES,
          deliveryMethod: deliveryMethod as DeliveryMethod,
          date: null, // date of confirmation of delivery method should be set only for city account notification
        }
      })

    deliveryGroups[DeliveryMethod.CITY_ACCOUNT].forEach((item) => {
      updates.push({
        birthNumbers: [item.birthNumber],
        inCityAccount: IsInCityAccount.YES,
        deliveryMethod: DeliveryMethod.CITY_ACCOUNT,
        date: item.date,
      })
    })

    const result: UpdateDeliveryMethodsInNorisResponseDto = {
      birthNumbers: [],
    }

    if (updates.length > 0) {
      result.birthNumbers = await this.updateDeliveryMethodsInNoris(updates)
    }

    return result
  }

  async removeDeliveryMethodsFromNoris(birthNumber: string): Promise<void> {
    await this.updateDeliveryMethodsInNoris([
      {
        birthNumbers: [addSlashToBirthNumber(birthNumber)],
        inCityAccount: IsInCityAccount.NO,
        deliveryMethod: null,
        date: null,
      },
    ])
  }
}

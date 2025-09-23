import { Injectable } from '@nestjs/common'
import { Request } from 'mssql'

import { RequestUpdateNorisDeliveryMethodsDto } from '../../admin/dtos/requests.dto'
import { UpdateDeliveryMethodsInNorisResponseDto } from '../../admin/dtos/responses.dto'
import { addSlashToBirthNumber } from '../../utils/functions/birthNumber'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { NorisDeliveryMethodsUpdateResultDto } from '../noris.dto'
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

@Injectable()
export class NorisDeliveryMethodSubservice {
  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly connectionService: NorisConnectionSubservice,
  ) {}

  async updateDeliveryMethodsInNoris(
    data: UpdateNorisDeliveryMethods[],
  ): Promise<string[]> {
    const connection = await this.connectionService.createConnection()

    try {
      const result = await Promise.all(
        data.map(async (dataItem) => {
          const request = new Request(connection)

          // Set parameters for the query
          request.input('dkba_stav', dataItem.inCityAccount)
          request.input(
            'dkba_datum_suhlasu',
            dataItem.date ? new Date(dataItem.date) : null,
          )
          request.input(
            'dkba_sposob_dorucovania',
            mapDeliveryMethodToNoris(dataItem.deliveryMethod),
          )

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
          return request.query(
            queryWithPlaceholders,
          ) as Promise<NorisDeliveryMethodsUpdateResultDto>
        }),
      )

      const birthNumbersUpdated =
        await this.getBirthNumbersWithUpdatedDeliveryMethods(result)
      return birthNumbersUpdated
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Failed to update delivery methods',
        undefined,
        undefined,
        error,
      )
    } finally {
      // Always close the connection
      await connection.close()
    }
  }

  private async getBirthNumbersWithUpdatedDeliveryMethods(
    data: NorisDeliveryMethodsUpdateResultDto[],
  ): Promise<string[]> {
    const updatedSubjects = data.flatMap((item) =>
      item.recordset.map((record) => record.cislo_subjektu),
    )

    if (updatedSubjects.length === 0) {
      return []
    }

    const connection = await this.connectionService.createConnection()

    try {
      const request = new Request(connection)

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
      return result.recordset.map((record: { ico: string }) =>
        record.ico.trim(),
      ) // Birth numbers are stored in `ico` column in the respective table
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Failed to get birth numbers for updated subjects',
        undefined,
        error instanceof Error ? undefined : <string>error,
        error instanceof Error ? error : undefined,
      )
    } finally {
      await connection.close()
    }
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

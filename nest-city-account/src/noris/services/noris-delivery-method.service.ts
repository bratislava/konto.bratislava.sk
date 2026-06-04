import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import * as mssql from 'mssql'

import { addSlashToBirthNumber } from '../../utils/functions/birthNumber'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { DeliveryMethod, IsInCityAccount, UpdateNorisDeliveryMethods } from '../types/noris.enums'
import {
  NorisDeliveryMethodsUpdateResultSchema,
  NorisOrganizationResultSchema,
} from '../types/noris.schema'
import { mapDeliveryMethodToNoris } from '../utils/mapping.helper'
import { getBirthNumbersForSubjects, setDeliveryMethodsForUser } from '../utils/noris.queries'
import { NorisConnectionService } from './noris-connection.service'
import { NorisValidatorService } from './noris-validator.service'

export type UpdateNorisDeliveryMethodsData = Record<
  string,
  | { deliveryMethod: DeliveryMethod.CITY_ACCOUNT; date: string }
  | { deliveryMethod: DeliveryMethod.EDESK | DeliveryMethod.POSTAL; date?: string }
>

export interface UpdateDeliveryMethodsInNorisResponseDto {
  birthNumbers: string[]
}

interface NorisDeliveryMethodsUpdateResult {
  cislo_subjektu: number
}

@Injectable()
export class NorisDeliveryMethodService {
  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly connectionService: NorisConnectionService,
    private readonly validatorService: NorisValidatorService
  ) {}

  static async acquireDeliveryMethodLock(
    tx: Prisma.TransactionClient,
    birthNumber: string
  ): Promise<void> {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('noris_delivery_method'), hashtext(${birthNumber}))`
  }

  private async updateDeliveryMethodsInNoris(
    data: UpdateNorisDeliveryMethods[]
  ): Promise<string[]> {
    const updatedSubjects = await this.connectionService.withConnection(async (connection) => {
      const updatePromises = data.map(async (dataItem) =>
        this.executeDeliveryMethodUpdate(connection, dataItem)
      )
      return Promise.all(updatePromises)
    }, 'Failed to update delivery methods')

    return this.getBirthNumbersWithUpdatedDeliveryMethods(updatedSubjects.flat())
  }

  private async executeDeliveryMethodUpdate(
    connection: mssql.ConnectionPool,
    dataItem: UpdateNorisDeliveryMethods
  ): Promise<NorisDeliveryMethodsUpdateResult[]> {
    const request = new mssql.Request(connection)

    request.input('dkba_stav', mssql.VarChar(1), dataItem.inCityAccount)
    request.input(
      'dkba_datum_suhlasu',
      mssql.DateTime,
      dataItem.date ? new Date(dataItem.date) : null
    )
    request.input(
      'dkba_sposob_dorucovania',
      mssql.VarChar(1),
      mapDeliveryMethodToNoris(dataItem.deliveryMethod)
    )

    const birthNumberPlaceholders = dataItem.birthNumbers
      .map((_, index) => `@birthnumber${index}`)
      .join(',')
    dataItem.birthNumbers.forEach((birthNumber, index) => {
      request.input(`birthnumber${index}`, mssql.VarChar(20), birthNumber)
    })
    const queryWithPlaceholders = setDeliveryMethodsForUser.replaceAll(
      '@birth_numbers',
      birthNumberPlaceholders
    )

    const result = await request.query(queryWithPlaceholders)
    return this.validatorService.validateNorisData(
      NorisDeliveryMethodsUpdateResultSchema,
      result.recordset
    )
  }

  private async getBirthNumbersWithUpdatedDeliveryMethods(
    data: NorisDeliveryMethodsUpdateResult[]
  ): Promise<string[]> {
    const updatedSubjects = data.map((item) => item.cislo_subjektu)

    if (updatedSubjects.length === 0) {
      return []
    }

    return this.connectionService.withConnection(async (connection) => {
      const request = new mssql.Request(connection)

      const subjectPlaceholders = updatedSubjects.map((_, index) => `@subject${index}`).join(',')
      updatedSubjects.forEach((subject, index) => {
        request.input(`subject${index}`, subject)
      })
      const queryWithPlaceholders = getBirthNumbersForSubjects.replaceAll(
        '@subjects',
        subjectPlaceholders
      )

      const result = await request.query(queryWithPlaceholders)
      const validatedResult = this.validatorService.validateNorisData(
        NorisOrganizationResultSchema,
        result.recordset
      )
      return validatedResult.map((record: { ico: string }) => record.ico.trim()) // Birth numbers are stored in `ico` column in the respective table
    }, 'Failed to get birth numbers for updated subjects')
  }

  async updateDeliveryMethods({
    data,
  }: {
    data: UpdateNorisDeliveryMethodsData
  }): Promise<UpdateDeliveryMethodsInNorisResponseDto> {
    /**
     * TODO - concurrency (if someone somehow changes his delivery method during its updating in Noris)
     */
    const deliveryGroups: Record<DeliveryMethod, { birthNumber: string; date: string | null }[]> = {
      [DeliveryMethod.EDESK]: [],
      [DeliveryMethod.CITY_ACCOUNT]: [],
      [DeliveryMethod.POSTAL]: [],
    }

    Object.entries(data).forEach(([birthNumber, methodInfo]) => {
      if (!(methodInfo.deliveryMethod in deliveryGroups)) {
        return
      }

      if (methodInfo.deliveryMethod === DeliveryMethod.CITY_ACCOUNT && !methodInfo.date) {
        // We must enforce that the date is present for CITY_ACCOUNT delivery method.
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `Date must be provided for birth number ${birthNumber} when delivery method is CITY_ACCOUNT`
        )
      }

      deliveryGroups[methodInfo.deliveryMethod].push({
        birthNumber: addSlashToBirthNumber(birthNumber),
        date:
          methodInfo.deliveryMethod === DeliveryMethod.CITY_ACCOUNT
            ? (methodInfo.date ?? null)
            : null,
      })
    })

    const updates: UpdateNorisDeliveryMethods[] = Object.entries(deliveryGroups)
      .filter(
        ([deliveryMethod, birthNumbers]) =>
          birthNumbers.length > 0 &&
          (deliveryMethod as DeliveryMethod) !== DeliveryMethod.CITY_ACCOUNT
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

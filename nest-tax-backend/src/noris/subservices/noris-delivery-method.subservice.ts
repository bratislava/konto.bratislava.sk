import { Injectable } from '@nestjs/common'
import { Request } from 'mssql'
import { ErrorsEnum } from '../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../utils/guards/errors.guard'
import { setDeliveryMethodsForUser } from '../utils/noris.queries'
import { UpdateNorisDeliveryMethods } from '../utils/noris.types'
import { mapDeliveryMethodToNoris } from '../utils/mapping.helper'
import { NorisConnectionSubservice } from './noris-connection.subservice'

@Injectable()
export class NorisDeliveryMethodSubservice {
  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly connectionService: NorisConnectionSubservice,
  ) {}

  async updateDeliveryMethods(
    data: UpdateNorisDeliveryMethods[],
  ): Promise<void> {
    const connection = await this.connectionService.createConnection()

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
          return request.query(queryWithPlaceholders)
        }),
      )
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
}

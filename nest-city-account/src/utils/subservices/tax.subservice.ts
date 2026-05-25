import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma } from '@prisma/client'
import { AxiosPromise } from 'axios'
import {
  RequestUpdateNorisDeliveryMethodsDto,
  UpdateDeliveryMethodsInNorisResponseDto,
} from 'openapi-clients/tax'

import ClientsService from '../../clients/clients.service'
import { ErrorsEnum, ErrorsResponseEnum } from '../guards/dtos/error.dto'
import ThrowerErrorGuard from '../guards/errors.guard'
import { LineLoggerSubservice } from './line-logger.subservice'

@Injectable()
export class TaxSubservice {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly clientsService: ClientsService,
    private readonly configService: ConfigService
  ) {
    if (!this.configService.get('TAX_BACKEND_API_KEY')) {
      throw new Error('Tax backend ENV vars are not set.')
    }

    this.logger = new LineLoggerSubservice(TaxSubservice.name)
  }

  static async acquireDeliveryMethodLock(tx: Prisma.TransactionClient, birthNumber: string) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('noris_delivery_method'), hashtext(${birthNumber}))`
  }

  async removeDeliveryMethodFromNoris(birthNumber: string): Promise<boolean> {
    try {
      await this.clientsService.taxBackendApi.integrationControllerRemoveDeliveryMethodsFromNoris(
        birthNumber,
        {
          headers: {
            apiKey: this.configService.getOrThrow<string>('TAX_BACKEND_API_KEY'),
          },
        }
      )
      return true
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
          JSON.stringify(error)
        )
      )
      return false
    }
  }

  async updateDeliveryMethodsInNoris(
    data: RequestUpdateNorisDeliveryMethodsDto
  ): AxiosPromise<UpdateDeliveryMethodsInNorisResponseDto> {
    return this.clientsService.taxBackendApi.integrationControllerUpdateDeliveryMethodsInNoris(data, {
      headers: {
        apiKey: this.configService.getOrThrow<string>('TAX_BACKEND_API_KEY'),
      },
    })
  }
}

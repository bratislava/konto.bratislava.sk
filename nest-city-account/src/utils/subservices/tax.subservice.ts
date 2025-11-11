import { Injectable } from '@nestjs/common'
import {
  RequestAdminDeleteTaxDto,
  RequestUpdateNorisDeliveryMethodsDto,
  UpdateDeliveryMethodsInNorisResponseDto,
} from 'openapi-clients/tax'

import ClientsService from '../../clients/clients.service'
import { ErrorsEnum, ErrorsResponseEnum } from '../guards/dtos/error.dto'
import ThrowerErrorGuard from '../guards/errors.guard'
import { LineLoggerSubservice } from './line-logger.subservice'
import { AxiosPromise } from 'axios'
import { ConfigService } from '@nestjs/config'

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

  async removeDeliveryMethodFromNoris(birthNumber: string): Promise<boolean> {
    try {
      this.clientsService.taxBackendApi.adminControllerRemoveDeliveryMethodsFromNoris(birthNumber, {
        headers: {
          apiKey: this.configService.getOrThrow('TAX_BACKEND_API_KEY'),
        },
      })
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
    return this.clientsService.taxBackendApi.adminControllerUpdateDeliveryMethodsInNoris(data, {
      headers: {
        apiKey: this.configService.getOrThrow('TAX_BACKEND_API_KEY'),
      },
    })
  }

  async deleteTax(data: RequestAdminDeleteTaxDto): AxiosPromise<void> {
    return this.clientsService.taxBackendApi.adminControllerDeleteTax(data, {
      headers: {
        apiKey: this.configService.getOrThrow('TAX_BACKEND_API_KEY'),
      },
    })
  }
}

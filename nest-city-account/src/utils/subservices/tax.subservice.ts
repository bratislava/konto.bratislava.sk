import { Injectable } from '@nestjs/common'
import {
  CreateBirthNumbersResponseDto,
  RequestAdminDeleteTaxDto,
  RequestPostNorisLoadDataDto,
  RequestUpdateNorisDeliveryMethodsDto,
} from 'openapi-clients/tax'

import ClientsService from '../../clients/clients.service'
import { ErrorsEnum, ErrorsResponseEnum } from '../guards/dtos/error.dto'
import ThrowerErrorGuard from '../guards/errors.guard'
import { LineLoggerSubservice } from './line-logger.subservice'
import { AxiosPromise } from 'axios'

@Injectable()
export class TaxSubservice {
  private readonly config: {
    taxBackendUrl: string
    taxBackendApiKey: string
  }

  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly clientsService: ClientsService
  ) {
    if (!process.env.TAX_BACKEND_URL || !process.env.TAX_BACKEND_API_KEY) {
      throw new Error('Tax backend ENV vars are not set ')
    }

    /** Config */
    this.config = {
      taxBackendUrl: process.env.TAX_BACKEND_URL,
      taxBackendApiKey: process.env.TAX_BACKEND_API_KEY,
    }

    this.logger = new LineLoggerSubservice(TaxSubservice.name)
  }

  async removeDeliveryMethodFromNoris(birthNumber: string): Promise<boolean> {
    try {
      this.clientsService.taxBackendApi.adminControllerRemoveDeliveryMethodsFromNoris(birthNumber, {
        headers: {
          apiKey: this.config.taxBackendApiKey,
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

  async loadDataFromNoris(
    data: RequestPostNorisLoadDataDto
  ): AxiosPromise<CreateBirthNumbersResponseDto> {
    return this.clientsService.taxBackendApi.adminControllerLoadDataFromNorris(data, {
      headers: {
        apiKey: this.config.taxBackendApiKey,
      },
    })
  }

  async updateDeliveryMethodsInNoris(
    data: RequestUpdateNorisDeliveryMethodsDto
  ): AxiosPromise<void> {
    return this.clientsService.taxBackendApi.adminControllerUpdateDeliveryMethodsInNoris(data, {
      headers: {
        apiKey: this.config.taxBackendApiKey,
      },
    })
  }

  async deleteTax(data: RequestAdminDeleteTaxDto): AxiosPromise<void> {
    return this.clientsService.taxBackendApi.adminControllerDeleteTax(data, {
      headers: {
        apiKey: this.config.taxBackendApiKey,
      },
    })
  }
}

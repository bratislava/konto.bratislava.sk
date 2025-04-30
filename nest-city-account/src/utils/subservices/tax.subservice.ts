import { Injectable } from '@nestjs/common'
import { AxiosResponse } from 'axios'
import {
  AdminApi,
  Configuration,
  RequestPostNorisLoadDataDto,
  RequestUpdateNorisDeliveryMethodsDto,
  CreateBirthNumbersResponseDto,
} from 'openapi-clients/tax'

import { ErrorsEnum, ErrorsResponseEnum } from '../guards/dtos/error.dto'
import ThrowerErrorGuard from '../guards/errors.guard'
import { LineLoggerSubservice } from './line-logger.subservice'

@Injectable()
export class TaxSubservice {
  private readonly taxBackendAdminApi: AdminApi

  private readonly config: {
    taxBackendUrl: string
    taxBackendApiKey: string
  }

  private readonly logger: LineLoggerSubservice

  constructor(private readonly throwerErrorGuard: ThrowerErrorGuard) {
    if (!process.env.TAX_BACKEND_URL || !process.env.TAX_BACKEND_API_KEY) {
      throw new Error('Tax backend ENV vars are not set ')
    }

    /** Config */
    this.config = {
      taxBackendUrl: process.env.TAX_BACKEND_URL,
      taxBackendApiKey: process.env.TAX_BACKEND_API_KEY,
    }

    this.taxBackendAdminApi = new AdminApi(new Configuration({}), this.config.taxBackendUrl)

    this.logger = new LineLoggerSubservice(TaxSubservice.name)
  }

  async removeDeliveryMethodFromNoris(birthNumber: string): Promise<boolean> {
    try {
      this.taxBackendAdminApi.adminControllerRemoveDeliveryMethodsFromNoris(birthNumber, {
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
  ): Promise<AxiosResponse<CreateBirthNumbersResponseDto>> {
    return this.taxBackendAdminApi.adminControllerLoadDataFromNorris(data, {
      headers: {
        apiKey: this.config.taxBackendApiKey,
      },
    })
  }

  async updateDeliveryMethodsInNoris(
    data: RequestUpdateNorisDeliveryMethodsDto
  ): Promise<AxiosResponse<void>> {
    return this.taxBackendAdminApi.adminControllerUpdateDeliveryMethodsInNoris(data, {
      headers: {
        apiKey: this.config.taxBackendApiKey,
      },
    })
  }
}

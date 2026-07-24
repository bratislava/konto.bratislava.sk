import { Injectable, Logger } from '@nestjs/common'
import { AxiosPromise, isAxiosError } from 'axios'
import {
  UpdateFileStatusRequestDtoStatusEnum,
  UpdateFileStatusResponseDto,
} from 'openapi-clients/forms'

import ClientsService from '../clients/clients.service'
import BaConfigService from '../config/ba-config.service'

@Injectable()
export class FormsClientService {
  private readonly logger: Logger

  constructor(
    private readonly baConfigService: BaConfigService,
    private readonly clientsService: ClientsService,
  ) {
    this.logger = new Logger('FormsClientService')
  }

  //create function which will check health status of forms client with axios and using forms client url NEST_FORMS_BACKEND
  public async isRunning(): Promise<boolean> {
    try {
      const response = await this.clientsService.formsApi.appControllerGetHello(
        {
          timeout: 2000,
        },
      )

      return response.status === 200
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`FormsClientService.healthCheck error: ${error}`)
      } else {
        this.logger.error('FormsClientService.healthCheck throwing not Error.')
      }

      return false
    }
  }

  //create function which will post array of files to forms client with axios and using forms client url NEST_FORMS_BACKEND with updated statuses
  async updateFileStatus(
    id: string,
    status: UpdateFileStatusRequestDtoStatusEnum,
  ): AxiosPromise<UpdateFileStatusResponseDto> {
    try {
      return await this.clientsService.formsApi.filesControllerUpdateFileStatusScannerId(
        id,
        { status },
        {
          timeout: 2000,
          auth: {
            username: this.baConfigService.formsBackend.username,
            password: this.baConfigService.formsBackend.password,
          },
        },
      )
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        this.logger.error(
          `File not found in forms backend. Removing from DB: ${error.message}`,
        )
        return error.response
      }
      if (error instanceof Error) {
        this.logger.error(
          `Error while notifying forms backend: ${error.message}`,
        )
      }

      throw error
    }
  }
}

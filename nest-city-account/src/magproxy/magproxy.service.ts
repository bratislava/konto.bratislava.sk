import { HttpStatus, Injectable } from '@nestjs/common'
import axios, { isAxiosError } from 'axios'
import https from 'https'

import { ResponseRfoPersonDto } from 'openapi-clients/magproxy'
import {
  RfoIdentityList,
  RfoIdentityListElement,
  RfoIdentityListSchema,
} from '../rfo-by-birthnumber/dtos/rfoSchema'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { RpoDataMagproxyDto } from './dtos/magproxy.dto'
import { MagproxyErrorsEnum, MagproxyErrorsResponseEnum } from './magproxy.errors.enum'
import { CustomErrorEnums, ErrorsEnum, ErrorsResponseEnum } from '../utils/guards/dtos/error.dto'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import ClientsService from '../clients/clients.service'
import {
  VerificationErrorsEnum,
  VerificationErrorsResponseEnum,
} from '../user-verification/verification.errors.enum'

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

const INCORRECT_RFO_DATA_ERROR = 'Incorrect RFO data'

let magproxyAzureAdToken = ''

/**
 * Thrown errors are retryable. But if {success: false} is returned, the problem is not retryable.
 */
@Injectable()
export class MagproxyService {
  private readonly logger: LineLoggerSubservice

  private readonly config: {
    magproxyAzureAdUrl: string
    magproxyAzureClientId: string
    magproxyAzureClientSecret: string
    magproxyAzureScope: string
    magproxyUrl: string
  }

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly clientsService: ClientsService
  ) {
    if (
      !process.env.MAGPROXY_AZURE_AD_URL ||
      !process.env.MAGPROXY_AZURE_CLIENT_ID ||
      !process.env.MAGPROXY_AZURE_CLIENT_SECRET ||
      !process.env.MAGPROXY_AZURE_SCOPE ||
      !process.env.MAGPROXY_URL
    ) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'MagproxyService ENV vars are not set '
      )
    }

    /** Config */
    this.config = {
      magproxyAzureAdUrl: process.env.MAGPROXY_AZURE_AD_URL,
      magproxyAzureClientId: process.env.MAGPROXY_AZURE_CLIENT_ID,
      magproxyAzureClientSecret: process.env.MAGPROXY_AZURE_CLIENT_SECRET,
      magproxyAzureScope: process.env.MAGPROXY_AZURE_SCOPE,
      magproxyUrl: process.env.MAGPROXY_URL,
    }

    this.logger = new LineLoggerSubservice(MagproxyService.name)
  }

  private async auth(token: string): Promise<string> {
    let tokenCheck = token
    if (tokenCheck !== '') {
      const tokenPayload = token.split('.')[1]
      const tokenPayloadData = Buffer.from(tokenPayload, 'base64').toString('binary')
      const tokenPayloadJson = JSON.parse(tokenPayloadData)
      if (Date.now() >= tokenPayloadJson.exp * 1000 - 3000) {
        //check expiration minus 3 seconds
        tokenCheck = ''
      }
    }
    if (tokenCheck === '') {
      const result = await axios
        .post(
          this.config.magproxyAzureAdUrl,
          new URLSearchParams({
            client_id: this.config.magproxyAzureClientId,
            grant_type: 'client_credentials',
            client_secret: this.config.magproxyAzureClientSecret,
            scope: this.config.magproxyAzureScope,
          })
        )
        .then((response) => {
          return response.data
        })
        .catch((error) => {
          throw this.throwerErrorGuard.UnprocessableEntityException(
            MagproxyErrorsEnum.RFO_ACCESS_ERROR,
            MagproxyErrorsResponseEnum.RFO_ACCESS_ERROR,
            JSON.stringify(error.response.data),
            error
          )
        })
      return result.access_token
    } else {
      return token
    }
  }

  // if we get a single object we'll always return it 'typed' (though as partial because of weak assumptions)
  // if we don't validate successfully we also print it into logs so that we can deal with it
  private validateRfoDataFormat(data?: ResponseRfoPersonDto[]): RfoIdentityList {
    const result = RfoIdentityListSchema.safeParse(data)

    if (!result.success) {
      this.logger.error(
        `${INCORRECT_RFO_DATA_ERROR} - if we got an array it will be used normally, but the validation schema may need an update`,
        JSON.stringify(data)
      )
      if (!Array.isArray(data)) {
        this.logger.error('Invalid data received (expected array), aborting.')
        throw this.throwerErrorGuard.UnprocessableEntityException(
          MagproxyErrorsEnum.RFO_DATA_ARRAY_EXPECTED,
          MagproxyErrorsResponseEnum.RFO_DATA_ARRAY_EXPECTED
        )
      }
    }

    return (data ?? []) as unknown as RfoIdentityList
  }

  // TODO use this instead of rfoBirthNumber / rfoBirthNumberDcom
  async rfoBirthNumberList(
    birthNumber: string
  ): Promise<
    { success: true; data: RfoIdentityList } | { success: false; reason: CustomErrorEnums }
  > {
    magproxyAzureAdToken = await this.auth(magproxyAzureAdToken)
    const processedBirthNumber = birthNumber.replaceAll('/', '')
    try {
      const result = await this.clientsService.magproxyApi.rfoControllerGetList(
        processedBirthNumber,
        {
          headers: {
            Authorization: `Bearer ${magproxyAzureAdToken}`,
          },
        }
      )
      // TODO this validation belongs to magproxy
      // TODO can be nicer, i.e. don't assume the items are present - leaving like this until OpenAPI rewrite
      const validatedData = this.validateRfoDataFormat(result?.data?.items)
      return { success: true as const, data: validatedData }
    } catch (error) {
      if (!isAxiosError(error)) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
          'Error is not an instance of AxiosError',
          error
        )
      }
      if (error.response?.status === HttpStatus.UNAUTHORIZED) {
        throw this.throwerErrorGuard.UnauthorizedException(
          MagproxyErrorsEnum.RFO_ACCESS_ERROR,
          MagproxyErrorsResponseEnum.RFO_ACCESS_ERROR,
          undefined,
          error
        )
      }
      if (error.response?.status === HttpStatus.NOT_FOUND) {
        // Non-retryable error. Return failure.
        return { success: false as const, reason: MagproxyErrorsEnum.BIRTH_NUMBER_NOT_EXISTS }
      }
      // RFO responded but with unexpected data
      throw this.throwerErrorGuard.UnprocessableEntityException(
        MagproxyErrorsEnum.RFO_UNEXPECTED_RESPONSE,
        MagproxyErrorsResponseEnum.RFO_UNEXPECTED_RESPONSE,
        undefined,
        error
      )
    }
  }

  async rfoBirthNumberDcom(birthNumber: string) {
    magproxyAzureAdToken = await this.auth(magproxyAzureAdToken)
    const result = await this.clientsService.magproxyApi
      .rfoControllerGetOneDcom(birthNumber, {
        httpsAgent: httpsAgent,
        headers: {
          Authorization: `Bearer ${magproxyAzureAdToken}`,
        },
      })
      .then((response) => {
        return {
          success: true as const,
          data: JSON.parse(JSON.stringify(response.data)) as RfoIdentityListElement,
        }
      })
      .catch(async (error) => {
        if (error.response.status === HttpStatus.UNAUTHORIZED) {
          throw this.throwerErrorGuard.UnprocessableEntityException(
            VerificationErrorsEnum.RFO_ACCESS_ERROR,
            'There is problem with authentication to registry. More details in app logs.',
            undefined,
            error
          )
        } else if (error.response.status === HttpStatus.NOT_FOUND) {
          // Non-retryable error. Return failure.
          return { success: false as const, reason: VerificationErrorsEnum.BIRTH_NUMBER_NOT_EXISTS }
        } else {
          throw this.throwerErrorGuard.UnprocessableEntityException(
            VerificationErrorsEnum.RFO_NOT_RESPONDING,
            'There is problem with unexpected registry response. More details in app logs.',
            undefined,
            error
          )
        }
      })
    return result
  }

  async rpoIco(ico: string) {
    magproxyAzureAdToken = await this.auth(magproxyAzureAdToken)

    const result = await this.clientsService.magproxyApi
      .rpoControllerGetLegalPerson(ico, {
        httpsAgent: httpsAgent,
        headers: {
          Authorization: `Bearer ${magproxyAzureAdToken}`,
        },
      })
      .then((response) => {
        return { success: true as const, data: response.data }
      })
      .catch(async (error) => {
        if (error.response.status === HttpStatus.UNAUTHORIZED) {
          throw this.throwerErrorGuard.UnprocessableEntityException(
            VerificationErrorsEnum.RFO_ACCESS_ERROR,
            'There is problem with authentication to registry. More details in app logs.'
          )
        }
        if (error.response.status === HttpStatus.NOT_FOUND) {
          // Non-retryable error. Return failure.
          return { success: false as const, reason: VerificationErrorsEnum.BIRTH_NUMBER_NOT_EXISTS }
        } else {
          throw this.throwerErrorGuard.UnprocessableEntityException(
            VerificationErrorsEnum.RPO_NOT_RESPONDING,
            'There is problem with unexpected registry response. More details in app logs.'
          )
        }
      })
    return result
  }
}

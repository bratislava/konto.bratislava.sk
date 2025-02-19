import { HttpStatus, Injectable } from '@nestjs/common'
import axios, { AxiosError } from 'axios'
import https from 'https'

import {
  Configuration,
  ResponseRfoPersonDto,
  RFORegisterFyzickchOsbApi,
  RPORegisterPrvnickchOsbApi,
} from '../generated-clients/new-magproxy'
import {
  RfoIdentityList,
  RfoIdentityListElement,
  RfoIdentityListSchema,
} from '../rfo-by-birthnumber/dtos/rfoSchema'
import ThrowerErrorGuard, { ErrorMessengerGuard } from '../utils/guards/errors.guard'
import { RpoDataMagproxyDto } from './dtos/magproxy.dto'
import { MagproxyErrorsEnum, MagproxyErrorsResponseEnum } from './magproxy.errors.enum'
import { ErrorsEnum, ErrorsResponseEnum } from '../utils/guards/dtos/error.dto'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

const INCORRECT_RFO_DATA_ERROR = 'Incorrect RFO data'

let magproxyAzureAdToken = ''

@Injectable()
export class MagproxyService {
  /** generated api */
  private readonly rfoApi: RFORegisterFyzickchOsbApi

  private readonly rpoApi: RPORegisterPrvnickchOsbApi

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
    private readonly errorMessengerGuard: ErrorMessengerGuard
  ) {
    if (
      !process.env.MAGPROXY_AZURE_AD_URL ||
      !process.env.MAGPROXY_AZURE_CLIENT_ID ||
      !process.env.MAGPROXY_AZURE_CLIENT_SECRET ||
      !process.env.MAGPROXY_AZURE_SCOPE ||
      !process.env.MAGPROXY_URL
    ) {
      throw new Error('MagproxyService ENV vars are not set ')
    }

    /** Config */
    this.config = {
      magproxyAzureAdUrl: process.env.MAGPROXY_AZURE_AD_URL,
      magproxyAzureClientId: process.env.MAGPROXY_AZURE_CLIENT_ID,
      magproxyAzureClientSecret: process.env.MAGPROXY_AZURE_CLIENT_SECRET,
      magproxyAzureScope: process.env.MAGPROXY_AZURE_SCOPE,
      magproxyUrl: process.env.MAGPROXY_URL,
    }

    /** Generated APIS */
    this.rfoApi = new RFORegisterFyzickchOsbApi(new Configuration({}), this.config.magproxyUrl)

    this.rpoApi = new RPORegisterPrvnickchOsbApi(new Configuration({}), this.config.magproxyUrl)

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
          if (error instanceof Error) {
            throw this.throwerErrorGuard.UnprocessableEntityException(
              MagproxyErrorsEnum.RFO_ACCESS_ERROR,
              MagproxyErrorsResponseEnum.RFO_ACCESS_ERROR,
              undefined,
              error
            )
          }
          throw this.throwerErrorGuard.UnprocessableEntityException(
            MagproxyErrorsEnum.RFO_ACCESS_ERROR,
            MagproxyErrorsResponseEnum.RFO_ACCESS_ERROR,
            JSON.stringify(error.response.data)
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
  async rfoBirthNumberList(birthNumber: string) {
    magproxyAzureAdToken = await this.auth(magproxyAzureAdToken)
    const processedBirthNumber = birthNumber.replaceAll('/', '')
    try {
      const result = await this.rfoApi.rfoControllerGetList(processedBirthNumber, {
        headers: {
          Authorization: `Bearer ${magproxyAzureAdToken}`,
        },
      })
      // TODO this validation belongs to magproxy, TODO can be nicer, i.e. don't assume the items are present - leaving like this until OpenAPI rewrite
      return this.validateRfoDataFormat(result?.data?.items)
    } catch (error) {
      if (!(error instanceof AxiosError)) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
          JSON.stringify(error)
        )
      }
      if (error.response?.status === HttpStatus.UNAUTHORIZED) {
        // attemp re-auth ? (TODO was here, check if this makes sense ?)
        magproxyAzureAdToken = await this.auth(magproxyAzureAdToken)
        throw this.throwerErrorGuard.UnauthorizedException(
          MagproxyErrorsEnum.RFO_ACCESS_ERROR,
          MagproxyErrorsResponseEnum.RFO_ACCESS_ERROR,
          undefined,
          error
        )
      }
      if (error.response?.status === HttpStatus.NOT_FOUND) {
        throw this.throwerErrorGuard.NotFoundException(
          MagproxyErrorsEnum.BIRTH_NUMBER_NOT_EXISTS,
          MagproxyErrorsResponseEnum.BIRTHNUMBER_NOT_EXISTS,
          undefined,
          error
        )
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
    const result = await this.rfoApi
      .rfoControllerGetOneDcom(birthNumber, {
        httpsAgent: httpsAgent,
        headers: {
          Authorization: `Bearer ${magproxyAzureAdToken}`,
        },
      })
      .then((response) => {
        return {
          statusCode: 200,
          data: JSON.parse(JSON.stringify(response.data)) as RfoIdentityListElement,
          errorData: null,
        }
      })
      .catch(async (error) => {
        if (error.response.status === HttpStatus.UNAUTHORIZED) {
          magproxyAzureAdToken = await this.auth(magproxyAzureAdToken)
          const dataError = this.errorMessengerGuard.azureAdGetTokenTimeout()
          return {
            statusCode: dataError.statusCode,
            errorData: dataError,
            data: null,
          }
        }
        if (error.response.status === HttpStatus.NOT_FOUND) {
          const dataError = this.errorMessengerGuard.birthNumberNotExists()
          return {
            statusCode: dataError.statusCode,
            errorData: dataError,
            data: null,
          }
        } else {
          const dataError = this.errorMessengerGuard.rfoNotResponding(error)
          return {
            statusCode: dataError.statusCode,
            errorData: dataError,
            data: null,
          }
        }
      })
    return result
  }

  async rpoIco(ico: string): Promise<RpoDataMagproxyDto> {
    magproxyAzureAdToken = await this.auth(magproxyAzureAdToken)

    const result = await this.rpoApi
      .rpoControllerGetLegalPerson(ico, {
        httpsAgent: httpsAgent,
        headers: {
          Authorization: `Bearer ${magproxyAzureAdToken}`,
        },
      })
      .then((response) => {
        return { statusCode: 200, data: response.data, errorData: null }
      })
      .catch(async (error) => {
        if (error.response.status === HttpStatus.UNAUTHORIZED) {
          magproxyAzureAdToken = await this.auth(magproxyAzureAdToken)
          const dataError = this.errorMessengerGuard.azureAdGetTokenTimeout()
          return {
            statusCode: dataError.statusCode,
            errorData: dataError,
            data: null,
          }
        }
        if (error.response.status === HttpStatus.NOT_FOUND) {
          const dataError = this.errorMessengerGuard.birthNumberNotExists()
          return {
            statusCode: dataError.statusCode,
            errorData: dataError,
            data: null,
          }
        } else {
          const dataError = this.errorMessengerGuard.rpoNotResponding(error)
          return {
            statusCode: dataError.statusCode,
            errorData: dataError,
            data: null,
          }
        }
      })
    return result
  }
}

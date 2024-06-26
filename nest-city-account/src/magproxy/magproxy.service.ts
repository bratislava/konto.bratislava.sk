import { Injectable } from '@nestjs/common'
import axios, { AxiosError } from 'axios'
import https from 'https'

import { Configuration, RFORegisterFyzickchOsbApi, RPORegisterPrvnickchOsbApi, ResponseRfoPersonDto } from '../generated-clients/new-magproxy'
import {
  RfoIdentityListSchema
} from '../rfo-by-birthnumber/dtos/rfoSchema'
import { ErrorMessengerGuard, ErrorThrowerGuard } from '../utils/guards/errors.guard'
import { RpoDataMagproxyDto } from './dtos/magproxy.dto'

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

  private readonly config: {
    magproxyAzureAdUrl: string
    magproxyAzureClientId: string
    magproxyAzureClientSecret: string
    magproxyAzureScope: string
    magproxyUrl: string
  }

  constructor(
    private readonly errorThrowerGuard: ErrorThrowerGuard,
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
    this.config= {
      magproxyAzureAdUrl: process.env.MAGPROXY_AZURE_AD_URL,
      magproxyAzureClientId: process.env.MAGPROXY_AZURE_CLIENT_ID,
      magproxyAzureClientSecret: process.env.MAGPROXY_AZURE_CLIENT_SECRET,
      magproxyAzureScope: process.env.MAGPROXY_AZURE_SCOPE,
      magproxyUrl: process.env.MAGPROXY_URL,
    }

    /** Generated APIS */
    this.rfoApi = new RFORegisterFyzickchOsbApi(new Configuration({}), this.config.magproxyUrl)

    this.rpoApi = new RPORegisterPrvnickchOsbApi(new Configuration({}), this.config.magproxyUrl) 
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
          this.errorThrowerGuard.azureAdGetTokenResponseError(error.response.data)
        })
      return result.access_token
    } else {
      return token
    }
  }

  // if we get a single object we'll always return it 'typed' (though as partial because of weak assumptions)
  // if we don't validate successfully we also print it into logs so that we can deal with it
  private validateRfoDataFormat(data?: ResponseRfoPersonDto[]) {
    const result = RfoIdentityListSchema.safeParse(data)

    if (result.success === false) {
      console.error(
        `${INCORRECT_RFO_DATA_ERROR} - if we got an array it will be used normally, but the validation schema may need an update`,
        JSON.stringify(data)
      )
      if (!Array.isArray(data)) {
        console.error('Invalid data received (expected array), aborting.')
        throw this.errorThrowerGuard.unexpectedError()
      }
    }

    return data ?? []
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
      const validatedData = this.validateRfoDataFormat(result?.data?.items)
      return validatedData
    } catch (error) {
      if (!(error instanceof AxiosError)) {
        throw this.errorThrowerGuard.unexpectedError(error)
      }
      if (error.response?.status === 401) {
        // attemp re-auth ? (TODO was here, check if this makes sense ?)
        magproxyAzureAdToken = await this.auth(magproxyAzureAdToken)
        this.errorThrowerGuard.azureAdGetTokenResponseError(error)
      }
      if (error.response?.status === 404) {
        // TODO better error handling
        throw this.errorThrowerGuard.unexpectedError(this.errorMessengerGuard.birthNumberNotExists())
      }
      // RFO responded but with unexpected data
      // TODO better error handling - error that tells us more
      throw this.errorThrowerGuard.unexpectedError(this.errorMessengerGuard.rfoNotResponding(error))
    }
  }

  // TODO rewrite to async/await
  async rfoBirthNumber(birthNumber: string) {
    magproxyAzureAdToken = await this.auth(magproxyAzureAdToken)

    const result = await this.rfoApi
      .rfoControllerGetOne(birthNumber, 'true', undefined, {
        httpsAgent: httpsAgent,
        headers: {
          Authorization: `Bearer ${magproxyAzureAdToken}`,
        },
      })
      .then((response) => {
        return { statusCode: 200, data: response.data, errorData: null }
      })
      .catch(async (error) => {
        if (error.response.status === 401) {
          magproxyAzureAdToken = await this.auth(magproxyAzureAdToken)
          const dataError = this.errorMessengerGuard.azureAdGetTokenTimeout()
          return {
            statusCode: dataError.statusCode,
            errorData: dataError,
            data: null,
          }
        }
        if (error.response.status === 404) {
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

  // TODO rewrite to async/await
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
        return { statusCode: 200, data: response.data, errorData: null }
      })
      .catch(async (error) => {
        if (error.response.status === 401) {
          magproxyAzureAdToken = await this.auth(magproxyAzureAdToken)
          const dataError = this.errorMessengerGuard.azureAdGetTokenTimeout()
          return {
            statusCode: dataError.statusCode,
            errorData: dataError,
            data: null,
          }
        }
        if (error.response.status === 404) {
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

    const result = await this.rpoApi.rpoControllerGetLegalPerson(ico, {
        httpsAgent: httpsAgent,
        headers: {
          Authorization: `Bearer ${magproxyAzureAdToken}`,
        },
      })
      .then((response) => {
        return { statusCode: 200, data: response.data, errorData: null }
      })
      .catch(async (error) => {
        if (error.response.status === 401) {
          magproxyAzureAdToken = await this.auth(magproxyAzureAdToken)
          const dataError = this.errorMessengerGuard.azureAdGetTokenTimeout()
          return {
            statusCode: dataError.statusCode,
            errorData: dataError,
            data: null,
          }
        }
        if (error.response.status === 404) {
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

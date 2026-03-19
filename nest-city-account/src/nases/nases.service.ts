import * as crypto from 'node:crypto'

import { Injectable } from '@nestjs/common'
import _ from 'lodash'
import {
  ApiIamIdentitiesIdGet200Response,
  UpvsCorporateBody,
  UpvsNaturalPerson,
} from 'openapi-clients/slovensko-sk'
import { v1 as uuidv1 } from 'uuid'

import ClientsService from '../clients/clients.service'
import {
  VerificationErrorsEnum,
  VerificationErrorsResponseEnum,
} from '../user-verification/verification.errors.enum'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'

export type CreateManyParam = {
  physicalEntityId?: string
  uri: string
}[]

export interface UpvsIdentityByUriSuccessType {
  physicalEntityId: string | null
  uri: string
  data: ApiIamIdentitiesIdGet200Response
}

export interface CreateManyResult {
  success: UpvsIdentityByUriSuccessType[]
  failed: { physicalEntityId?: string; uri: string }[]
}

@Injectable()
export class NasesService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private throwerErrorGuard: ThrowerErrorGuard,
    private clientsService: ClientsService
  ) {
    this.logger = new LineLoggerSubservice(NasesService.name)
  }

  async getUpvsIdentity(token: string): Promise<UpvsNaturalPerson | UpvsCorporateBody> {
    // there is a bug in the container and function `apiUpvsIdentityGet` below, according to 'openapi-clients/slovensko-sk' types
    // returns information about UpvsNaturalPerson,
    // in reality it returns information about UpvsCorporateBody as well
    // after https://github.com/slovensko-digital/slovensko-sk-api/pull/115 is merged, typing can be erased
    const result = await this.clientsService.slovenskoSkApi
      .apiUpvsIdentityGet({
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => response.data)
      .catch((error: unknown) => {
        throw this.throwerErrorGuard.BadRequestException(
          VerificationErrorsEnum.VERIFY_EID_ERROR,
          VerificationErrorsResponseEnum.VERIFY_EID_ERROR,
          undefined,
          error
        )
      })
    return result
  }

  // copied from nest-forms-backend
  private createTechnicalAccountJwtToken(): string {
    const privateKey = process.env.API_TOKEN_PRIVATE ?? ''
    const header = {
      alg: 'RS256',
    }
    const jti = uuidv1()
    const exp = Math.floor(new Date(Date.now() + 5 * 60_000).getTime() / 1000)
    const payload = {
      sub: process.env.SUB_NASES_TECHNICAL_ACCOUNT,
      exp,
      jti,
      obo: null,
    }
    const headerEncode = Buffer.from(JSON.stringify(header)).toString('base64url')
    const payloadEncode = Buffer.from(JSON.stringify(payload)).toString('base64url')
    const buffer = Buffer.from(`${headerEncode}.${payloadEncode}`)
    const signature = crypto.sign('sha256', buffer, { key: privateKey }).toString('base64url')
    return `${headerEncode}.${payloadEncode}.${signature}`
  }

  private async searchUpvsIdentitiesByUri(uris: string[]) {
    const jwt = this.createTechnicalAccountJwtToken()
    const result = await this.clientsService.slovenskoSkApi
      .apiIamIdentitiesSearchPost(
        {
          uris,
        },
        {
          headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
        }
      )
      .then((response) => {
        return response.data
      })
      .catch((error: unknown) => {
        throw this.throwerErrorGuard.UnprocessableEntityException(
          VerificationErrorsEnum.VERIFY_EID_ERROR,
          VerificationErrorsResponseEnum.VERIFY_EID_ERROR,
          `Internal reason: ${VerificationErrorsResponseEnum.UNEXPECTED_UPVS_RESPONSE}`,
          error
        )
      })
    return result
  }

  // takes an array of uris with optional physicalEntityId, validates them against UPVS and keeps the record of both the successful and the failed uris
  // multiple uris with same birthnumber can be passed in, but these should always be assigned to the same physicalEntityId
  // for successful requests, the uri that was returned by UPVS is saved - this might be different from the one that was requested (i.e. when the surname changes)
  async createMany(inputs: CreateManyParam): Promise<CreateManyResult> {
    const uniqueInputs = _.uniqBy(inputs, 'uri')
    const inputsByUri = _.keyBy(uniqueInputs, 'uri')

    if (inputs.length === 0 || inputs.length > 10) {
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        'Must provide between 1 and 10 URIs to validate'
      )
    }

    const results = await this.searchUpvsIdentitiesByUri(uniqueInputs.map((input) => input.uri))

    const resultDataSuccess: UpvsIdentityByUriSuccessType[] = results
      .filter(
        (result): result is Omit<ApiIamIdentitiesIdGet200Response, 'uri'> & { uri: string } =>
          !!result.uri
      )
      .map((result) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- inputsByUri is a dictionary, and might not have record for each uri
        if (!inputsByUri[result.uri]) {
          this.logger.warn({
            message: `Failed to find input for URI: ${result.uri}`,
            inputs,
          })
        }
        return {
          uri: result.uri,
          data: result,
          physicalEntityId: inputsByUri[result.uri].physicalEntityId || null,
        }
      })

    if (resultDataSuccess.length >= 10) {
      this.logger.error({
        message:
          'Received at least 10 successful results, cannot determine validity of the rest of the uris',
        alert: 1,
      })
      return {
        success: resultDataSuccess,
        failed: [],
      }
    }

    const successfulUris = new Set(resultDataSuccess.map((r) => r.uri))

    const resultDataFailed = uniqueInputs
      .filter((input) => !successfulUris.has(input.uri))
      .map((input) => ({
        physicalEntityId: input.physicalEntityId ?? undefined,
        uri: input.uri,
      }))

    return {
      success: resultDataSuccess,
      failed: resultDataFailed,
    }
  }
}

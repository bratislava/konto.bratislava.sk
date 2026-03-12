import { Injectable } from '@nestjs/common'
import * as crypto from 'node:crypto'
import { v1 as uuidv1 } from 'uuid'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import {
  VerificationErrorsEnum,
  VerificationErrorsResponseEnum,
} from '../user-verification/verification.errors.enum'
import ClientsService from '../clients/clients.service'
import {
  ApiIamIdentitiesIdGet200Response,
  UpvsCorporateBody,
  UpvsNaturalPerson,
} from 'openapi-clients/slovensko-sk'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import _ from 'lodash'

export type CreateManyParam = {
  physicalEntityId?: string
  uri: string
}[]

export type UpvsIdentityByUriSuccessType = {
  physicalEntityId: string | null
  inputUri: string
  data: ApiIamIdentitiesIdGet200Response
}

export type CreateManyResultFailed = {
  physicalEntityId?: string
  uri: string
  possibleUriChange: boolean
}

export type CreateManyResult = {
  success: UpvsIdentityByUriSuccessType[]
  failed: CreateManyResultFailed[]
}

export type ApiIamIdentitiesIdGet200ResponseWithUri = Omit<
  ApiIamIdentitiesIdGet200Response,
  'uri'
> & {
  uri: string
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
      .catch((error) => {
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
      .catch((error) => {
        throw this.throwerErrorGuard.UnprocessableEntityException(
          VerificationErrorsEnum.VERIFY_EID_ERROR,
          VerificationErrorsResponseEnum.VERIFY_EID_ERROR,
          `Internal reason: ${VerificationErrorsResponseEnum.UNEXPECTED_UPVS_RESPONSE}`,
          error
        )
      })
    return result
  }

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

    const resultsWithUri = results.filter(
      (result): result is ApiIamIdentitiesIdGet200ResponseWithUri => !!result.uri
    )

    const { resultDataSuccess, matchedUris } = this.matchDirectResults(resultsWithUri, inputsByUri)

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

    const unmatchedResults = resultsWithUri.filter((result) => !matchedUris.has(result.uri))
    const unmatchedInputUris = uniqueInputs
      .map((input) => input.uri)
      .filter((uri) => !matchedUris.has(uri))

    // If we have exactly one unmatched result and one unmatched input URI, we can safely assume they represent the same
    // identity.
    if (unmatchedResults.length === 1 && unmatchedInputUris.length === 1) {
      const unmatchedResult = unmatchedResults.pop()!
      const unmatchedInputUri = unmatchedInputUris.pop()!
      this.logger.log({
        message: `Matching unmatched result URI to input URI: ${unmatchedResult.uri} -> ${unmatchedInputUri}`,
      })
      resultDataSuccess.push({
        inputUri: unmatchedResult.uri,
        data: unmatchedResult,
        physicalEntityId: inputsByUri[unmatchedInputUri]?.physicalEntityId || null,
      })
      matchedUris.add(unmatchedInputUri)
    }

    let possibleUriChanges: CreateManyResultFailed[] = []
    if (unmatchedResults.length > 0 && unmatchedInputUris.length > 0) {
      this.logger.warn({
        message: `Failed to find input for URIs: ${unmatchedResults.map((r) => r.uri).join(', ')}`,
        unmatchedInputUris: unmatchedInputUris,
      })
      possibleUriChanges = unmatchedInputUris.map((uri) => ({
        physicalEntityId: inputsByUri[uri]?.physicalEntityId,
        uri,
        possibleUriChange: true,
      }))
    }

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

  private matchDirectResults(
    resultsWithUri: ApiIamIdentitiesIdGet200ResponseWithUri[],
    inputsByUri: Record<string, CreateManyParam[number]>
  ) {
    const directMatches = resultsWithUri.filter((result) => !!inputsByUri[result.uri])
    const matchedUris = new Set(directMatches.map((result) => result.uri))

    const resultDataSuccess: UpvsIdentityByUriSuccessType[] = directMatches.map((result) => ({
      inputUri: result.uri,
      data: result,
      physicalEntityId: inputsByUri[result.uri].physicalEntityId || null,
    }))

    return { resultDataSuccess, matchedUris }
  }
}

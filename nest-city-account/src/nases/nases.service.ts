import { Injectable } from '@nestjs/common'
import _ from 'lodash'
import {
  ApiIamIdentitiesIdGet200Response,
  UpvsCorporateBody,
  UpvsNaturalPerson,
} from 'openapi-clients/slovensko-sk'

import ApiJwtTokensService from '../api-jwt-tokens/api-jwt-tokens.service'
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
  inputUri: string
  data: ApiIamIdentitiesIdGet200Response
}

export interface CreateManyResultFailed {
  physicalEntityId?: string
  inputUri: string
  possibleUriChange: boolean
}

export interface CreateManyResult {
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
    private clientsService: ClientsService,
    private readonly apiJwtTokensService: ApiJwtTokensService
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

  private async searchUpvsIdentitiesByUri(uris: string[]) {
    const jwt = this.apiJwtTokensService.createTechnicalAccountJwtToken()
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
          `Internal reason: ${VerificationErrorsResponseEnum.UNEXPECTED_UPVS_RESPONSE}. Uris: ${JSON.stringify(uris)}`,
          error
        )
      })
    return result
  }

  async createMany(inputs: CreateManyParam): Promise<CreateManyResult> {
    const uniqueInputs = _.uniqBy(inputs, 'uri')
    const inputsByUri = _.keyBy(uniqueInputs, 'uri') as Partial<
      Record<string, CreateManyParam[number]>
    >

    if (uniqueInputs.length === 0 || uniqueInputs.length > 10) {
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
    const unmatchedInputs = uniqueInputs.filter((input) => !matchedUris.has(input.uri))

    // If we have exactly one unmatched result and one unmatched input URI, we can safely assume they represent the same
    // identity.
    if (unmatchedResults.length === 1 && unmatchedInputs.length === 1) {
      const unmatchedResult = unmatchedResults.pop()!
      const unmatchedInput = unmatchedInputs.pop()!
      this.logger.log({
        message: `Matching unmatched result URI to input URI: ${unmatchedResult.uri} -> ${unmatchedInput}`,
      })
      resultDataSuccess.push({
        inputUri: unmatchedInput.uri,
        data: unmatchedResult,
        physicalEntityId: inputsByUri[unmatchedInput.uri]?.physicalEntityId || null,
      })
      matchedUris.add(unmatchedInput.uri)
    }

    const possibleUriChanges = this.filterPossiblyChangedUris(
      unmatchedResults,
      unmatchedInputs,
      inputsByUri
    )

    const failedWithoutPossibleUriChanges = uniqueInputs
      .filter(
        (input) =>
          !matchedUris.has(input.uri) && !possibleUriChanges.some((p) => p.inputUri === input.uri)
      )
      .map((input) => ({
        physicalEntityId: input.physicalEntityId ?? undefined,
        inputUri: input.uri,
        possibleUriChange: false,
      }))

    const resultDataFailed = [...possibleUriChanges, ...failedWithoutPossibleUriChanges]

    return {
      success: resultDataSuccess,
      failed: resultDataFailed,
    }
  }

  private filterPossiblyChangedUris(
    unmatchedResults: ApiIamIdentitiesIdGet200ResponseWithUri[],
    unmatchedInputs: CreateManyParam,
    inputsByUri: Partial<Record<string, CreateManyParam[number]>>
  ) {
    let possibleUriChanges: CreateManyResultFailed[] = []
    if (unmatchedResults.length > 0 && unmatchedInputs.length > 0) {
      this.logger.warn({
        message: `Failed to find input for URIs: ${unmatchedResults.map((r) => r.uri).join(', ')}`,
        unmatchedInputUris: unmatchedInputs.map((input) => input.uri),
      })
      possibleUriChanges = unmatchedInputs.map((input) => ({
        physicalEntityId: inputsByUri[input.uri]?.physicalEntityId,
        inputUri: input.uri,
        possibleUriChange: true,
      }))
    }
    return possibleUriChanges
  }

  private matchDirectResults(
    resultsWithUri: ApiIamIdentitiesIdGet200ResponseWithUri[],
    inputsByUri: Partial<Record<string, CreateManyParam[number]>>
  ) {
    const directMatches = resultsWithUri.filter((result) => !!inputsByUri[result.uri])
    const matchedUris = new Set(directMatches.map((result) => result.uri))

    const resultDataSuccess: UpvsIdentityByUriSuccessType[] = directMatches.flatMap((result) => {
      const input = inputsByUri[result.uri]
      if (!input) return []
      return [
        {
          inputUri: input.uri,
          data: result,
          physicalEntityId: input.physicalEntityId || null,
        },
      ]
    })

    return { resultDataSuccess, matchedUris }
  }
}

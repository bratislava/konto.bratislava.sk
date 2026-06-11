import { HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { isAxiosError } from 'axios'
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
import { ErrorsEnum, ErrorsResponseEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'

export type GetUpvsIdentitiesByUrisParam = {
  physicalEntityId?: string
  uri: string
}[]

export interface GetUpvsIdentityByUriSuccessType {
  physicalEntityId: string | null
  inputUri: string
  data: ApiIamIdentitiesIdGet200Response
}

export interface GetUpvsIdentityByUriFailureType {
  physicalEntityId?: string
  inputUri: string
  possibleUriChange: boolean
}

export interface GetIdentitiesByUrisResult {
  success: GetUpvsIdentityByUriSuccessType[]
  failed: GetUpvsIdentityByUriFailureType[]
}

export type ApiIamIdentitiesIdGet200ResponseWithUri = Omit<
  ApiIamIdentitiesIdGet200Response,
  'uri'
> & {
  uri: string
}

export function isUpvsNaturalPerson(
  contact: UpvsNaturalPerson | UpvsCorporateBody
): contact is UpvsNaturalPerson {
  return contact.type === 'natural_person'
}

export function getUpvsDeathDate(contact: UpvsNaturalPerson | UpvsCorporateBody): string | null {
  if (!isUpvsNaturalPerson(contact)) {
    return null
  }
  return contact.natural_person?.death?.date ?? null
}

@Injectable()
export class NasesService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private throwerErrorGuard: ThrowerErrorGuard,
    private clientsService: ClientsService,
    private readonly apiJwtTokensService: ApiJwtTokensService,
    private readonly configService: ConfigService
  ) {
    this.logger = new LineLoggerSubservice(NasesService.name)
  }

  async getUpvsIdentity(token: string) {
    const result = await this.clientsService.slovenskoSkApi
      .apiUpvsIdentityGet({
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => response.data)
      .catch((error: unknown) => {
        if (!isAxiosError(error)) {
          throw this.throwerErrorGuard.InternalServerErrorException(
            ErrorsEnum.INTERNAL_SERVER_ERROR,
            ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
            'Error is not an instance of AxiosError',
            error
          )
        }
        throw this.throwerErrorGuard.fromAxiosError(error, {
          message: VerificationErrorsResponseEnum.VERIFY_EID_ERROR,
        })
      })
    return result
  }

  /**
   * Look up a single natural person's (FO) UPVS identity by:
   *  - birth number
   *  - given names
   *  - family names.
   *
   * @param personalIdentificationNumber - 10-digit birth number without slash.
   * @param givenName - Given name as stored in Cognito.
   * @param familyName - Family name; same conventions as `givenName`.
   * @returns The identity record (`UpvsNaturalPerson | UpvsCorporateBody`). On
   *   a successful FO lookup this is `UpvsNaturalPerson` with the UPVS `uri`.
   * @throws HTTP 429 (code `TOO_MANY_REQUESTS_ERROR`) when UPVS rate-limits us, so
   *   callers can detect throttling by status and back off.
   * @throws HTTP 422 with code `VERIFY_EID_ERROR` when UPVS rejects the lookup (400,
   *   i.e. "identity not found").
   * @throws the `fromAxiosError` defaults (BadGateway / ServiceUnavailable) for
   *   other upstream failures such as outages or credential errors.
   */
  async lookupIdentityFO(
    personalIdentificationNumber: string,
    givenName: string,
    familyName: string
  ): Promise<ApiIamIdentitiesIdGet200Response> {
    const jwt = this.apiJwtTokensService.createTechnicalAccountJwtToken(
      this.configService.getOrThrow<string>('SUB_NASES_TECHNICAL_ACCOUNT'),
      this.configService.getOrThrow<string>('API_TOKEN_PRIVATE')
    )
    const result = await this.clientsService.slovenskoSkApi
      .apiIamIdentitiesLookupGet(personalIdentificationNumber, givenName, familyName, undefined, {
        headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      })
      .then((response) => {
        return response.data
      })
      .catch((error: unknown) => {
        if (!isAxiosError(error)) {
          throw this.throwerErrorGuard.InternalServerErrorException(
            ErrorsEnum.INTERNAL_SERVER_ERROR,
            ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
            'Error is not an instance of AxiosError',
            error
          )
        }
        throw this.throwerErrorGuard.fromAxiosError(error, {
          message: VerificationErrorsResponseEnum.VERIFY_EID_ERROR,
          statusOverrides: {
            // Rate limit must keep its 429 status — the urgent queue detects it by
            // status and backs off for the rest of the tick.
            [HttpStatus.TOO_MANY_REQUESTS]: {
              status: HttpStatus.TOO_MANY_REQUESTS,
              errorEnum: ErrorsEnum.TOO_MANY_REQUESTS_ERROR,
              message: ErrorsResponseEnum.TOO_MANY_REQUESTS_ERROR,
            },
            // UPVS answers 400 when the identity is not found — that's a data
            // problem, not a gateway one.
            [HttpStatus.BAD_REQUEST]: {
              status: HttpStatus.UNPROCESSABLE_ENTITY,
              errorEnum: VerificationErrorsEnum.VERIFY_EID_ERROR,
              message: VerificationErrorsResponseEnum.VERIFY_EID_ERROR,
            },
          },
        })
      })
    return result
  }

  private async searchUpvsIdentitiesByUri(uris: string[]) {
    const jwt = this.apiJwtTokensService.createTechnicalAccountJwtToken(
      this.configService.getOrThrow<string>('SUB_NASES_TECHNICAL_ACCOUNT'),
      this.configService.getOrThrow<string>('API_TOKEN_PRIVATE')
    )
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
        if (!isAxiosError(error)) {
          throw this.throwerErrorGuard.InternalServerErrorException(
            ErrorsEnum.INTERNAL_SERVER_ERROR,
            ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
            'Error is not an instance of AxiosError',
            error
          )
        }
        throw this.throwerErrorGuard.fromAxiosError(error, {
          message: VerificationErrorsResponseEnum.VERIFY_EID_ERROR,
          console: `Internal reason: ${VerificationErrorsResponseEnum.UNEXPECTED_UPVS_RESPONSE}. Uris: ${JSON.stringify(uris)}`,
        })
      })
    return result
  }

  async getIdentitiesByUris(
    inputs: GetUpvsIdentitiesByUrisParam
  ): Promise<GetIdentitiesByUrisResult> {
    const uniqueInputs = _.uniqBy(inputs, 'uri')
    const inputsByUri = _.keyBy(uniqueInputs, 'uri') as Partial<
      Record<string, GetUpvsIdentitiesByUrisParam[number]>
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
    unmatchedInputs: GetUpvsIdentitiesByUrisParam,
    inputsByUri: Partial<Record<string, GetUpvsIdentitiesByUrisParam[number]>>
  ) {
    let possibleUriChanges: GetUpvsIdentityByUriFailureType[] = []
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
    inputsByUri: Partial<Record<string, GetUpvsIdentitiesByUrisParam[number]>>
  ) {
    const directMatches = resultsWithUri.filter((result) => !!inputsByUri[result.uri])
    const matchedUris = new Set(directMatches.map((result) => result.uri))

    const resultDataSuccess: GetUpvsIdentityByUriSuccessType[] = directMatches.flatMap((result) => {
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

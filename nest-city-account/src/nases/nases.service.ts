import { HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AxiosError, isAxiosError } from 'axios'
import _ from 'lodash'
import {
  ApiIamIdentitiesIdGet200Response,
  UpvsCorporateBody,
  UpvsNaturalPerson,
  UpvsNaturalPersonAllOfNaturalPerson,
} from 'openapi-clients/slovensko-sk'

import ApiJwtTokensService from '../api-jwt-tokens/api-jwt-tokens.service'
import ClientsService from '../clients/clients.service'
import { PrismaService } from '../prisma/prisma.service'
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

/**
 * Identity returned by `lookupIdentityFO`.
 *
 * UPVS strips these fields from a technical-account lookup (OBO-token subject
 * isn't the looked-up identity), so they're dropped from the type:
 * - top-level `addresses`/`phones`,
 * - `natural_person`'s `birth`/`death`/`marital_status`/`nationality`/`occupation`.
 * Narrowed to a natural person, as an FO lookup always resolves to one.
 */
export type LookupIdentityFOResult = Omit<
  UpvsNaturalPerson,
  'addresses' | 'phones' | 'natural_person'
> & {
  natural_person?: Omit<
    UpvsNaturalPersonAllOfNaturalPerson,
    'birth' | 'death' | 'marital_status' | 'nationality' | 'occupation'
  >
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

/**
 * The `fault` object the slovensko-sk container attaches to a 400 body when the error
 * originated in UPVS.
 */
interface UpvsIamFault {
  code?: string
  reason?: string
}

/**
 * Extract the UPVS IAM fault from a slovensko-sk container 400 response.
 *
 * The slovensko-sk container (Ruby on Rails) always returns HTTP 400 for UPVS IAM errors,
 * regardless of the actual error semantics — e.g. "identity not found" is still a 400, not a
 * 404. The real error meaning lives inside the `fault` object in the response body.
 */
function getUpvsIamFault(error: AxiosError): UpvsIamFault | undefined {
  if (error.response?.status !== HttpStatus.BAD_REQUEST) {
    return undefined
  }

  const fault = (error.response.data as Record<string, unknown> | null)?.fault
  if (typeof fault !== 'object' || fault === null) {
    return undefined
  }

  const { code, reason } = fault as Record<string, unknown>
  return {
    code: typeof code === 'string' ? code : undefined,
    reason: typeof reason === 'string' ? reason : undefined,
  }
}

@Injectable()
export class NasesService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private throwerErrorGuard: ThrowerErrorGuard,
    private clientsService: ClientsService,
    private readonly apiJwtTokensService: ApiJwtTokensService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService
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
   * When UPVS IAM rejects the lookup, the rejection (with its fault) is persisted as an
   * `IdentityLookupRejection` row for the entity, which excludes it from further urgent
   * lookups (delete the row to retry).
   *
   * @param personalIdentificationNumber - 9 or 10 digit birth number without slash.
   * @param givenName - Given names as stored in Cognito.
   * @param familyName - Family names as stored in Cognito.
   * @param physicalEntityId - Entity the lookup is for; used to persist a rejection.
   * @returns The natural person's identity record with the UPVS `uri`. Fields UPVS strips
   * from a technical-account lookup (birth, death, marital status, nationality, occupation,
   * addresses, phones) are absent - see `LookupIdentityFOResult`.
   * @throws HttpException - status depends on the upstream failure:
   *   - 422 (code `IDENTITY_LOOKUP_REJECTED`) when UPVS IAM itself rejects the
   *     lookup
   *   - 429 (code `TOO_MANY_REQUESTS_ERROR`) when UPVS rate-limits us.
   *   - 500 (code `INTERNAL_SERVER_ERROR`, alerts) when the container rejects
   *     our parameters before reaching UPVS (upstream 400 without `fault` - we
   *     always send all three, so this means our request building broke), or
   *     when the thrown error is not an AxiosError.
   *   - 502 (code `BAD_GATEWAY_AUTH_ERROR`, alerts) when our credentials are
   *     broken.
   *   - 503 (code `SERVICE_UNAVAILABLE_ERROR`) when upstream answers 503 with a
   *     `Retry-After` header.
   *   - 502 (code `BAD_GATEWAY_ERROR`) for any other upstream failure
   */
  async lookupIdentityFO(
    personalIdentificationNumber: string,
    givenName: string,
    familyName: string,
    physicalEntityId: string
  ): Promise<LookupIdentityFOResult> {
    const jwt = this.apiJwtTokensService.createTechnicalAccountJwtToken(
      this.configService.getOrThrow<string>('SUB_NASES_TECHNICAL_ACCOUNT'),
      this.configService.getOrThrow<string>('API_TOKEN_PRIVATE')
    )
    const result = await this.clientsService.slovenskoSkApi
      .apiIamIdentitiesLookupGet(personalIdentificationNumber, givenName, familyName, undefined, {
        headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      })
      .then((response) => {
        // FO criteria resolve to a natural person with omitted fields - see LookupIdentityFOResult.
        return response.data as LookupIdentityFOResult
      })
      .catch(async (error: unknown) => {
        if (!isAxiosError(error)) {
          throw this.throwerErrorGuard.InternalServerErrorException(
            ErrorsEnum.INTERNAL_SERVER_ERROR,
            ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
            'Error is not an instance of AxiosError',
            error
          )
        }
        const iamFault = getUpvsIamFault(error)
        let consoleMessage: string | undefined
        if (iamFault) {
          consoleMessage = `UPVS IAM fault: code=${iamFault.code ?? 'unknown'} reason=${iamFault.reason ?? 'unknown'}`
          await this.markLatestIdentityLookupRejected(physicalEntityId, iamFault)
        } else if (error.response?.status === HttpStatus.BAD_REQUEST) {
          consoleMessage = 'Identity lookup parameters failed slovensko-sk container validation.'
        }
        throw this.throwerErrorGuard.fromAxiosError(error, {
          message: VerificationErrorsResponseEnum.VERIFY_EID_ERROR,
          console: consoleMessage,
          statusOverrides: {
            // Rate limit must keep its 429 status
            [HttpStatus.TOO_MANY_REQUESTS]: {
              status: HttpStatus.TOO_MANY_REQUESTS,
              errorEnum: ErrorsEnum.TOO_MANY_REQUESTS_ERROR,
              message: ErrorsResponseEnum.TOO_MANY_REQUESTS_ERROR,
            },
            // 400 with a `fault` in the body = UPVS IAM itself rejected the query
            [HttpStatus.BAD_REQUEST]: iamFault
              ? {
                  status: HttpStatus.UNPROCESSABLE_ENTITY,
                  errorEnum: VerificationErrorsEnum.IDENTITY_LOOKUP_REJECTED,
                  message: VerificationErrorsResponseEnum.IDENTITY_LOOKUP_REJECTED,
                }
              : {
                  status: HttpStatus.INTERNAL_SERVER_ERROR,
                  errorEnum: ErrorsEnum.INTERNAL_SERVER_ERROR,
                  message: ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
                },
          },
        })
      })
    return result
  }

  private async markLatestIdentityLookupRejected(
    physicalEntityId: string,
    fault: UpvsIamFault
  ): Promise<void> {
    const faultColumns = { faultCode: fault.code, faultReason: fault.reason }
    try {
      await this.prismaService.identityLookupRejection.upsert({
        where: { physicalEntityId },
        create: { physicalEntityId, ...faultColumns },
        update: faultColumns,
      })
    } catch (persistenceError) {
      this.logger.error('Failed to persist identity lookup rejection', persistenceError)
    }
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
      if (!input) {
        return []
      }
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

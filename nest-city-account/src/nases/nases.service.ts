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
  ApiIamIdentitiesSearchPostRequest,
  ApiIamIdentitiesSearchPostRequestNaturalPerson,
} from 'openapi-clients/slovensko-sk'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'

export type ValidateUrisResult = {
  physicalEntityId: string | null
  uri: string
  data: ApiIamIdentitiesIdGet200Response
}[]

export type UpvsNaturalPersonSearchRequest = Omit<
  ApiIamIdentitiesSearchPostRequest,
  'uris' | 'ids' | 'legal_entity' | 'type' | 'en' | 'natural_person'
> & {
  // force natural-person search params to be present
  natural_person: ApiIamIdentitiesSearchPostRequestNaturalPerson

  uris?: never
  ids?: never
  legal_entity?: never
  type?: never
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
  createTechnicalAccountJwtToken(): string {
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

  async searchUpvsIdentitiesByUri(uris: string[]) {
    if (uris.length === 0 || uris.length > 10) {
      throw this.throwerErrorGuard.BadRequestException(
        VerificationErrorsEnum.VERIFY_EID_ERROR,
        VerificationErrorsResponseEnum.VERIFY_EID_ERROR,
        'Must provide between 1 and 10 URIs to search. UPVS returns max 10 results.'
      )
    }

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

  async searchUpvsIdentitiesByPersonData(params: UpvsNaturalPersonSearchRequest) {
    const jwt = this.createTechnicalAccountJwtToken()
    const result = await this.clientsService.slovenskoSkApi
      .apiIamIdentitiesSearchPost(params, {
        headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      })
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

  /**
   * Validates URIs with physicalEntityIds against UPVS for eDesk status refresh.
   * Returns only successful matches - no failure tracking.
   *
   * @param inputs Array of URIs with physicalEntityIds (1-10 items)
   * @returns Array of successful matches with updated eDesk status
   */
  async validateUrisWithEntityIds(
    inputs: { physicalEntityId: string; uri: string }[]
  ): Promise<ValidateUrisResult> {
    const results = await this.searchUpvsIdentitiesByUri(inputs.map((input) => input.uri))

    if (!Array.isArray(results)) {
      this.logger.error('Unexpected UPVS response format', results)
      return []
    }

    // Create a map of input URIs to physicalEntityIds for lookup
    const inputUriMap = new Map(inputs.map((input) => [input.uri, input.physicalEntityId]))

    // Match results back to inputs and return successful ones
    const validatedResults: ValidateUrisResult = []

    for (const result of results) {
      if (!result.uri) continue

      const physicalEntityId = inputUriMap.get(result.uri) ?? null

      // If not found by returned URI, skip (might be surname change - should use RFO flow)
      if (!physicalEntityId) {
        this.logger.warn(
          `UPVS returned URI ${result.uri} which doesn't match any input URI. Skipping.`
        )
        continue
      }

      validatedResults.push({
        physicalEntityId,
        uri: result.uri,
        data: result,
      })
    }

    return validatedResults
  }
}

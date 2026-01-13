import { Injectable } from '@nestjs/common'
import _ from 'lodash'
import { NasesService } from '../nases/nases.service'
import { PrismaService } from '../prisma/prisma.service'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { parseBirthNumberFromUri } from '../utils/upvs'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import {
  VerificationErrorsEnum,
  VerificationErrorsResponseEnum,
} from '../user-verification/verification.errors.enum'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { ApiIamIdentitiesIdGet200Response } from '../../../openapi-clients/slovensko-sk'

export type UpvsIdentityByUriServiceCreateManyParam = {
  physicalEntityId?: string
  uri: string
}[]

export type UpvsIdentityByUriSuccessType = {
  physicalEntityId: string | null
  uri: string
  data: ApiIamIdentitiesIdGet200Response
}

export type UpvsCreateManyResult = {
  success: UpvsIdentityByUriSuccessType[]
  failed: { physicalEntityId?: string; uri: string }[]
}

@Injectable()
export class UpvsIdentityByUriService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private throwerErrorGuard: ThrowerErrorGuard,
    private nasesService: NasesService,
    private prismaService: PrismaService
  ) {
    this.logger = new LineLoggerSubservice(UpvsIdentityByUriService.name)
  }

  // takes an array of uris with optional physicalEntityId, validates them against UPVS and keeps the record of both the successful and the failed uris
  // multiple uris with same birthnumber can be passed in, but these should always be assigned to the same physicalEntityId
  // for successful requests, the uri that was returned by UPVS is saved - this might be different from the one that was requested (i.e. when the surname changes)
  // eslint-disable-next-line sonarjs/cognitive-complexity
  async createMany(inputs: UpvsIdentityByUriServiceCreateManyParam): Promise<UpvsCreateManyResult> {
    if (inputs.length === 0 || inputs.length > 100) {
      throw this.throwerErrorGuard.BadRequestException(
        ErrorsEnum.BAD_REQUEST_ERROR,
        'Must provide between 1 and 100 URIs to validate'
      )
    }

    const inputsByBirthNumbers = _.groupBy(inputs, (input) => {
      const parsedBirthNumber = parseBirthNumberFromUri(input.uri)
      if (!parsedBirthNumber) {
        throw this.throwerErrorGuard.BadRequestException(
          ErrorsEnum.BAD_REQUEST_ERROR,
          `Invalid uri found among inputs: ${input.uri}`
        )
      }
      return parsedBirthNumber
    })

    const results = await this.nasesService.searchUpvsIdentitiesByUri(
      inputs.map((input) => input.uri)
    )

    if (!Array.isArray(results)) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        VerificationErrorsEnum.UNEXPECTED_UPVS_RESPONSE,
        VerificationErrorsResponseEnum.UNEXPECTED_UPVS_RESPONSE,
        JSON.stringify(results)
      )
    }

    // for each db write we collect the written object into result that we return
    const resultDataSuccess: UpvsIdentityByUriSuccessType[] = []
    // we collect birthNumbersWithSuccessfulUris so that we can easily filter those out and create db records marking a failed request for all the rest
    const birthNumbersWithSuccessfulUris = new Set<string>()
    for (const result of results) {
      try {
        if (!result.uri) continue

        const parsedBirthNumber = parseBirthNumberFromUri(result.uri)
        if (parsedBirthNumber === null) continue

        const physicalEntityIds = _.uniq(
          inputsByBirthNumbers[parsedBirthNumber].map((input) => input.physicalEntityId)
        )
        if (physicalEntityIds.length > 1) {
          this.logger.error(
            'Multiple physicalEntityIds found for the same birthNumber. We must assign manually - ignoring these in results'
          )
          continue
        } else {
          // either we found just one physicalEntityId or there were no physicalEntityIds provided for this birth number
          const successfulPhysicalEntityId = physicalEntityIds[0] ?? null
          // we'll not add any uris with this birth number among the unsuccessful ones
          birthNumbersWithSuccessfulUris.add(parsedBirthNumber)
          // if we have a match, we ignore all the variants of the uris provided and save only the result with the return uri
          // IMPORTANT NOTE - this uri might be different from any in the inputs - i.e. when the surename changes, the old uri still matches
          // if matching back to the requested uris, use birthNumbers as guides
          resultDataSuccess.push({
            physicalEntityId: successfulPhysicalEntityId,
            uri: result.uri,
            data: result,
          })
        }
      } catch (error) {
        this.logger.error('Failed to save data. Will continue to next result. Error: ', error)
      }
    }

    // you can test up to 100 uris, but you'll get max 10 entities back
    // if we get back (at least) 10 entities, we can't say anything about the validity of the rest of the uris, we don't store any as 'failed'
    if (resultDataSuccess.length >= 10) {
      return {
        success: resultDataSuccess,
        failed: [],
      }
    }
    // if we get less than 10 entities, it means that the rest of the tested uris did not match - we store those so that we know what not to test
    const failedBirthNumbers = Object.keys(inputsByBirthNumbers).filter(
      (birthNumber) => !birthNumbersWithSuccessfulUris.has(birthNumber)
    )
    const resultDataFailed: { physicalEntityId?: string; uri: string }[] = []
    for (const failedBirthNumber of failedBirthNumbers) {
      for (const failedInput of inputsByBirthNumbers[failedBirthNumber]) {
        resultDataFailed.push({
          physicalEntityId: failedInput.physicalEntityId ?? undefined,
          uri: failedInput.uri,
        })
      }
    }

    return {
      success: resultDataSuccess,
      failed: resultDataFailed,
    }
  }
}

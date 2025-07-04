import { Injectable } from '@nestjs/common'
import { UpvsIdentityByUri } from '@prisma/client'
import _ from 'lodash'
import { NasesService } from '../nases/nases.service'
import { PrismaService } from '../prisma/prisma.service'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { parseBirthNumberFromUri } from '../utils/upvs'
import { UpvsIdentity, UpvsIdentitySchema } from './dtos/upvsSchema'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import {
  VerificationErrorsEnum,
  VerificationErrorsResponseEnum,
} from '../user-verification/verification.errors.enum'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'

export type UpvsIdentityByUriServiceCreateManyParam = {
  physicalEntityId?: string | null | undefined
  uri: string
}[]

export type UpvsCreateManyResult = {
  success: UpvsIdentityByUri[]
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
    const resultDataSuccess: UpvsIdentityByUri[] = []
    // we collect birthNumbersWithSuccessfulUris so that we can easily filter those out and create db records marking a failed request for all the rest
    const birthNumbersWithSuccessfulUris = new Set<string>()
    for (const result of results) {
      // validate the result format - for info only, continue either way
      const parsedResult = UpvsIdentitySchema.safeParse(result)
      if (!parsedResult.success) {
        this.logger.error(
          'Failed to parse result from nases. Will still attempt to save the data, and continue if we fail. Result JSON: ',
          JSON.stringify(result)
        )
      }
      try {
        const forcefullyTypedResult = result as UpvsIdentity
        if (!forcefullyTypedResult.uri) continue

        const parsedBirthNumber = parseBirthNumberFromUri(forcefullyTypedResult.uri)
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
          resultDataSuccess.push(
            await this.prismaService.upvsIdentityByUri.create({
              data: {
                physicalEntityId: successfulPhysicalEntityId,
                uri: forcefullyTypedResult.uri,
                data: forcefullyTypedResult,
              },
            })
          )
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

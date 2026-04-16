
import { Injectable } from '@nestjs/common'
import {
  UpvsCorporateBody,
  UpvsNaturalPerson,
} from 'openapi-clients/slovensko-sk'

import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import {
  NasesErrorsEnum,
  NasesErrorsResponseEnum,
} from '../nases.errors.enum'

export interface NaturalPersonData {
  given_names?: string[]
  family_names?: { value?: string; primary?: boolean }[]
  birth?: {
    date?: string
  }
}

export interface CorporateBodyData {
  name?: string
  /** IČO */
  cin?: string
  /** DIČ */
  tin?: string | null
}

export function isUpvsNaturalPerson(
  contact: UpvsNaturalPerson | UpvsCorporateBody,
): contact is UpvsNaturalPerson {
  return (
    contact.type === 'natural_person' &&
    'natural_person' in contact &&
    contact.natural_person !== undefined
  )
}

export function isUpvsCorporateBody(
  contact: UpvsNaturalPerson | UpvsCorporateBody,
): contact is UpvsCorporateBody {
  return (
    contact.type === 'legal_entity' &&
    'corporate_body' in contact &&
    contact.corporate_body !== undefined
  )
}

export interface NaturalPersonExtractedData {
  firstNames: string[]
  lastNames: string[]
}

export interface CorporateBodyExtractedData {
  ico?: string
  name?: string
}

@Injectable()
export default class NasesContactsService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {
    this.logger = new LineLoggerSubservice('NasesContactsService')
  }

  extractNaturalPersonData(
    contact: UpvsNaturalPerson,
  ): NaturalPersonExtractedData {
    const naturalPerson = contact.natural_person as
      | NaturalPersonData
      | null
      | undefined

    const result: NaturalPersonExtractedData = {
      firstNames: [],
      lastNames: [],
    }

    if (!naturalPerson) {
      return result
    }

    // given_names is already an array of strings, maintain order
    if (naturalPerson.given_names && naturalPerson.given_names.length > 0) {
      result.firstNames = [...naturalPerson.given_names]
    }

    // family_names is an array of objects, extract values maintaining order
    // Sort by primary first (primary names come first), then maintain array order
    if (naturalPerson.family_names && naturalPerson.family_names.length > 0) {
      const sortedFamilyNames = [...naturalPerson.family_names].sort((a, b) => {
        // Primary names come first
        if (a.primary && !b.primary) return -1
        if (!a.primary && b.primary) return 1
        return 0 // Maintain original order for same primary status
      })
      result.lastNames = sortedFamilyNames
        .map((name) => name.value)
        .filter((value): value is string => value !== undefined)
    }

    return result
  }

  extractCorporateBodyData(
    contact: UpvsCorporateBody,
  ): CorporateBodyExtractedData {
    const corporateBody = contact.corporate_body as
      | CorporateBodyData
      | null
      | undefined

    const result: CorporateBodyExtractedData = {}

    if (corporateBody) {
      if (corporateBody.name) {
        result.name = corporateBody.name
      }
      if (corporateBody.cin) {
        result.ico = corporateBody.cin
      }
    }

    // Fallback: check various_ids for ICO if not found in corporate_body
    if (!result.ico && contact.various_ids) {
      const icoEntry = contact.various_ids.find(
        (id) =>
          id.type?.name?.includes('IČO') ||
          id.type?.name?.includes('Identifikačné číslo organizácie'),
      )
      if (icoEntry?.value) {
        result.ico = icoEntry.value
      }

      // don't throw, alert only
      this.logger.error(
        this.throwerErrorGuard.UnprocessableEntityException(
          NasesErrorsEnum.IDENTITY_SEARCH_DATA_INCONSISTENT,
          `extractCorporateBodyData: ${NasesErrorsResponseEnum.IDENTITY_SEARCH_DATA_INCONSISTENT}: ICO not found in contact returned by nases ${contact.uri}.`,
        ),
      )
    }

    return result
  }
}

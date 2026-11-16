import { LineLoggerService } from '@bratislava/log-nest'
import { Injectable } from '@nestjs/common'

import { MagproxyErrorsEnum } from '../../../magproxy/magproxy.errors.enum'
import { MagproxyService } from '../../../magproxy/magproxy.service'
import { PhysicalEntityService } from '../../../physical-entity/physical-entity.service'
import { RfoIdentityListElement } from '../../../rfo-by-birthnumber/dtos/rfoSchema'
import { isValidBirthNumber } from '../../../utils/birthNumbers'
import {
  CognitoGetUserData,
  CognitoUserAttributesEnum,
} from '../../../utils/global-dtos/cognito.dto'
import { IdentityCardVerificationRequest } from '../../dtos/identity-card-verification-queue.dto'
import { RequestBodyVerifyIdentityCardDto } from '../../dtos/requests.verification.dto'
import { VerificationReturnType } from '../../types'
import { VerificationErrorsEnum } from '../../verification.errors.enum'
import { VerificationDataSubservice } from './verification-data.subservice'

@Injectable()
export class VerificationSubservice {
  constructor(
    private magproxyService: MagproxyService,
    private verificationDataSubservice: VerificationDataSubservice,
    private physicalEntityService: PhysicalEntityService,
    private readonly logger: LineLoggerService
  ) {}

  private checkIdentityCard(
    rfoData: RfoIdentityListElement,
    identityCard: string
  ): VerificationReturnType {
    if (rfoData.datumUmrtia && rfoData.datumUmrtia !== 'unknown' && rfoData.datumUmrtia !== '') {
      return { success: false, reason: VerificationErrorsEnum.DEAD_PERSON }
    }

    if (!rfoData.doklady || Object.keys(rfoData.doklady).length === 0) {
      return {
        success: false,
        reason: VerificationErrorsEnum.BIRTH_NUMBER_AND_IDENTITY_CARD_INCONSISTENCY,
      }
    }

    for (const { druhDokladu, jednoznacnyIdentifikator } of rfoData.doklady) {
      if (
        (druhDokladu === 'Občiansky preukaz' ||
          druhDokladu === 'Povolenie na pobyt' ||
          druhDokladu === 'Pobytový preukaz občana EÚ' ||
          druhDokladu === 'Cestovný pas') &&
        jednoznacnyIdentifikator
      ) {
        if (jednoznacnyIdentifikator === identityCard) {
          return { success: true }
        }

        // Some identity card numbers are in format "000000 XX" in the registry, but users enter identity card as "XX000000"
        const identityCardMagproxy = jednoznacnyIdentifikator.trim().split(' ')

        if (
          identityCardMagproxy.length === 2 &&
          identityCardMagproxy[1] + identityCardMagproxy[0] === identityCard
        ) {
          return { success: true }
        }
      }
    }
    return {
      success: false,
      reason: VerificationErrorsEnum.BIRTH_NUMBER_AND_IDENTITY_CARD_INCONSISTENCY,
    }
  }

  /**
   * Validates the first and last name of a person against a provided RFO identity data structure.
   * The comparison ignores letter case, but not diacritics.
   *
   * @param {RfoIdentityListElement} rfoData - The RFO identity data containing first and last names to compare against.
   * @param {string | undefined} firstName - The first name of the person to validate.
   * @param {string | undefined} lastName - The last name of the person to validate.
   * @return {boolean} Returns true if the provided first and last name match entries in the RFO identity data, otherwise false.
   */
  private validatePersonName(
    rfoData: RfoIdentityListElement,
    firstName: string | undefined,
    lastName: string | undefined
  ) {
    if (!firstName || !lastName) {
      return false
    }

    const splitToParts = (str: string): string[] =>
      str
        .split(/\s+/g) // handles multiple spaces + leading/trailing spaces after trim()
        .filter(Boolean)

    const normalizeCase = (str: string): string => str.toLocaleLowerCase('sk')

    const firstNames = splitToParts(firstName).map(normalizeCase)
    const lastNames = splitToParts(lastName).map(normalizeCase)

    if (firstNames.length === 0 || lastNames.length === 0) {
      return false
    }

    // Assuming that RFO always splits names and never returns a name with whitespace.
    const rfoFirstNames = (rfoData.menaOsoby ?? [])
      .map((x) => x.meno)
      .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      .map(normalizeCase)

    const rfoLastNames = (rfoData.priezviskaOsoby ?? [])
      .map((x) => x.meno)
      .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      .map(normalizeCase)

    if (rfoFirstNames.length === 0 || rfoLastNames.length === 0) {
      return false
    }

    const inputFirstSet = new Set(firstNames)
    const inputLastSet = new Set(lastNames)
    const rfoFirstSet = new Set(rfoFirstNames)
    const rfoLastSet = new Set(rfoLastNames)

    const firstOk =
      [...inputFirstSet].every((name) => rfoFirstSet.has(name)) &&
      [...rfoFirstSet].every((name) => inputFirstSet.has(name))

    const lastOk =
      [...inputLastSet].every((name) => rfoLastSet.has(name)) &&
      [...rfoLastSet].every((name) => inputLastSet.has(name))

    return firstOk && lastOk
  }

  /**
   * Verifies the identity card of a user.
   *
   * The function attempts to verify the user's identity by comparing RFO data from magproxy with the provided data.
   * It creates a PhysicalEntity entry in the database alongside a new User (user only if the verification is successful).
   *
   * @param {IdentityCardVerificationRequest} request - The user from Cognito and the data for verifying the identity card.
   * @throws {Error} - If there is an unexpected error during the verification process.
   */
  async verifyIdentityCard({
    user,
    data,
  }: IdentityCardVerificationRequest): Promise<VerificationReturnType> {
    if (!isValidBirthNumber(data.birthNumber)) {
      return { success: false, reason: VerificationErrorsEnum.BIRTH_NUMBER_WRONG_FORMAT }
    }

    // request RFO data and handle exceptions that may be resolved later
    const rfoData = await this.magproxyService.rfoBirthNumberList(data.birthNumber)

    // create physical entity for the birth number.
    // UPVS identity and edesk status will be preferentially updated in the UPVS queue cron job
    await this.physicalEntityService.getOrCreateEmptyFromBirthNumber(data.birthNumber)

    if (!rfoData.success) {
      return rfoData
    }

    if (rfoData.data.length === 0) {
      return { success: false, reason: VerificationErrorsEnum.BIRTH_NUMBER_NOT_EXISTS }
    }

    const { firstMatchingRfo, birthNumberNotExistCounter } = this.findMatchingRfoEntry(
      rfoData.data,
      data.identityCard,
      user
    )

    if (firstMatchingRfo !== null) {
      return this.handleMatchedRfoEntry(user, firstMatchingRfo)
    }

    // No RFO response contained birthNumber
    if (birthNumberNotExistCounter === rfoData.data.length) {
      return { success: false, reason: MagproxyErrorsEnum.BIRTH_NUMBER_NOT_EXISTS }
    }

    return this.verifyIdentityCardViaDcom(user, data)
  }

  private findMatchingRfoEntry(
    rfoEntries: RfoIdentityListElement[],
    identityCard: string,
    user: CognitoGetUserData
  ): { firstMatchingRfo: RfoIdentityListElement | null; birthNumberNotExistCounter: number } {
    let birthNumberNotExistCounter = 0

    for (const rfoDataSingle of rfoEntries) {
      // If the check fails, increment counter
      if (!rfoDataSingle.rodneCislo) {
        birthNumberNotExistCounter += 1
        continue
      }

      const identityCardCheckResult = this.checkIdentityCard(rfoDataSingle, identityCard)
      if (!identityCardCheckResult.success) {
        continue
      }

      // Require Cognito given_name + family_name match to RFO
      if (!this.validatePersonName(rfoDataSingle, user.given_name, user.family_name)) {
        this.logger.warn('We refused validation based on names not matching.', {
          cognitoID: user.sub,
          hasGivenName: !!user.given_name,
          hasFamilyName: !!user.family_name,
          source: 'RFO_LIST',
          rfoEntryCount: rfoEntries.length,
          tier: user[CognitoUserAttributesEnum.TIER],
        })
        continue
      }

      return { firstMatchingRfo: rfoDataSingle, birthNumberNotExistCounter }
    }

    return { firstMatchingRfo: null, birthNumberNotExistCounter }
  }

  private async handleMatchedRfoEntry(
    user: CognitoGetUserData,
    matchingRfo: RfoIdentityListElement
  ): Promise<VerificationReturnType> {
    const birthNumber = matchingRfo.rodneCislo?.replaceAll('/', '')
    if (!birthNumber) {
      return { success: false, reason: VerificationErrorsEnum.BIRTH_NUMBER_NOT_EXISTS }
    }

    return this.saveUserAndLinkPhysicalEntity(user, matchingRfo.ifo || null, birthNumber, 0)
  }

  private async verifyIdentityCardViaDcom(
    user: CognitoGetUserData,
    data: RequestBodyVerifyIdentityCardDto
  ): Promise<VerificationReturnType> {
    const rfoDataDcom = await this.magproxyService.rfoBirthNumberDcom(data.birthNumber)

    if (!rfoDataDcom.success) {
      return rfoDataDcom
    }

    if (!rfoDataDcom.data.rodneCislo) {
      return { success: false, reason: VerificationErrorsEnum.BIRTH_NUMBER_NOT_EXISTS }
    }

    const rfoCheckDcom = this.checkIdentityCard(rfoDataDcom.data, data.identityCard)
    if (!rfoCheckDcom.success) {
      return rfoCheckDcom
    }

    // Require Cognito given_name + family_name match to RFO
    if (!this.validatePersonName(rfoDataDcom.data, user.given_name, user.family_name)) {
      this.logger.warn('We refused validation based on names not matching.', {
        cognitoID: user.sub,
        hasGivenName: !!user.given_name,
        hasFamilyName: !!user.family_name,
        source: 'DCOM',
        tier: user[CognitoUserAttributesEnum.TIER],
      })
      return { success: false, reason: VerificationErrorsEnum.NAMES_NOT_MATCHING }
    }

    const birthNumber = rfoDataDcom.data.rodneCislo.replaceAll('/', '')
    return this.saveUserAndLinkPhysicalEntity(user, rfoDataDcom.data.ifo || null, birthNumber, 1)
  }

  private async saveUserAndLinkPhysicalEntity(
    user: CognitoGetUserData,
    ifo: string | null,
    birthNumber: string,
    oldMagproxyDatabase: number
  ): Promise<VerificationReturnType> {
    const databaseResult =
      await this.verificationDataSubservice.checkAndCreateUserIfoAndBirthNumber(
        user,
        ifo,
        birthNumber,
        oldMagproxyDatabase
      )
    if (!databaseResult.success) {
      return databaseResult
    }

    const dbUser = await this.verificationDataSubservice.findUserByEmailOrExternalId(
      user.email,
      user.idUser
    )
    if (dbUser !== null) {
      await this.physicalEntityService.linkToUserIdByBirthnumber(dbUser.id, birthNumber)
    }
    return { success: true }
  }
}

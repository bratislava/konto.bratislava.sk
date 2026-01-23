import { Injectable } from '@nestjs/common'
import { ResponseRpoLegalPersonDto } from 'openapi-clients/magproxy'
import { MagproxyService } from '../../../magproxy/magproxy.service'
import { isValidBirthNumber } from '../../../utils/birthNumbers'
import { CognitoGetUserData } from '../../../utils/global-dtos/cognito.dto'
import {
  RequestBodyVerifyIdentityCardDto,
  RequestBodyVerifyWithRpoDto,
} from '../../dtos/requests.verification.dto'
import { DatabaseSubserviceUser } from './database.subservice'
import { PhysicalEntityService } from '../../../physical-entity/physical-entity.service'
import { RfoIdentityListElement } from '../../../rfo-by-birthnumber/dtos/rfoSchema'
import { VerificationErrorsEnum } from '../../verification.errors.enum'
import { LineLoggerSubservice } from '../../../utils/subservices/line-logger.subservice'
import { MagproxyErrorsEnum } from '../../../magproxy/magproxy.errors.enum'
import { VerificationReturnType } from '../../types'

@Injectable()
export class VerificationSubservice {
  private logger: LineLoggerSubservice

  constructor(
    private magproxyService: MagproxyService,
    private databaseSubservice: DatabaseSubserviceUser,
    private physicalEntityService: PhysicalEntityService
  ) {
    this.logger = new LineLoggerSubservice(VerificationSubservice.name)
  }

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

  private verifyRpoStatutory(
    legalEntity: ResponseRpoLegalPersonDto,
    birthNumber: string
  ): VerificationReturnType {
    const statutoryBodies = legalEntity.statutarneOrgany

    for (const statutoryBody of statutoryBodies ?? []) {
      for (const externalId of statutoryBody.osoba.fyzickaOsoba.externeIds) {
        if (
          externalId.typIdentifikatora.nazov === 'Rodné číslo' &&
          externalId.identifikator.replace('/', '') === birthNumber.replace('/', '')
        ) {
          return { success: true }
        }
      }
    }

    this.logger.warn({
      message: 'Could not match birthnumber with statutory organ from RPO',
      ico: legalEntity.ico,
      birthNumber: birthNumber,
    })
    return {
      success: false,
      reason: VerificationErrorsEnum.BIRTH_NUMBER_NOT_EXISTS,
    }
  }

  /**
   * Validates the first and last name of a person against a provided RFO identity data structure.
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

    const stripDiacritics = (str: string): string =>
      str.normalize('NFD').replace(/\p{Diacritic}/gu, '')

    const normalize = (str: string): string => stripDiacritics(str).trim().toLowerCase()

    const splitToParts = (str: string): string[] =>
      normalize(str)
        .split(/\s+/g) // handles multiple spaces + leading/trailing spaces after trim()
        .filter(Boolean)

    const normalizedFirstNames = splitToParts(firstName)
    const normalizedLastNames = splitToParts(lastName)

    if (normalizedFirstNames.length === 0 || normalizedLastNames.length === 0) {
      return false
    }

    const rfoFirstNames = (rfoData.menaOsoby ?? [])
      .map((x) => x.meno)
      .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      .map(normalize)

    const rfoLastNames = (rfoData.priezviskaOsoby ?? [])
      .map((x) => x.meno)
      .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      .map(normalize)

    if (rfoFirstNames.length === 0 || rfoLastNames.length === 0) {
      return false
    }

    const firstOk = normalizedFirstNames.every((name) => rfoFirstNames.includes(name))
    const lastOk = normalizedLastNames.every((name) => rfoLastNames.includes(name))

    return firstOk && lastOk
  }

  /**
   * Verifies the identity card of a user.
   *
   * The function attempts to verify the user's identity by comparing RFO data from magproxy with the provided data.
   * It creates a PhysicalEntity entry in the database alongside a new User (user only if the verification is successful).
   *
   * @param {CognitoGetUserData} user - The user object from Cognito.
   * @param {RequestBodyVerifyIdentityCardDto} data - The data for verifying the identity card.
   * @param {string} [ico] - The optional ICO number.
   * @throws {Error} - If there is an unexpected error during the verification process.
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  async verifyIdentityCard(
    user: CognitoGetUserData,
    data: RequestBodyVerifyIdentityCardDto,
    ico?: string
  ): Promise<VerificationReturnType> {
    if (!isValidBirthNumber(data.birthNumber)) {
      return { success: false, reason: VerificationErrorsEnum.BIRTH_NUMBER_WRONG_FORMAT }
    }

    // request RFO data and handle exceptions that may be resolved later
    const rfoData = await this.physicalEntityService.createFromBirthNumber(data.birthNumber)

    if (!rfoData.success) {
      return rfoData
    }

    if (!rfoData.data || rfoData.data.length == 0) {
      return { success: false, reason: VerificationErrorsEnum.BIRTH_NUMBER_NOT_EXISTS }
    }

    let birthNumberNotExistCounter = 0

    for (const rfoDataSingle of rfoData.data) {
      // If the check fails, increment counter
      if (!rfoDataSingle.rodneCislo) {
        birthNumberNotExistCounter += 1
        continue
      }

      const identityCardCheckResult = this.checkIdentityCard(rfoDataSingle, data.identityCard)
      if (!identityCardCheckResult.success) {
        continue
      }

      // For physical person, require Cognito given_name + family_name match to RFO
      if (!ico && !this.validatePersonName(rfoDataSingle, user.given_name, user.family_name)) {
        this.logger.warn('We refused validation based on names not matching.', {cognitoID: user.sub})
        continue
      }

      const birthNumber = rfoDataSingle.rodneCislo.replaceAll('/', '')
      let databaseResult: VerificationReturnType
      if (ico) {
        databaseResult = await this.databaseSubservice.checkAndCreateLegalPersonIcoAndBirthNumber(
          user,
          ico,
          birthNumber
        )
      } else {
        databaseResult = await this.databaseSubservice.checkAndCreateUserIfoAndBirthNumber(
          user,
          rfoDataSingle.ifo || null,
          birthNumber,
          0
        )
      }

      if (!databaseResult.success) {
        return databaseResult
      }

      if (!ico) {
        const dbUser = await this.databaseSubservice.findUserByEmailOrExternalId(
          user.email,
          user.idUser
        )
        if (dbUser !== null) {
          await this.physicalEntityService.linkToUserIdByBirthnumber(dbUser.id, birthNumber)
        }
      }
      return { success: true }
    }

    // No RFO response contained birthNumber
    if (birthNumberNotExistCounter == rfoData.data.length) {
      return { success: false, reason: MagproxyErrorsEnum.BIRTH_NUMBER_NOT_EXISTS }
    }

    const rfoDataDcom = await this.magproxyService.rfoBirthNumberDcom(data.birthNumber)

    if (!rfoDataDcom.success) {
      return rfoDataDcom
    }

    if (!rfoDataDcom.data?.rodneCislo) {
      return { success: false, reason: VerificationErrorsEnum.BIRTH_NUMBER_NOT_EXISTS }
    }

    const rfoCheckDcom = this.checkIdentityCard(rfoDataDcom.data, data.identityCard)

    if (!rfoCheckDcom.success) {
      return rfoCheckDcom
    }

    const birthNumber = rfoDataDcom.data.rodneCislo.replaceAll('/', '')
    let dbResultDcom: { success: boolean }
    if (ico) {
      dbResultDcom = await this.databaseSubservice.checkAndCreateLegalPersonIcoAndBirthNumber(
        user,
        ico,
        birthNumber
      )
    } else {
      dbResultDcom = await this.databaseSubservice.checkAndCreateUserIfoAndBirthNumber(
        user,
        rfoDataDcom.data.ifo || null,
        birthNumber,
        1
      )
    }

    return dbResultDcom.success
      ? { success: true }
      : { success: false, reason: VerificationErrorsEnum.BIRTHNUMBER_ICO_DUPLICITY }
  }

  async verifyIcoIdentityCard(
    user: CognitoGetUserData,
    data: RequestBodyVerifyWithRpoDto
  ): Promise<VerificationReturnType> {
    if (!isValidBirthNumber(data.birthNumber)) {
      return { success: false, reason: VerificationErrorsEnum.BIRTH_NUMBER_WRONG_FORMAT }
    }

    const rpoData = await this.magproxyService.rpoIco(data.ico)
    if (!rpoData.success) {
      return rpoData
    }

    if (!rpoData.data) {
      return { success: false, reason: VerificationErrorsEnum.RPO_FIELD_NOT_EXISTS }
    }

    const verifyStatutory = this.verifyRpoStatutory(rpoData.data, data.birthNumber)
    if (!verifyStatutory.success) {
      return verifyStatutory
    }

    return await this.verifyIdentityCard(
      user,
      {
        birthNumber: data.birthNumber,
        identityCard: data.identityCard,
        turnstileToken: data.turnstileToken,
      },
      data.ico
    )
  }
}

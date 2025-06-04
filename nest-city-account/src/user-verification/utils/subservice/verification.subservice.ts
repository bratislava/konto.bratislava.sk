import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ResponseRpoLegalPersonDto } from '../../../generated-clients/new-magproxy'
import { MagproxyService } from '../../../magproxy/magproxy.service'
import { isValidBirthNumber } from '../../../utils/birthNumbers'
import { CognitoGetUserData } from '../../../utils/global-dtos/cognito.dto'
import ThrowerErrorGuard, { ErrorMessengerGuard } from '../../../utils/guards/errors.guard'
import {
  RequestBodyVerifyIdentityCardDto,
  RequestBodyVerifyWithRpoDto,
  ResponseVerificationIdentityCardDto,
} from '../../dtos/requests.verification.dto'
import { DatabaseSubserviceUser } from './database.subservice'
import { PhysicalEntityService } from '../../../physical-entity/physical-entity.service'
import { ResponseErrorInternalDto } from '../../../utils/guards/dtos/error.dto'
import { UserErrorsEnum } from '../../../user/user.error.enum'
import { RfoIdentityList, RfoIdentityListElement } from '../../../rfo-by-birthnumber/dtos/rfoSchema'
import { RfoDataDto } from './types/verification-types.dto'
import { VerificationErrorsEnum } from '../../verification.errors.enum'
import { LineLoggerSubservice } from '../../../utils/subservices/line-logger.subservice'

@Injectable()
export class VerificationSubservice {
  private logger: LineLoggerSubservice

  constructor(
    private errorMessengerGuard: ErrorMessengerGuard,
    private throwerErrorGuard: ThrowerErrorGuard,
    private magproxyService: MagproxyService,
    private databaseSubservice: DatabaseSubserviceUser,
    private physicalEntityService: PhysicalEntityService
  ) {
    this.logger = new LineLoggerSubservice(VerificationSubservice.name)
  }

  private checkIdentityCard(
    rfoData: RfoIdentityListElement,
    identityCard: string
  ): ResponseVerificationIdentityCardDto {
    if (rfoData.datumUmrtia && rfoData.datumUmrtia !== 'unknown' && rfoData.datumUmrtia !== '') {
      return this.errorMessengerGuard.rfoDeadPerson()
    }
    if (!rfoData.doklady || Object.keys(rfoData.doklady).length === 0) {
      return this.errorMessengerGuard.birthNumberICInconsistency()
    }
    for (const document of rfoData.doklady) {
      if (
        (document.druhDokladu === 'Občiansky preukaz' ||
          document.druhDokladu === 'Povolenie na pobyt' ||
          document.druhDokladu === 'Pobytový preukaz občana EÚ' ||
          document.druhDokladu === 'Cestovný pas') &&
        document.jednoznacnyIdentifikator
      ) {
        if (document.jednoznacnyIdentifikator === identityCard) {
          return {
            statusCode: 200,
            status: 'OK',
            message: { message: 'ok' },
          }
        }

        // Some identity card numbers are in format "000000 XX" in registry, but users enter identity card as "XX000000"
        const identityCardMagproxy = document.jednoznacnyIdentifikator.trim().split(' ')

        if (
          identityCardMagproxy.length !== 2 &&
          identityCardMagproxy[1] + identityCardMagproxy[0] === identityCard
        ) {
          return {
            statusCode: 200,
            status: 'OK',
            message: { message: 'ok' },
          }
        }
      }
    }
    return this.errorMessengerGuard.birthNumberICInconsistency()
  }

  private verifyRpoStatutory(
    legalEntity: ResponseRpoLegalPersonDto,
    birthNumber: string
  ): ResponseVerificationIdentityCardDto {
    const statutoryBodies = legalEntity.statutarneOrgany

    for (const statutoryBody of statutoryBodies ?? []) {
      for (const externalId of statutoryBody.osoba.fyzickaOsoba.externeIds) {
        if (!externalId.typIdentifikatora.nazov) {
          this.errorMessengerGuard.rpoFieldNotExists('externalId.typIdentifikatora.nazov')
        }
        if (
          externalId.typIdentifikatora.nazov === 'Rodné číslo' &&
          externalId.identifikator.replace('/', '') === birthNumber.replace('/', '')
        ) {
          return {
            statusCode: 200,
            status: 'OK',
            message: externalId.identifikator,
          }
        }
      }
    }
    this.logger.warn({
      message: 'Could not match birthnumber with statutory organ from RPO',
      ico: legalEntity.ico,
      birthNumber: birthNumber,
    })
    return this.errorMessengerGuard.birthNumberNotExists()
  }

  /**
   * Verifies the identity card of a user.
   *
   * The function attempts to verify the user's identity by comparing RFO data from magproxy with the provided data.
   * It creates PhysicalEntity entry in the database alongside a new User (user only if the verification is successful).
   *
   * @param {CognitoGetUserData} user - The user object from Cognito.
   * @param {RequestBodyVerifyIdentityCardDto} data - The data for verifying the identity card.
   * @param {string} [ico] - The optional ICO number.
   * @returns {Promise<ResponseVerificationIdentityCardDto>} - The response containing the result of the verification.
   * @throws {Error} - If there is an unexpected error during the verification process.
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  async verifyIdentityCard(
    user: CognitoGetUserData,
    data: RequestBodyVerifyIdentityCardDto,
    ico?: string
  ): Promise<ResponseVerificationIdentityCardDto> {
    if (!isValidBirthNumber(data.birthNumber)) {
      return this.errorMessengerGuard.birthNumberBadFormat()
    }

    // request RFO data and handle exceptions that may be resolved later
    let rfoData: RfoDataDto
    try {
      const rfoRequest: RfoIdentityList = await this.physicalEntityService.createFromBirthNumber(
        data.birthNumber
      )
      rfoData = {
        statusCode: 200,
        data: rfoRequest,
        errorData: null,
      }
    } catch (error) {
      if (error instanceof HttpException) {
        if (
          error.getStatus() in
          [HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.UNPROCESSABLE_ENTITY, HttpStatus.NOT_FOUND]
        ) {
          rfoData = {
            statusCode: error.getStatus(),
            data: null,
            errorData: error.getResponse() as ResponseErrorInternalDto,
          }
        } else {
          throw error
        }
      } else {
        throw error
      }
    }

    if (rfoData.statusCode !== 200 && rfoData.data === null) {
      if (rfoData.errorData === null) {
        // different `data` type, but it is null in this case
        throw this.throwerErrorGuard.UnprocessableEntityException(
          UserErrorsEnum.NO_EXTERNAL_ID,
          `Data and Error data null: ${JSON.stringify({
            statusCode: rfoData.statusCode,
            data: null,
            errorData: null,
          })}`
        )
      }
      return rfoData.errorData
    }

    if (!rfoData.data || rfoData.data.length == 0) {
      return this.errorMessengerGuard.birthNumberNotExists()
    }

    let birthNumberNotExistCounter = 0

    for (const rfoDataSingle of rfoData.data) {
      // If check fails, increment counter
      if (!rfoDataSingle.rodneCislo) {
        birthNumberNotExistCounter += 1
        continue
      }

      const rfoCheck = this.checkIdentityCard(rfoDataSingle, data.identityCard)

      if (rfoCheck.statusCode === 200) {
        let dbResult: ResponseVerificationIdentityCardDto
        const birthNumber = rfoDataSingle.rodneCislo.replaceAll('/', '')
        if (ico) {
          dbResult = await this.databaseSubservice.checkAndCreateLegalPersonIcoAndBirthNumber(
            user,
            ico,
            birthNumber
          )
        } else {
          dbResult = await this.databaseSubservice.checkAndCreateUserIfoAndBirthNumber(
            user,
            rfoDataSingle.ifo || null,
            birthNumber,
            0
          )
        }

        if (dbResult.statusCode !== 200) {
          return dbResult
        } else {
          if (!ico) {
            const dbUser = await this.databaseSubservice.findUserByEmailOrExternalId(
              user.email,
              user.idUser
            )
            if (dbUser !== null) {
              await this.physicalEntityService.linkToUserIdByBirthnumber(dbUser.id, birthNumber)
            }
          }
          return rfoCheck
        }
      }
    }

    // No RFO response contained birthNumber
    if (birthNumberNotExistCounter == rfoData.data.length) {
      return this.errorMessengerGuard.birthNumberNotExists()
    }

    const rfoDataDcom = await this.magproxyService.rfoBirthNumberDcom(data.birthNumber)

    if (rfoDataDcom.statusCode !== 200 && rfoDataDcom.data === null) {
      if (rfoDataDcom.errorData === null) {
        throw this.throwerErrorGuard.UnprocessableEntityException(
          VerificationErrorsEnum.EMPTY_RFO_RESPONSE,
          `Data and Error data null: ${JSON.stringify(rfoDataDcom)}`
        )
      }
      return rfoDataDcom.errorData
    }

    if (!rfoDataDcom.data?.rodneCislo) {
      return this.errorMessengerGuard.birthNumberNotExists()
    }

    const rfoCheckDcom = this.checkIdentityCard(rfoDataDcom.data, data.identityCard)

    if (rfoCheckDcom.statusCode === 200) {
      const birthNumber = rfoDataDcom.data.rodneCislo.replaceAll('/', '')
      let dbResultDcom: ResponseVerificationIdentityCardDto
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

      if (dbResultDcom.statusCode !== 200) {
        return dbResultDcom
      } else {
        return rfoCheckDcom
      }
    } else {
      return rfoCheckDcom
    }
  }

  async verifyIcoIdentityCard(
    user: CognitoGetUserData,
    data: RequestBodyVerifyWithRpoDto
  ): Promise<ResponseVerificationIdentityCardDto> {
    if (!isValidBirthNumber(data.birthNumber)) {
      return this.errorMessengerGuard.birthNumberBadFormat()
    }

    const rpoData = await this.magproxyService.rpoIco(data.ico)
    if (rpoData.statusCode !== 200 && rpoData.data === null) {
      if (rpoData.errorData === null) {
        throw this.throwerErrorGuard.UnprocessableEntityException(
          VerificationErrorsEnum.EMPTY_RPO_RESPONSE,
          `Data and Error data null: ${JSON.stringify(rpoData)}`
        )
      }
      return rpoData.errorData
    }
    if (!rpoData || !rpoData.data) {
      return this.errorMessengerGuard.rpoFieldNotExists('ico')
    }
    const verifyStatutory = this.verifyRpoStatutory(rpoData.data, data.birthNumber)
    if (verifyStatutory.statusCode !== 200) {
      return verifyStatutory
    }

    const resultVerifyIdentityCard = await this.verifyIdentityCard(
      user,
      {
        birthNumber: data.birthNumber,
        identityCard: data.identityCard,
        turnstileToken: data.turnstileToken,
      },
      data.ico
    )

    return resultVerifyIdentityCard
  }
}

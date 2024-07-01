import { Injectable } from '@nestjs/common'
import { ResponseRfoPersonDto, ResponseRpoLegalPersonDto } from '../../../generated-clients/new-magproxy'
import { MagproxyService } from '../../../magproxy/magproxy.service'
import { isValidBirthNumber } from '../../../utils/birthNumbers'
import { CognitoGetUserData } from '../../../utils/global-dtos/cognito.dto'
import { ErrorMessengerGuard, ErrorThrowerGuard } from '../../../utils/guards/errors.guard'
import {
  RequestBodyVerifyIdentityCardDto,
  RequestBodyVerifyWithRpoDto,
  ResponseVerificationIdentityCardDto,
} from '../../dtos/requests.verification.dto'
import { DatabaseSubserviceUser } from './database.subservice'

@Injectable()
export class VerificationSubservice {
  constructor(
    private errorMessengerGuard: ErrorMessengerGuard,
    private errorThrowerGuard: ErrorThrowerGuard,
    private magproxyService: MagproxyService,
    private databaseSubservice: DatabaseSubserviceUser
  ) {}

  private checkIdentityCard(
    rfoData: ResponseRfoPersonDto,
    identityCard: string
  ): ResponseVerificationIdentityCardDto {
    if (rfoData.datumUmrtia && rfoData.datumUmrtia !== 'unknown' && rfoData.datumUmrtia !== '') {
      return this.errorMessengerGuard.rfoDeadPerson()
    }
    for (const document of rfoData.doklady) {
      if (
        document.druhDokladu === 'Občiansky preukaz' ||
        document.druhDokladu === 'Povolenie na pobyt' ||
        document.druhDokladu === 'Pobytový preukaz občana EÚ' ||
        document.druhDokladu === 'Cestovný pas'
      ) {
        if (document.jednoznacnyIdentifikator === identityCard) {
          return {
            statusCode: 200,
            status: 'OK',
            message: { message: 'ok', udrzitela: document.udrzitela },
          }
        }
        const identityCardMagproxy = document.jednoznacnyIdentifikator.split(' ') //Identity card numbers are in registry in format "0000 xx" and users from identity card enters "xx0000"
        if (identityCardMagproxy[1] + identityCardMagproxy[0] === identityCard) {
          return {
            statusCode: 200,
            status: 'OK',
            message: { message: 'ok', udrzitela: document.udrzitela },
          }
        }
      }
    }
    return this.errorMessengerGuard.birthNumberICInconsistency()
  }

  private verifyRpoStatutary(
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
    return this.errorMessengerGuard.birthNumberNotExists()
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  async verifyIdentityCard(
    user: CognitoGetUserData,
    data: RequestBodyVerifyIdentityCardDto,
    ico?: string
  ): Promise<ResponseVerificationIdentityCardDto> {
    if (!isValidBirthNumber(data.birthNumber)) {
      return this.errorMessengerGuard.birthNumberBadFormat()
    }

    const rfoData = await this.magproxyService.rfoBirthNumber(data.birthNumber)

    if (rfoData.statusCode !== 200 && rfoData.data === null) {
      if (rfoData.errorData === null) {
        throw this.errorThrowerGuard.dataAndErrorDataNull(rfoData)
      }
      return rfoData.errorData
    }

    if (!rfoData.data?.rodneCislo) {
      return this.errorMessengerGuard.birthNumberNotExists()
    }

    const rfoCheck = this.checkIdentityCard(rfoData.data, data.identityCard)

    if (rfoCheck.statusCode === 200) {
      let dbResult: ResponseVerificationIdentityCardDto
      const birthNumber = rfoData.data.rodneCislo.replaceAll('/', '')
      if (ico) {
        dbResult = await this.databaseSubservice.checkAndCreateLegalPersonIcoAndBirthNumber(
          user,
          ico,
          birthNumber
        )
      } else {
        dbResult = await this.databaseSubservice.checkAndCreateUserIfoAndBirthNumber(
          user,
          rfoData.data.ifo,
          birthNumber,
          0
        )
      }

      if (dbResult.statusCode !== 200) {
        return dbResult
      } else {
        return rfoCheck
      }
    } else {
      const rfoDataDcom = await this.magproxyService.rfoBirthNumberDcom(data.birthNumber)

      if (rfoDataDcom.statusCode !== 200 && rfoDataDcom.data === null) {
        if (rfoDataDcom.errorData === null) {
          throw this.errorThrowerGuard.dataAndErrorDataNull(rfoDataDcom)
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
            rfoDataDcom.data.ifo,
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
        throw this.errorThrowerGuard.dataAndErrorDataNull(rpoData)
      }
      return rpoData.errorData
    }
    if (!rpoData || !rpoData.data) {
      return this.errorMessengerGuard.rpoFieldNotExists('ico')
    }
    const verifyStatutory = this.verifyRpoStatutary(rpoData.data, data.birthNumber)
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

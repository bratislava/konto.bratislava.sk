// TODO - communication state to LEGAL_ENTITY
import { Injectable } from '@nestjs/common'

import {
  GdprDataDto,
  ResponsePublicUnsubscribeDto,
  ResponseUserDataBasicDto,
  ResponseUserDataDto,
} from './dtos/gdpr.user.dto'

import { BloomreachService } from '../bloomreach/bloomreach.service'
import { PrismaService } from '../prisma/prisma.service'
import { UserErrorsEnum, UserErrorsResponseEnum } from './user.error.enum'
import { getTaxDeadlineDate } from '../utils/constants/tax-deadline'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import {
  ResponseLegalPersonDataDto,
  ResponseLegalPersonDataSimpleDto,
} from './dtos/gdpr.legalperson.dto'
import { DatabaseSubserviceUser } from './utils/subservice/database.subservice'
import { GDPRSubTypeEnum } from '@prisma/client'
import { CognitoGetUserData, CognitoUserAccountTypesEnum } from '../utils/global-dtos/cognito.dto'
import { LoginClientEnum } from '@prisma/client'

@Injectable()
export class UserService {
  constructor(
    private databaseSubservice: DatabaseSubserviceUser,
    private prisma: PrismaService,
    private throwerErrorGuard: ThrowerErrorGuard,
    private bloomreachService: BloomreachService
  ) {}

  private verificationDeadline(verificationDate: Date | null): boolean {
    const verificationDeadlineDate = getTaxDeadlineDate()
    if (verificationDate === null) {
      return false
    }
    return verificationDate < verificationDeadlineDate
  }

  async getOrCreateUserData(cognitoUserData: CognitoGetUserData): Promise<ResponseUserDataDto> {
    const user = await this.databaseSubservice.getOrCreateUser(cognitoUserData)
    const officialCorrespondenceChannel =
      await this.databaseSubservice.getOfficialCorrespondenceChannel(user.id)
    const showEmailCommunicationBanner =
      await this.databaseSubservice.getShowEmailCommunicationBanner(
        user.id,
        user.birthNumber ? true : false
      )
    const getGdprData = await this.databaseSubservice.getUserGdprData(user.id)
    return {
      ...user,
      wasVerifiedBeforeTaxDeadline: this.verificationDeadline(user.lastVerificationIdentityCard),
      officialCorrespondenceChannel,
      showEmailCommunicationBanner,
      gdprData: getGdprData,
    }
  }

  async getOrCreateLegalPersonData(
    cognitoUserData: CognitoGetUserData
  ): Promise<ResponseLegalPersonDataDto> {
    const user = await this.databaseSubservice.getOrCreateLegalPerson(cognitoUserData)
    const getGdprData = await this.databaseSubservice.getLegalPersonGdprData(user.id)
    return { ...user, gdprData: getGdprData }
  }

  async registerUserLoginClient(
    cognitoUserData: CognitoGetUserData,
    loginClient: LoginClientEnum
  ): Promise<void> {
    const user = await this.databaseSubservice.getUserByExternalId(cognitoUserData.idUser)
    if (!user) {
      throw this.throwerErrorGuard.NotFoundException(
        UserErrorsEnum.USER_NOT_FOUND,
        UserErrorsResponseEnum.USER_NOT_FOUND
      )
    }
    await this.databaseSubservice.registerUserLoginClient(loginClient, user.id)
  }

  async registerLegalPersonLoginClient(
    cognitoUserData: CognitoGetUserData,
    loginClient: LoginClientEnum
  ): Promise<void> {
    const legalPerson = await this.databaseSubservice.getLegalPersonByExternalId(
      cognitoUserData.idUser
    )
    if (!legalPerson) {
      throw this.throwerErrorGuard.NotFoundException(
        UserErrorsEnum.USER_NOT_FOUND,
        UserErrorsResponseEnum.USER_NOT_FOUND
      )
    }
    await this.databaseSubservice.registerLegalPersonLoginClient(loginClient, legalPerson.id)
  }

  async removeBirthNumber(id: string): Promise<ResponseUserDataDto> {
    const user = await this.databaseSubservice.removeBirthNumber(id)
    const officialCorrespondenceChannel =
      await this.databaseSubservice.getOfficialCorrespondenceChannel(user.id)
    const showEmailCommunicationBanner =
      await this.databaseSubservice.getShowEmailCommunicationBanner(
        user.id,
        user.birthNumber ? true : false
      )
    const getGdprData = await this.databaseSubservice.getUserGdprData(user.id)
    return {
      ...user,
      wasVerifiedBeforeTaxDeadline: this.verificationDeadline(user.lastVerificationIdentityCard),
      officialCorrespondenceChannel,
      showEmailCommunicationBanner,
      gdprData: getGdprData,
    }
  }

  async removeLegalPersonBirthNumber(id: string) {
    const user = await this.databaseSubservice.removeLegalPersonBirthNumber(id)
    const getGdprData = await this.databaseSubservice.getUserGdprData(user.id)
    return {
      ...user,
      wasVerifiedBeforeTaxDeadline: false, // TODO add this for legal persons
      officialCorrespondenceChannel: null,
      gdprData: getGdprData,
      showEmailCommunicationBanner: false, // TODO add this for legal persons
    }
  }

  async subUnsubUser(
    cognitoUserData: CognitoGetUserData,
    gdprSubType: GDPRSubTypeEnum,
    gdprData: GdprDataDto[]
  ): Promise<ResponseUserDataDto> {
    const user = await this.databaseSubservice.getOrCreateUser(cognitoUserData)
    await this.databaseSubservice.changeUserGdprData(
      user.id,
      gdprData.map((elem) => ({ ...elem, subType: gdprSubType }))
    )

    await this.bloomreachService.trackEventConsents(
      gdprData.map((elem) => ({ ...elem, subType: gdprSubType })),
      user.externalId,
      user.id,
      false
    )

    const officialCorrespondenceChannel =
      await this.databaseSubservice.getOfficialCorrespondenceChannel(user.id)
    const showEmailCommunicationBanner =
      await this.databaseSubservice.getShowEmailCommunicationBanner(
        user.id,
        user.birthNumber ? true : false
      )
    const getGdprData = await this.databaseSubservice.getUserGdprData(user.id)
    return {
      ...user,
      wasVerifiedBeforeTaxDeadline: this.verificationDeadline(user.lastVerificationIdentityCard),
      officialCorrespondenceChannel,
      showEmailCommunicationBanner,
      gdprData: getGdprData,
    }
  }

  async subUnsubLegalPerson(
    cognitoUserData: CognitoGetUserData,
    gdprSubType: GDPRSubTypeEnum,
    gdprData: GdprDataDto[]
  ): Promise<ResponseLegalPersonDataDto> {
    const user = await this.databaseSubservice.getOrCreateLegalPerson(cognitoUserData)
    await this.databaseSubservice.changeLegalPersonGdprData(
      user.id,
      gdprData.map((elem) => ({
        ...elem,
        subType: gdprSubType,
      }))
    )
    const getGdprData = await this.databaseSubservice.getLegalPersonGdprData(user.id)
    return { ...user, gdprData: getGdprData }
  }

  async unsubscribePublicUser(
    id: string,
    gdprData: GdprDataDto[]
  ): Promise<ResponsePublicUnsubscribeDto> {
    await this.databaseSubservice.changeUserGdprData(
      id,
      gdprData.map((elem) => ({ ...elem, subType: GDPRSubTypeEnum.unsubscribe }))
    )
    const getGdprData = await this.databaseSubservice.getUserGdprData(id)
    const user = await this.databaseSubservice.getUserById(id)
    if (!user) {
      throw this.throwerErrorGuard.NotFoundException(
        UserErrorsEnum.USER_NOT_FOUND,
        UserErrorsResponseEnum.USER_NOT_FOUND
      )
    }

    await this.bloomreachService.trackEventConsents(
      gdprData.map((elem) => ({ ...elem, subType: GDPRSubTypeEnum.unsubscribe })),
      user.externalId,
      user.id,
      false
    )

    return { id: id, message: 'user was unsubscribed', gdprData: getGdprData, userData: user }
  }

  async unsubscribePublicUserByExternalId(
    externalId: string,
    gdprData: GdprDataDto[]
  ): Promise<ResponsePublicUnsubscribeDto> {
    const user = await this.databaseSubservice.getUserByExternalId(externalId)
    if (user) {
      const data = await this.unsubscribePublicUser(user.id, gdprData)
      return data
    }
    throw this.throwerErrorGuard.NotFoundException(
      UserErrorsEnum.USER_NOT_FOUND,
      UserErrorsResponseEnum.USER_NOT_FOUND
    )
  }

  async changeUserEmail(id: string, newEmail: string): Promise<ResponseUserDataBasicDto> {
    try {
      const user = await this.prisma.user.update({
        where: {
          externalId: id,
        },
        data: {
          email: newEmail,
        },
      })
      const officialCorrespondenceChannel =
        await this.databaseSubservice.getOfficialCorrespondenceChannel(user.id)
      const showEmailCommunicationBanner =
        await this.databaseSubservice.getShowEmailCommunicationBanner(
          user.id,
          user.birthNumber ? true : false
        )
      return {
        ...user,
        wasVerifiedBeforeTaxDeadline: this.verificationDeadline(user.lastVerificationIdentityCard),
        officialCorrespondenceChannel,
        showEmailCommunicationBanner,
      }
    } catch (error) {
      throw this.throwerErrorGuard.NotFoundException(
        UserErrorsEnum.USER_NOT_FOUND,
        UserErrorsResponseEnum.USER_NOT_FOUND,
        undefined,
        error
      )
    }
  }

  async changeLegalPersonEmail(
    id: string,
    newEmail: string
  ): Promise<ResponseLegalPersonDataSimpleDto> {
    try {
      const user = await this.prisma.legalPerson.update({
        where: {
          externalId: id,
        },
        data: {
          email: newEmail,
        },
      })

      return user
    } catch (error) {
      throw this.throwerErrorGuard.NotFoundException(
        UserErrorsEnum.USER_NOT_FOUND,
        UserErrorsResponseEnum.USER_NOT_FOUND,
        undefined,
        error
      )
    }
  }

  async getOrCreateUserOrLegalPerson(
    accountType: CognitoUserAccountTypesEnum,
    cognitoUserData: CognitoGetUserData
  ) {
    if (accountType === CognitoUserAccountTypesEnum.PHYSICAL_ENTITY) {
      const result = await this.databaseSubservice.getOrCreateUser(cognitoUserData, true)
      return result
    }
    if (
      accountType === CognitoUserAccountTypesEnum.LEGAL_ENTITY ||
      accountType === CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY
    ) {
      const result = await this.databaseSubservice.getOrCreateLegalPerson(cognitoUserData)
      return result
    }
  }
}

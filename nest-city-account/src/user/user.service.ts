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
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import {
  ResponseLegalPersonDataDto,
  ResponseLegalPersonDataSimpleDto,
} from './dtos/gdpr.legalperson.dto'
import {
  LegalPersonContactAndIdInfoResponseDto,
  UserContactAndIdInfoResponseDto,
} from './dtos/user-contact-info.dto'
import { DatabaseSubserviceUser } from './utils/subservice/database.subservice'
import { DeliveryMethodEnum, GDPRSubTypeEnum } from '@prisma/client'
import {
  CognitoGetUserData,
  CognitoUserAccountTypesEnum,
  CognitoUserAttributesEnum,
} from '../utils/global-dtos/cognito.dto'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { LoginClientEnum } from '@prisma/client'
import { getTaxDeadlineDate } from '../utils/constants/tax-deadline'

@Injectable()
export class UserService {
  constructor(
    private databaseSubservice: DatabaseSubserviceUser,
    private prisma: PrismaService,
    private throwerErrorGuard: ThrowerErrorGuard,
    private bloomreachService: BloomreachService,
    private cognitoSubservice: CognitoSubservice
  ) {}

  private changedDeliveryMethodAfterDeadline(user: {
    taxDeliveryMethodAtLockDate: DeliveryMethodEnum | null
    taxDeliveryMethod: DeliveryMethodEnum | null
  }): boolean {
    const now = new Date()
    const deadline = getTaxDeadlineDate()

    if (now < deadline) {
      return false
    }

    if (
      user.taxDeliveryMethodAtLockDate !== user.taxDeliveryMethod &&
      user.taxDeliveryMethodAtLockDate !== DeliveryMethodEnum.EDESK
    ) {
      return true
    }

    return false
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
      officialCorrespondenceChannel,
      showEmailCommunicationBanner,
      gdprData: getGdprData,
      changedDeliveryMethodAfterDeadline: this.changedDeliveryMethodAfterDeadline(user),
    }
  }

  async getOrCreateLegalPersonData(
    cognitoUserData: CognitoGetUserData
  ): Promise<ResponseLegalPersonDataDto> {
    const user = await this.databaseSubservice.getOrCreateLegalPerson(cognitoUserData)
    const getGdprData = await this.databaseSubservice.getLegalPersonGdprData(user.id)
    return { ...user, gdprData: getGdprData }
  }

  async recordUserLoginClient(externalId: string, loginClient: LoginClientEnum): Promise<void> {
    const user = await this.databaseSubservice.getUserByExternalId(externalId)
    if (!user) {
      throw this.throwerErrorGuard.NotFoundException(
        UserErrorsEnum.USER_NOT_FOUND,
        `User not found for Cognito ID: ${externalId}`,
        `Failed to record login client '${loginClient}' for user with Cognito ID: ${externalId}. User does not exist in database.`
      )
    }
    await this.databaseSubservice.recordUserLoginClient(loginClient, user.id)
  }

  async recordLegalPersonLoginClient(
    externalId: string,
    loginClient: LoginClientEnum
  ): Promise<void> {
    const legalPerson = await this.databaseSubservice.getLegalPersonByExternalId(externalId)
    if (!legalPerson) {
      throw this.throwerErrorGuard.NotFoundException(
        UserErrorsEnum.USER_NOT_FOUND,
        `Legal person not found for Cognito ID: ${externalId}`,
        `Failed to record login client '${loginClient}' for legal person with Cognito ID: ${externalId}. Legal person does not exist in database.`
      )
    }
    await this.databaseSubservice.recordLegalPersonLoginClient(loginClient, legalPerson.id)
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
      officialCorrespondenceChannel,
      showEmailCommunicationBanner,
      gdprData: getGdprData,
      changedDeliveryMethodAfterDeadline: this.changedDeliveryMethodAfterDeadline(user),
    }
  }

  async removeLegalPersonBirthNumber(id: string) {
    const user = await this.databaseSubservice.removeLegalPersonBirthNumber(id)
    const getGdprData = await this.databaseSubservice.getUserGdprData(user.id)
    return {
      ...user,
      officialCorrespondenceChannel: null,
      gdprData: getGdprData,
      showEmailCommunicationBanner: false, // TODO add this for legal persons
      changedDeliveryMethodAfterDeadline: false,
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
      officialCorrespondenceChannel,
      showEmailCommunicationBanner,
      gdprData: getGdprData,
      changedDeliveryMethodAfterDeadline: this.changedDeliveryMethodAfterDeadline(user),
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
        officialCorrespondenceChannel,
        showEmailCommunicationBanner,
        changedDeliveryMethodAfterDeadline: this.changedDeliveryMethodAfterDeadline(user),
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

  /**
   * Gets or creates user/legal person from Cognito user data as raw database entity
   *
   * @param cognitoUserData Cognito user data
   * @returns raw database entity without additional computed fields
   */
  async getOrCreateUserOrLegalPersonRaw(cognitoUserData: CognitoGetUserData) {
    const accountType = cognitoUserData[CognitoUserAttributesEnum.ACCOUNT_TYPE]
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

  async getOrCreateUserOrLegalPerson(
    cognitoUserData: CognitoGetUserData
  ): Promise<ResponseUserDataDto | ResponseLegalPersonDataDto> {
    const accountType = cognitoUserData[CognitoUserAttributesEnum.ACCOUNT_TYPE]

    if (accountType === CognitoUserAccountTypesEnum.PHYSICAL_ENTITY) {
      return this.getOrCreateUserData(cognitoUserData)
    }

    if (
      accountType === CognitoUserAccountTypesEnum.LEGAL_ENTITY ||
      accountType === CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY
    ) {
      return this.getOrCreateLegalPersonData(cognitoUserData)
    }

    throw this.throwerErrorGuard.UnprocessableEntityException(
      UserErrorsEnum.COGNITO_TYPE_ERROR,
      UserErrorsResponseEnum.COGNITO_TYPE_ERROR
    )
  }

  async recordLoginClient(
    cognitoUserData: CognitoGetUserData,
    loginClient: LoginClientEnum
  ): Promise<void> {
    const accountType = cognitoUserData[CognitoUserAttributesEnum.ACCOUNT_TYPE]
    const externalId = cognitoUserData.idUser

    if (accountType === CognitoUserAccountTypesEnum.PHYSICAL_ENTITY) {
      await this.recordUserLoginClient(externalId, loginClient)
      return
    }

    if (
      accountType === CognitoUserAccountTypesEnum.LEGAL_ENTITY ||
      accountType === CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY
    ) {
      await this.recordLegalPersonLoginClient(externalId, loginClient)
      return
    }

    throw this.throwerErrorGuard.UnprocessableEntityException(
      UserErrorsEnum.COGNITO_TYPE_ERROR,
      UserErrorsResponseEnum.COGNITO_TYPE_ERROR
    )
  }

  async getContactAndIdInfoByExternalId(
    externalId: string
  ): Promise<UserContactAndIdInfoResponseDto | LegalPersonContactAndIdInfoResponseDto> {
    // Get data from Cognito
    const cognitoData = await this.cognitoSubservice.getDataFromCognito(externalId)
    const accountType = cognitoData[CognitoUserAttributesEnum.ACCOUNT_TYPE]

    if (accountType === CognitoUserAccountTypesEnum.PHYSICAL_ENTITY) {
      // Get user from database
      const user = await this.databaseSubservice.getUserByExternalId(externalId)
      if (!user) {
        throw this.throwerErrorGuard.NotFoundException(
          UserErrorsEnum.USER_NOT_FOUND,
          `User not found for external ID: ${externalId}`
        )
      }

      return {
        externalId: externalId,
        accountType: accountType,
        email: cognitoData.email,
        firstName: cognitoData.given_name,
        lastName: cognitoData.family_name,
        birthNumber: user.birthNumber ?? undefined,
      }
    }

    if (
      accountType === CognitoUserAccountTypesEnum.LEGAL_ENTITY ||
      accountType === CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY
    ) {
      // Get legal person from database
      const legalPerson = await this.databaseSubservice.getLegalPersonByExternalId(externalId)
      if (!legalPerson) {
        throw this.throwerErrorGuard.NotFoundException(
          UserErrorsEnum.USER_NOT_FOUND,
          `Legal person not found for external ID: ${externalId}`
        )
      }

      return {
        externalId: externalId,
        accountType: accountType,
        email: cognitoData.email,
        name: cognitoData.name,
        ico: legalPerson.ico ?? undefined,
      }
    }

    throw this.throwerErrorGuard.UnprocessableEntityException(
      UserErrorsEnum.COGNITO_TYPE_ERROR,
      UserErrorsResponseEnum.COGNITO_TYPE_ERROR
    )
  }
}

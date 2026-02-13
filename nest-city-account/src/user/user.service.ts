// TODO - communication state to LEGAL_ENTITY
import { Injectable } from '@nestjs/common'

import {
  GdprDataDto,
  ResponsePublicUnsubscribeDto,
  ResponseUserDataBasicDto,
  ResponseUserDataDto,
} from './dtos/gdpr.user.dto'

import { BloomreachService } from '../bloomreach/bloomreach.service'
import { ACTIVE_USER_FILTER, PrismaService } from '../prisma/prisma.service'
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
import { UserDataSubservice } from './utils/subservice/user-data.subservice'
import {
  CognitoUserAttributesTierEnum,
  DeliveryMethodEnum,
  GDPRSubTypeEnum,
  User,
} from '@prisma/client'
import {
  CognitoGetUserData,
  CognitoUserAccountTypesEnum,
  CognitoUserAttributesEnum,
} from '../utils/global-dtos/cognito.dto'
import { CognitoSubservice } from '../utils/subservices/cognito.subservice'
import { LoginClientEnum } from '@prisma/client'
import { getTaxDeadlineDate } from '../utils/constants/tax-deadline'
import { AdminErrorsEnum, AdminErrorsResponseEnum } from '../admin/admin.errors.enum'
import {
  DeactivateAccountResponseDto,
  MarkDeceasedAccountResponseDto,
} from './dtos/user-modification-response.dto'
import { UserTierService } from './user-tier.service'
import { TaxSubservice } from '../utils/subservices/tax.subservice'
import { AnonymizeResponse } from '../bloomreach/bloomreach.dto'
import {
  CustomErrorAdminTypesEnum,
  CustomErrorAdminTypesResponseEnum,
} from '../admin/dtos/error.dto'
import {
  GetNewVerifiedUsersBirthNumbersResponseDto,
  ResponseUserByBirthNumberDto,
} from '../integration/dtos/integration-response.dto'

const USER_REQUEST_LIMIT = 100

@Injectable()
export class UserService {
  constructor(
    private userDataSubservice: UserDataSubservice,
    private prisma: PrismaService,
    private throwerErrorGuard: ThrowerErrorGuard,
    private bloomreachService: BloomreachService,
    private cognitoSubservice: CognitoSubservice,
    private userTierService: UserTierService,
    private taxSubservice: TaxSubservice
  ) {}

  private async hasChangedDeliveryMethodAfterDeadline(userId: string): Promise<boolean> {
    const now = new Date()
    const deadline = getTaxDeadlineDate()

    if (now < deadline) {
      return false
    }

    const { active, locked } =
      await this.userDataSubservice.getActiveAndLockedDeliveryMethodsWithDates({ id: userId })

    // If EDESK is activated after the deadline, the information is sent directly to Noris.
    // We are legally required to communicate with residents via EDESK once it is active.
    if (active?.deliveryMethod === DeliveryMethodEnum.EDESK) {
      return false
    }

    // If the user was verified after the deadline, his locked delivery method will be NULL. Default delivery method is POSTAL.
    // Therefore, if the user has selected POSTAL as delivery method, we should not consider it as a change.
    if (active?.deliveryMethod === DeliveryMethodEnum.POSTAL && !locked?.deliveryMethod) {
      return false
    }

    if (active?.deliveryMethod !== locked?.deliveryMethod) {
      return true
    }

    return false
  }

  async getOrCreateUserData(cognitoUserData: CognitoGetUserData): Promise<ResponseUserDataDto> {
    const user = await this.userDataSubservice.getOrCreateUser(cognitoUserData)
    const officialCorrespondenceChannel =
      await this.userDataSubservice.getOfficialCorrespondenceChannel(user.id)
    const showEmailCommunicationBanner =
      await this.userDataSubservice.getShowEmailCommunicationBanner(
        user.id,
        user.birthNumber ? true : false
      )
    const getGdprData = await this.userDataSubservice.getUserGdprData(user.id)
    return {
      ...user,
      officialCorrespondenceChannel,
      showEmailCommunicationBanner,
      gdprData: getGdprData,
      hasChangedDeliveryMethodAfterDeadline: await this.hasChangedDeliveryMethodAfterDeadline(
        user.id
      ),
    }
  }

  async getOrCreateLegalPersonData(
    cognitoUserData: CognitoGetUserData
  ): Promise<ResponseLegalPersonDataDto> {
    const user = await this.userDataSubservice.getOrCreateLegalPerson(cognitoUserData)
    const getGdprData = await this.userDataSubservice.getLegalPersonGdprData(user.id)
    return { ...user, gdprData: getGdprData }
  }

  async recordUserLoginClient(externalId: string, loginClient: LoginClientEnum): Promise<void> {
    const user = await this.userDataSubservice.getUserByExternalId(externalId)
    if (!user) {
      throw this.throwerErrorGuard.NotFoundException(
        UserErrorsEnum.USER_NOT_FOUND,
        `User not found for Cognito ID: ${externalId}`,
        `Failed to record login client '${loginClient}' for user with Cognito ID: ${externalId}. User does not exist in database.`
      )
    }
    await this.userDataSubservice.recordUserLoginClient(loginClient, user.id)
  }

  async recordLegalPersonLoginClient(
    externalId: string,
    loginClient: LoginClientEnum
  ): Promise<void> {
    const legalPerson = await this.userDataSubservice.getLegalPersonByExternalId(externalId)
    if (!legalPerson) {
      throw this.throwerErrorGuard.NotFoundException(
        UserErrorsEnum.USER_NOT_FOUND,
        `Legal person not found for Cognito ID: ${externalId}`,
        `Failed to record login client '${loginClient}' for legal person with Cognito ID: ${externalId}. Legal person does not exist in database.`
      )
    }
    await this.userDataSubservice.recordLegalPersonLoginClient(loginClient, legalPerson.id)
  }

  async removeBirthNumber(id: string): Promise<ResponseUserDataDto> {
    const user = await this.userDataSubservice.removeBirthNumber(id)
    const officialCorrespondenceChannel =
      await this.userDataSubservice.getOfficialCorrespondenceChannel(user.id)
    const showEmailCommunicationBanner =
      await this.userDataSubservice.getShowEmailCommunicationBanner(
        user.id,
        user.birthNumber ? true : false
      )
    const getGdprData = await this.userDataSubservice.getUserGdprData(user.id)
    return {
      ...user,
      officialCorrespondenceChannel,
      showEmailCommunicationBanner,
      gdprData: getGdprData,
      hasChangedDeliveryMethodAfterDeadline: await this.hasChangedDeliveryMethodAfterDeadline(
        user.id
      ),
    }
  }

  async removeLegalPersonBirthNumber(id: string) {
    const user = await this.userDataSubservice.removeLegalPersonBirthNumber(id)
    const getGdprData = await this.userDataSubservice.getUserGdprData(user.id)
    return {
      ...user,
      officialCorrespondenceChannel: null,
      gdprData: getGdprData,
      showEmailCommunicationBanner: false, // TODO add this for legal persons
      hasChangedDeliveryMethodAfterDeadline: false,
    }
  }

  async subUnsubUser(
    cognitoUserData: CognitoGetUserData,
    gdprSubType: GDPRSubTypeEnum,
    gdprData: GdprDataDto[]
  ): Promise<ResponseUserDataDto> {
    const user = await this.userDataSubservice.getOrCreateUser(cognitoUserData)
    await this.userDataSubservice.changeUserGdprData(
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
      await this.userDataSubservice.getOfficialCorrespondenceChannel(user.id)
    const showEmailCommunicationBanner =
      await this.userDataSubservice.getShowEmailCommunicationBanner(
        user.id,
        user.birthNumber ? true : false
      )
    const getGdprData = await this.userDataSubservice.getUserGdprData(user.id)
    return {
      ...user,
      officialCorrespondenceChannel,
      showEmailCommunicationBanner,
      gdprData: getGdprData,
      hasChangedDeliveryMethodAfterDeadline: await this.hasChangedDeliveryMethodAfterDeadline(
        user.id
      ),
    }
  }

  async subUnsubLegalPerson(
    cognitoUserData: CognitoGetUserData,
    gdprSubType: GDPRSubTypeEnum,
    gdprData: GdprDataDto[]
  ): Promise<ResponseLegalPersonDataDto> {
    const user = await this.userDataSubservice.getOrCreateLegalPerson(cognitoUserData)
    await this.userDataSubservice.changeLegalPersonGdprData(
      user.id,
      gdprData.map((elem) => ({
        ...elem,
        subType: gdprSubType,
      }))
    )
    const getGdprData = await this.userDataSubservice.getLegalPersonGdprData(user.id)
    return { ...user, gdprData: getGdprData }
  }

  async unsubscribePublicUser(
    id: string,
    gdprData: GdprDataDto[]
  ): Promise<ResponsePublicUnsubscribeDto> {
    await this.userDataSubservice.changeUserGdprData(
      id,
      gdprData.map((elem) => ({ ...elem, subType: GDPRSubTypeEnum.unsubscribe }))
    )
    const getGdprData = await this.userDataSubservice.getUserGdprData(id)
    const user = await this.userDataSubservice.getUserById(id)
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
    const user = await this.userDataSubservice.getUserByExternalId(externalId)
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
        await this.userDataSubservice.getOfficialCorrespondenceChannel(user.id)
      const showEmailCommunicationBanner =
        await this.userDataSubservice.getShowEmailCommunicationBanner(
          user.id,
          user.birthNumber ? true : false
        )
      return {
        ...user,
        officialCorrespondenceChannel,
        showEmailCommunicationBanner,
        hasChangedDeliveryMethodAfterDeadline: await this.hasChangedDeliveryMethodAfterDeadline(
          user.id
        ),
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
      const result = await this.userDataSubservice.getOrCreateUser(cognitoUserData, true)
      return result
    }
    if (
      accountType === CognitoUserAccountTypesEnum.LEGAL_ENTITY ||
      accountType === CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY
    ) {
      const result = await this.userDataSubservice.getOrCreateLegalPerson(cognitoUserData)
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
      const user = await this.userDataSubservice.getUserByExternalId(externalId)
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
      const legalPerson = await this.userDataSubservice.getLegalPersonByExternalId(externalId)
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

  async getUserDataByBirthNumber(birthNumber: string): Promise<ResponseUserByBirthNumberDto> {
    const user = await this.prisma.user.findUnique({
      where: { birthNumber, ...ACTIVE_USER_FILTER },
    })
    if (!user) {
      throw this.throwerErrorGuard.NotFoundException(
        AdminErrorsEnum.BIRTH_NUMBER_NOT_FOUND,
        AdminErrorsResponseEnum.BIRTH_NUMBER_NOT_FOUND
      )
    }
    let cognitoUser = {}
    if (user.externalId) {
      try {
        cognitoUser = await this.cognitoSubservice.getDataFromCognito(user.externalId)
      } catch (error) {}
    }
    return {
      email: user.email,
      birthNumber: user.birthNumber,
      externalId: user.externalId,
      userAttribute: user.userAttribute,
      cognitoAttributes: cognitoUser,
      taxDeliveryMethodAtLockDate: user.taxDeliveryMethodAtLockDate,
    }
  }

  /**
   * Similar to function getUserDataByBirthNumber, returns data about users based on their birth number, but instead of separately, it does it in batch in one request.
   * @param birthNumbers Array of birth numbers without slash, for which users should be retrieved from database.
   * @returns A map of birth numbers (those which were found in database) to user information.
   */
  async getUsersDataByBirthNumbers(
    birthNumbers: string[]
  ): Promise<Record<string, ResponseUserByBirthNumberDto>> {
    const users = await this.prisma.user.findMany({
      where: {
        birthNumber: {
          in: birthNumbers,
        },
        ...ACTIVE_USER_FILTER,
      },
    })
    const result: Record<string, ResponseUserByBirthNumberDto> = {}

    for (const user of users) {
      if (!user.birthNumber) {
        continue
      }
      let cognitoUser = {}
      if (user.externalId) {
        try {
          cognitoUser = await this.cognitoSubservice.getDataFromCognito(user.externalId)
        } catch (error) {}
      }

      result[user.birthNumber] = {
        email: user.email,
        birthNumber: user.birthNumber,
        externalId: user.externalId,
        userAttribute: user.userAttribute,
        cognitoAttributes: cognitoUser,
        taxDeliveryMethodAtLockDate: user.taxDeliveryMethodAtLockDate,
      }
    }

    return result
  }

  async deactivateAccount(externalId: string): Promise<DeactivateAccountResponseDto> {
    const cognitoUser = await this.cognitoSubservice.getDataFromCognito(externalId)
    await this.cognitoSubservice.cognitoDeactivateUser(externalId)
    await this.cognitoSubservice.deactivateCognitoMail(externalId, cognitoUser.email)

    // We also need to change the account to unverified, since we delete birthNumber from database
    await this.userTierService.changeTier(
      externalId,
      CognitoUserAttributesTierEnum.NEW,
      cognitoUser['custom:account_type']
    )
    await this.bloomreachService.trackCustomer(externalId)

    let removedUser: User | null = null
    if (
      cognitoUser[CognitoUserAttributesEnum.ACCOUNT_TYPE] ===
      CognitoUserAccountTypesEnum.PHYSICAL_ENTITY
    ) {
      removedUser = await this.userDataSubservice.removeUserDataFromDatabase(externalId)
    } else if (
      cognitoUser[CognitoUserAttributesEnum.ACCOUNT_TYPE] ===
        CognitoUserAccountTypesEnum.LEGAL_ENTITY ||
      cognitoUser[CognitoUserAttributesEnum.ACCOUNT_TYPE] ===
        CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY
    ) {
      await this.userDataSubservice.removeLegalPersonDataFromDatabase(externalId)
    } else {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        UserErrorsEnum.COGNITO_TYPE_ERROR,
        UserErrorsResponseEnum.COGNITO_TYPE_ERROR
      )
    }

    const bloomreachRemoved = await this.bloomreachService.anonymizeCustomer(externalId)

    const taxDeliveryMethodsRemoved =
      removedUser && removedUser.birthNumber
        ? await this.taxSubservice.removeDeliveryMethodFromNoris(removedUser.birthNumber)
        : true

    return { success: true, bloomreachRemoved, taxDeliveryMethodsRemoved }
  }

  async markAccountsAsDeceased(birthNumberList: string[]): Promise<MarkDeceasedAccountResponseDto> {
    const users = await this.prisma.user.updateManyAndReturn({
      where: {
        birthNumber: {
          in: birthNumberList,
        },
        ...ACTIVE_USER_FILTER,
      },
      data: {
        isDeceased: true,
        markedDeceasedAt: new Date(),
      },
      select: {
        externalId: true,
        birthNumber: true,
        email: true,
      },
    })

    const foundResults: {
      birthNumber: string
      databaseMarked: boolean
      cognitoArchived: boolean
      bloomreachRemoved?: AnonymizeResponse
    }[] = await Promise.all(
      users.map(async (item) => {
        if (!item.externalId || !item.email) {
          return { birthNumber: item.birthNumber!, databaseMarked: true, cognitoArchived: false }
        }

        let cognitoSuccess = true
        try {
          await this.cognitoSubservice.cognitoDeactivateUser(item.externalId)
        } catch (error) {
          cognitoSuccess = false
        }

        const bloomreachRemoved = await this.bloomreachService.anonymizeCustomer(item.externalId)
        return {
          birthNumber: item.birthNumber!,
          databaseMarked: true,
          cognitoArchived: cognitoSuccess,
          bloomreachRemoved,
        }
      })
    )

    const foundBirthNumbers = users.map((user) => user.birthNumber!)

    const notFoundBirthNumbers = birthNumberList.filter(
      (birthNumber) => !foundBirthNumbers.includes(birthNumber)
    )

    const notFoundResults = notFoundBirthNumbers.map((birthNumber) => ({
      birthNumber,
      databaseMarked: false,
      cognitoArchived: false,
    }))

    return { results: [...foundResults, ...notFoundResults] }
  }

  async getNewVerifiedUsersBirthNumbers(
    since: Date,
    take?: number
  ): Promise<GetNewVerifiedUsersBirthNumbersResponseDto> {
    // Take one more, so that we can return nextSince for the next user
    // We can't do date+1, because two users can have the same timestamp
    // This should be sufficient, if we do not expect 100+ users with the same timestamp
    const limitedTake = Math.min(take ?? USER_REQUEST_LIMIT, USER_REQUEST_LIMIT) + 1
    const users = await this.prisma.user.findMany({
      select: {
        birthNumber: true,
        lastVerificationIdentityCard: true,
      },
      where: {
        lastVerificationIdentityCard: { gte: since },
        birthNumber: {
          not: null,
        },
        ...ACTIVE_USER_FILTER,
      },
      orderBy: {
        lastVerificationIdentityCard: 'asc',
      },
      take: limitedTake,
    })

    if (
      users.length === limitedTake &&
      limitedTake >= 2 &&
      users[0].lastVerificationIdentityCard?.getTime() ===
        users[users.length - 1].lastVerificationIdentityCard?.getTime()
    ) {
      // If this happens because of manual edit in the database, please add random jitter to the dates
      throw this.throwerErrorGuard.InternalServerErrorException(
        CustomErrorAdminTypesEnum.TOO_MANY_USERS_VERIFIED_WITH_THE_SAME_TIMESTAMP,
        CustomErrorAdminTypesResponseEnum.TOO_MANY_USERS_VERIFIED_WITH_THE_SAME_TIMESTAMP
      )
    }

    const lastVerify = users.at(-1)?.lastVerificationIdentityCard
    // Default: no users -> return request timestamp
    let nextSince: Date = since
    if (users.length > 0) {
      if (users.length < limitedTake) {
        // End of list for now, advance timestamp one millisecond
        nextSince = new Date(lastVerify!.getTime() + 1)
      } else {
        // Last entry is one over take. We want to return the timestamp of this
        // entry for the next call, but not the entry itself
        nextSince = lastVerify!
        users.pop()
      }
    }

    const birthNumbers = users.map((user) => user.birthNumber!)

    return { birthNumbers, nextSince }
  }
}

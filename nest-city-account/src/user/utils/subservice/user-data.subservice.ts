import { Injectable } from '@nestjs/common'
import {
  ConsentEnum,
  DeliveryMethodEnum,
  DeliveryMethodUserPreferenceEnum,
  LegalPerson,
  LoginClientEnum,
  Prisma,
  User,
} from '@prisma/client'

import { Consent } from '../../../bloomreach/bloomreach.types'
import { BloomreachOutboxService } from '../../../bloomreach/bloomreach-outbox.service'
import { DPBUserLoginStatistics } from '../../../dpb/dtos/user.dto'
import { ACTIVE_USER_FILTER, PrismaService } from '../../../prisma/prisma.service'
import { CognitoGetUserData } from '../../../utils/global-dtos/cognito.dto'
import { ErrorsEnum, ErrorsResponseEnum } from '../../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { prismaExclude } from '../../../utils/handlers/prisma.handlers'
import { LineLoggerSubservice } from '../../../utils/subservices/line-logger.subservice'
import { UserIdentitySubservice } from '../../../utils/subservices/user-identity.subservice'
import { DeliveryMethodActiveAndLockedDto } from '../../dtos/deliveryMethod.dto'
import { ResponseLegalPersonDataSimpleDto } from '../../dtos/gdpr.legalperson.dto'
import { UserOfficialCorrespondenceChannelEnum } from '../../dtos/gdpr.user.dto'
import { UserErrorsEnum, UserErrorsResponseEnum } from '../../user.error.enum'

@Injectable()
export class UserDataSubservice {
  private readonly logger: LineLoggerSubservice

  constructor(
    private prisma: PrismaService,
    private bloomreachOutboxService: BloomreachOutboxService,
    private throwerErrorGuard: ThrowerErrorGuard,
    private userIdentitySubservice: UserIdentitySubservice
  ) {
    this.logger = new LineLoggerSubservice(UserDataSubservice.name)
  }

  private cognitoDataToDatabaseData(cognitoData: CognitoGetUserData): {
    externalId: string
    email: string
    registeredAt: Date | null
  } {
    return {
      externalId: cognitoData.idUser,
      email: cognitoData.email,
      registeredAt: cognitoData.UserCreateDate ?? null,
    }
  }

  // ===========================================================================
  // 1. User lifecycle (create/upsert)
  // ===========================================================================
  /**
   * Create User from cognito data.
   *
   * @private
   */
  private async createUser(userData: CognitoGetUserData) {
    const user = await this.prisma.user.create({
      data: this.cognitoDataToDatabaseData(userData),
    })

    return this.postprocessUser(userData.sub, user, true)
  }

  /**
   * Get User from the database by externalId (⚠️ not email) if it exists or
   * create it if it can't be found.
   *
   * This method creates a call to Bloomreach only if the User did not exist and
   * was created. Otherwise, no Bloomreach calls are created.
   *
   * ⚠️ **Warning**: This is not the old getOrCreate method. That has been moved
   * to {@link upsertUser}
   */
  async getOrFallbackCreateUser(cognitoUserData: CognitoGetUserData) {
    const existingUser = await this.getUserByExternalId(cognitoUserData.idUser)
    if (existingUser) {
      return existingUser
    }

    this.logger.warn(
      `Requested user does not exist. Creating the user as a fallback option. externalId: ${cognitoUserData.idUser}`
    )

    return this.createUser(cognitoUserData)
  }

  /**
   * Updates if the User exists in our database. Creates if it does not exist.
   *
   * Calls Bloomreach track. In the case of new User, Bloomreach is called also
   * with new GDPR consents.
   *
   * @returns created or updated User from the database.
   *
   * @param {CognitoGetUserData} cognitoUserData - The cognito user data.
   * @param {boolean} isAdminCall - Whether the call is made by an admin to
   *   bypass the deceased user check.
   */
  async upsertUser(cognitoUserData: CognitoGetUserData, isAdminCall = false) {
    const userData = this.cognitoDataToDatabaseData(cognitoUserData)

    let user = await this.prisma.user.findUnique({
      where: { email: userData.email },
    })
    const foundByEmail = !!user
    if (!foundByEmail) {
      user = await this.getUserByExternalId(userData.externalId)
    }

    if (!user) {
      return this.createUser(cognitoUserData)
    }

    if (user.isDeceased) {
      if (isAdminCall) {
        return prismaExclude(user, ['ifo'])
      }

      throw this.throwerErrorGuard.ForbiddenException(
        UserErrorsEnum.USER_IS_DECEASED,
        UserErrorsResponseEnum.USER_IS_DECEASED
      )
    }

    // user found, update data
    if (!foundByEmail) {
      this.logger.log(
        `Email changed for user ${userData.externalId}. Old email: ${user.email}, new email: ${userData.email}.`
      )
    }

    user = await this.prisma.user.update({
      where: foundByEmail ? { email: userData.email } : { externalId: userData.externalId },
      data: userData,
    })
    return this.postprocessUser(userData.externalId, user)
  }

  private async postprocessUser(externalId: string, user: User, setDefaultConsents = false) {
    if (setDefaultConsents) {
      const consents: Consent[] = [
        { consentType: ConsentEnum.MARKETING, isGranted: true },
        { consentType: ConsentEnum.GENERAL, isGranted: true },
      ]
      await this.setUserConsents(user.id, user.externalId, consents)
    }

    await this.bloomreachOutboxService.trackCustomer(externalId)
    return prismaExclude(user, ['ifo'])
  }

  // ===========================================================================
  // 2. LegalPerson lifecycle (create/upsert)
  // ===========================================================================

  /**
   * Create LegalPerson from cognito data.
   *
   * @private
   */
  private async createLegalPerson(legalPersonData: CognitoGetUserData) {
    // legal person not found, create a new one
    const legalPerson = await this.prisma.legalPerson.create({
      data: this.cognitoDataToDatabaseData(legalPersonData),
    })

    return this.postprocessLegalPerson(legalPersonData.sub, legalPerson, true)
  }

  /**
   * Get LegalPerson from the database by externalId (⚠️ not email) if it exists
   * or create it if it can't be found.
   *
   * This method creates a call to Bloomreach only if the LegalPerson did not
   * exist and was created. Otherwise, no Bloomreach calls are created.
   *
   * ⚠️ **Warning**: This is not the old getOrCreate method. That has been moved
   * to {@link upsertLegalPerson}
   */
  async getOrFallbackCreateLegalPerson(cognitoLegalPersonData: CognitoGetUserData) {
    const existingLegalPerson = await this.getLegalPersonByExternalId(cognitoLegalPersonData.sub)
    if (existingLegalPerson) {
      return existingLegalPerson
    }

    this.logger.warn(
      `Requested legalPerson does not exist. Creating the legalPerson as a fallback option. externalId: ${cognitoLegalPersonData.idUser}`
    )

    return this.createLegalPerson(cognitoLegalPersonData)
  }

  /**
   * Updates if the LegalPerson exists in our database. Creates if it does not
   * exist.
   *
   * Calls Bloomreach track. In the case of new LegalPerson, Bloomreach is called
   * also with new GDPR consents.
   *
   * @returns created or updated LegalPerson from the database.
   */
  async upsertLegalPerson(
    cognitoLegalPersonData: CognitoGetUserData
  ): Promise<ResponseLegalPersonDataSimpleDto> {
    const legalPersonData = {
      externalId: cognitoLegalPersonData.idUser,
      email: cognitoLegalPersonData.email,
      registeredAt: cognitoLegalPersonData.UserCreateDate,
    }

    let legalPerson = await this.prisma.legalPerson.findUnique({
      where: { email: legalPersonData.email },
    })
    const foundByEmail = !!legalPerson
    if (!foundByEmail) {
      legalPerson = await this.getLegalPersonByExternalId(legalPersonData.externalId)
    }

    if (!legalPerson) {
      return await this.createLegalPerson(cognitoLegalPersonData)
    }

    // TODO: we are missing attribute for isDeceased,
    // if we are implementing it, let's add admin call,
    // same as in getOrCreateUser

    // LegalPerson found, update data
    if (!foundByEmail) {
      this.logger.log(
        `Email changed for legal person ${legalPersonData.externalId}. Old email: ${legalPerson.email}, new email: ${legalPersonData.email}.`
      )
    }

    legalPerson = await this.prisma.legalPerson.update({
      where: foundByEmail
        ? { email: legalPersonData.email }
        : { externalId: legalPersonData.externalId },
      data: legalPersonData,
    })
    return this.postprocessLegalPerson(legalPersonData.externalId, legalPerson)
  }

  private async postprocessLegalPerson(
    externalId: string,
    legalPerson: LegalPerson,
    setDefaultConsents = false
  ) {
    if (setDefaultConsents) {
      const consents = [
        { consentType: ConsentEnum.MARKETING, isGranted: true },
        { consentType: ConsentEnum.GENERAL, isGranted: true },
      ]
      await this.setLegalPersonConsents(legalPerson.id, legalPerson.externalId, consents)
    }

    await this.bloomreachOutboxService.trackCustomer(externalId)
    return legalPerson
  }

  // ===========================================================================
  // 3. Lookups (read by id / externalId)
  // ===========================================================================
  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
        ...ACTIVE_USER_FILTER,
      },
    })
    return user
  }

  async getUserByExternalId(externalId: string) {
    const user = await this.prisma.user.findUnique({
      where: { externalId, ...ACTIVE_USER_FILTER },
    })
    return user
  }

  async getLegalPersonById(id: string) {
    const legalPerson = await this.prisma.legalPerson.findUnique({ where: { id } })
    return legalPerson
  }

  async getLegalPersonByExternalId(externalId: string) {
    const legalPerson = await this.prisma.legalPerson.findUnique({
      where: { externalId },
    })
    return legalPerson
  }

  // ===========================================================================
  // 4. Login client tracking
  // ===========================================================================

  async recordUserLoginClient(loginClient: LoginClientEnum, userId: string) {
    await this.prisma.userLoginClient.upsert({
      where: {
        userId_loginClient: {
          userId,
          loginClient,
        },
      },
      update: {
        loginCount: {
          increment: 1,
        },
      },
      create: {
        userId,
        loginClient,
        loginCount: 1,
      },
    })
  }

  async recordLegalPersonLoginClient(loginClient: LoginClientEnum, legalPersonId: string) {
    await this.prisma.legalPersonLoginClient.upsert({
      where: {
        legalPersonId_loginClient: {
          legalPersonId,
          loginClient,
        },
      },
      update: {
        loginCount: {
          increment: 1,
        },
      },
      create: {
        legalPersonId,
        loginClient,
        loginCount: 1,
      },
    })
  }

  async getUserLoginClientList(client: LoginClientEnum): Promise<DPBUserLoginStatistics[]> {
    const userLoginList = await this.prisma.userLoginClient.findMany({
      where: { loginClient: client },
      select: {
        loginCount: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            externalId: true,
          },
        },
      },
    })

    return (
      userLoginList
        .map((userLoginClient) => {
          return {
            loginCount: userLoginClient.loginCount,
            firstLogin: userLoginClient.createdAt,
            latestLogin: userLoginClient.updatedAt,
            id: userLoginClient.user.externalId,
          }
        })
        // This is here just for type safety since our database does not have a constraint implemented for this scenario.
        // Real data should never be null here.
        .filter((userLoginListItem): userLoginListItem is DPBUserLoginStatistics => {
          return !!userLoginListItem.id
        })
    )
  }

  // ===========================================================================
  // 5. Consents
  // ===========================================================================

  async setUserConsents(userId: string, externalId: string, consents: Consent[]): Promise<void> {
    if (consents.length === 0) {
      return
    }
    await this.prisma.$transaction(async (tx) => {
      await Promise.all(
        consents.map(async (c) =>
          tx.userConsents.upsert({
            where: { userId_consentType: { userId, consentType: c.consentType } },
            update: { isGranted: c.isGranted },
            create: { userId, consentType: c.consentType, isGranted: c.isGranted },
          })
        )
      )
    })
    await this.bloomreachOutboxService.trackConsents(consents, externalId, userId, false)
  }

  async getUserConsents(userId: string): Promise<Consent[]> {
    return this.prisma.userConsents.findMany({
      where: { userId },
      select: { consentType: true, isGranted: true },
    })
  }

  async setLegalPersonConsents(
    legalPersonId: string,
    externalId: string,
    consents: Consent[]
  ): Promise<void> {
    if (consents.length === 0) {
      return
    }
    await this.prisma.$transaction(async (tx) => {
      await Promise.all(
        consents.map(async (c) =>
          tx.legalPersonConsents.upsert({
            where: {
              legalPersonId_consentType: { legalPersonId, consentType: c.consentType },
            },
            update: { isGranted: c.isGranted },
            create: { legalPersonId, consentType: c.consentType, isGranted: c.isGranted },
          })
        )
      )
    })
    await this.bloomreachOutboxService.trackConsents(consents, externalId, legalPersonId, true)
  }

  async getLegalPersonConsents(legalPersonId: string): Promise<Consent[]> {
    return this.prisma.legalPersonConsents.findMany({
      where: { legalPersonId },
      select: { consentType: true, isGranted: true },
    })
  }
  // ===========================================================================
  // 6. Delivery method
  // ===========================================================================

  async setDeliveryMethodPreference(
    sub: string,
    deliveryMethodPreference: DeliveryMethodUserPreferenceEnum
  ) {
    await this.prisma.user.update({
      where: { externalId: sub },
      data: { taxDeliveryMethod: deliveryMethodPreference },
    })

    await this.bloomreachOutboxService.trackCustomer(sub)
  }

  async getActiveDeliveryMethod(
    userId: string
  ): Promise<UserOfficialCorrespondenceChannelEnum | null> {
    return this.userIdentitySubservice.getActiveDeliveryMethod({ id: userId })
  }

  async getActiveAndLockedDeliveryMethodsWithDates(
    where: Prisma.UserWhereUniqueInput
  ): Promise<DeliveryMethodActiveAndLockedDto> {
    const user = await this.prisma.user.findUnique({
      where,
      include: {
        physicalEntity: {
          select: {
            activeEdesk: true,
          },
        },
        deliveryMethodUserHistory: {
          where: { method: DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true },
        },
      },
    })
    if (!user) {
      throw this.throwerErrorGuard.NotFoundException(
        ErrorsEnum.NOT_FOUND_ERROR,
        ErrorsResponseEnum.NOT_FOUND_ERROR
      )
    }

    const active = user.physicalEntity?.activeEdesk
      ? { deliveryMethod: DeliveryMethodEnum.EDESK }
      : user.taxDeliveryMethod
        ? {
            deliveryMethod: user.taxDeliveryMethod,
            date: user.deliveryMethodUserHistory[0]?.createdAt ?? undefined,
          }
        : undefined

    const locked = user.taxDeliveryMethodAtLockDate
      ? {
          deliveryMethod: user.taxDeliveryMethodAtLockDate,
          date: user.taxDeliveryMethodCityAccountLockDate ?? undefined,
        }
      : undefined

    return { active, locked }
  }

  async getShowEmailCommunicationBanner(
    userId: string,
    isIdentityVerified: boolean
  ): Promise<boolean> {
    if (!isIdentityVerified) {
      return false
    }
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        taxDeliveryMethod: true,
      },
    })
    const hasEdesk = await this.prisma.physicalEntity.findUnique({
      where: {
        userId,
      },
    })
    return !(user?.taxDeliveryMethod || hasEdesk?.activeEdesk)
  }

  // ===========================================================================
  // 8. Data removal / anonymization
  // ===========================================================================
  async removeUserBirthNumber(externalId: string) {
    const user = await this.prisma.user.update({
      where: {
        externalId,
      },
      data: {
        birthNumber: null,
        ifo: null,
      },
    })
    return user
  }

  async removeLegalPersonBirthNumber(externalId: string) {
    const user = await this.prisma.legalPerson.update({
      where: {
        externalId,
      },
      data: {
        birthNumber: null,
        ico: null,
      },
    })
    return user
  }

  private async removePhysicalEntityUserIdRelation(userId: string): Promise<void> {
    const physicalEntity = await this.prisma.physicalEntity.findUnique({
      where: {
        userId,
      },
    })
    if (physicalEntity) {
      await this.prisma.physicalEntity.update({
        where: {
          userId,
        },
        data: {
          userId: null,
        },
      })
    }
  }

  async removeUserDataFromDatabase(externalId: string): Promise<User | null> {
    const user = await this.getUserByExternalId(externalId)
    if (user) {
      await this.prisma.user.update({
        where: {
          externalId,
        },
        data: {
          email: null,
          birthNumber: null,
          ifo: null,
          birthnumberAlreadyExistsCounter: 0,
          birthnumberAlreadyExistsLast: null,
          userIdCardVerify: {
            deleteMany: {
              userId: user.id,
            },
          },
        },
      })

      await this.removePhysicalEntityUserIdRelation(user.id)
    }

    return user
  }

  async removeLegalPersonDataFromDatabase(externalId: string): Promise<void> {
    const legalPerson = await this.getLegalPersonByExternalId(externalId)

    if (legalPerson) {
      await this.prisma.legalPerson.update({
        where: {
          externalId,
        },
        data: {
          email: null,
          birthNumber: null,
          ico: null,
          birthnumberIcoAlreadyExistsCounter: 0,
          birthnumberIcoAlreadyExistsLast: null,
          legalPersonIcoIdCardVerify: {
            deleteMany: {
              legalPersonId: legalPerson.id,
            },
          },
        },
      })
    }
  }
}

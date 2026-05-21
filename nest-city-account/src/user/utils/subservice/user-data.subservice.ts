import { Injectable } from '@nestjs/common'
import {
  ConsentEnum,
  DeliveryMethodEnum,
  DeliveryMethodUserPreferenceEnum,
  GDPRCategoryEnum,
  GDPRSubTypeEnum,
  GDPRTypeEnum,
  LegalPerson,
  LoginClientEnum,
  Prisma,
  User,
} from '@prisma/client'

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
import {
  ResponseGdprUserDataDto,
  UserOfficialCorrespondenceChannelEnum,
} from '../../dtos/gdpr.user.dto'
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

  /**
   * Create User from cognito data.
   *
   * @private
   */
  private async createUser(userData: CognitoGetUserData) {
    const user = await this.prisma.legalPerson.create({
      data: this.cognitoDataToDatabaseData(userData),
    })

    return this.postprocessLegalPerson(userData.sub, user, true)
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
  async getOrCreateUser(cognitoUserData: CognitoGetUserData) {
    const existingUser = await this.getUserByExternalId(cognitoUserData.idUser)
    if (existingUser) {
      return existingUser
    }

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
      const consents = [
        { consentType: ConsentEnum.MARKETING, isGranted: true },
        { consentType: ConsentEnum.GENERAL, isGranted: true },
      ]
      await this.setUserConsents(user.id, user.externalId, consents)
    }

    await this.bloomreachOutboxService.trackCustomer(externalId)
    return prismaExclude(user, ['ifo'])
  }

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
  async getOrCreateLegalPerson(cognitoLegalPersonData: CognitoGetUserData) {
    const existingLegalPerson = await this.getLegalPersonByExternalId(cognitoLegalPersonData.sub)
    if (existingLegalPerson) {
      return existingLegalPerson
    }

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

  async removeBirthNumber(externalId: string) {
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

  async setUserConsents(
    userId: string,
    externalId: string,
    consents: { consentType: ConsentEnum; isGranted: boolean }[]
  ): Promise<void> {
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
    await this.bloomreachOutboxService.trackEventConsents(
      consents.map((c) => this.consentToGdprShape(c)),
      externalId,
      userId,
      false
    )
  }

  async setLegalPersonConsents(
    legalPersonId: string,
    externalId: string,
    consents: { consentType: ConsentEnum; isGranted: boolean }[]
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
    await this.bloomreachOutboxService.trackEventConsents(
      consents.map((c) => this.consentToGdprShape(c)),
      externalId,
      legalPersonId,
      true
    )
  }

  async getUserConsents(
    userId: string
  ): Promise<{ consentType: ConsentEnum; isGranted: boolean }[]> {
    return this.prisma.userConsents.findMany({
      where: { userId },
      select: { consentType: true, isGranted: true },
    })
  }

  async getLegalPersonConsents(
    legalPersonId: string
  ): Promise<{ consentType: ConsentEnum; isGranted: boolean }[]> {
    return this.prisma.legalPersonConsents.findMany({
      where: { legalPersonId },
      select: { consentType: true, isGranted: true },
    })
  }

  // ===========================================================================
  // TEMPORARY shape translators between consents (new) and GDPR data (old).
  // ---------------------------------------------------------------------------
  // These exist only to bridge the legacy GDPR format to the consent model
  // while external consumers migrate. **Do not call from new code.**
  // Once Bloomreach accepts the consent shape and the frontend stops reading
  // the deprecated `gdprData` response field, both functions and their callers
  // must be deleted.
  // ===========================================================================

  /**
   * Translate consent shape into the legacy GDPR triple.
   *
   * Used at output boundaries only:
   *  - Bloomreach payload (its builder is keyed by category/type/subType).
   *  - The deprecated `gdprData` field on response DTOs, alongside the new
   *    `consents` field as a transitional dual-write.
   *
   * @deprecated Temporary - do not use in new code. Slated for deletion
   * together with the deprecated `gdprData` response field once external
   * consumers migrate to the new Consent shape.
   */
  consentToGdprShape(c: { consentType: ConsentEnum; isGranted: boolean }): ResponseGdprUserDataDto {
    return {
      category: GDPRCategoryEnum.ESBS,
      type: c.consentType as GDPRTypeEnum,
      subType: c.isGranted ? GDPRSubTypeEnum.subscribe : GDPRSubTypeEnum.unsubscribe,
    }
  }

  /**
   * Translate the legacy GDPR triple into consent shape.
   *
   * Used at input boundaries only - the legacy subscribe/unsubscribe endpoints
   * peel consent items out of incoming GDPR-shaped requests. Returns `null`
   * for items that don't belong on the consents path.
   *
   * @deprecated Temporary - do not use in new code. Slated for deletion
   * together with the legacy GDPR-shaped input endpoints.
   */
  private gdprShapeToConsent(g: {
    category: GDPRCategoryEnum
    type: GDPRTypeEnum
    subType?: GDPRSubTypeEnum | null
  }): { consentType: ConsentEnum; isGranted: boolean } | null {
    if (g.category !== GDPRCategoryEnum.ESBS) {
      return null
    }
    if (g.type !== GDPRTypeEnum.MARKETING && g.type !== GDPRTypeEnum.GENERAL) {
      return null
    }
    if (g.subType == null) {
      return null
    }
    return {
      consentType: g.type as ConsentEnum,
      isGranted: g.subType === GDPRSubTypeEnum.subscribe,
    }
  }

  async getOfficialCorrespondenceChannel(
    userId: string
  ): Promise<UserOfficialCorrespondenceChannelEnum | null> {
    return this.userIdentitySubservice.getOfficialCorrespondenceChannel({ id: userId })
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

  private isTaxDeliveryData(elem: ResponseGdprUserDataDto): boolean {
    return (
      elem.category === GDPRCategoryEnum.TAXES && elem.type === GDPRTypeEnum.FORMAL_COMMUNICATION
    )
  }

  /**
   * @deprecated: only used by legacy GDPR endpoints
   */
  private separateTaxDeliveryData(gdprData: ResponseGdprUserDataDto[]) {
    const taxDeliveryData: DeliveryMethodUserPreferenceEnum[] = []
    const otherGdprData: ResponseGdprUserDataDto[] = []

    gdprData.forEach((elem) => {
      if (this.isTaxDeliveryData(elem)) {
        if (elem.subType === GDPRSubTypeEnum.subscribe) {
          taxDeliveryData.push(DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT)
        } else {
          taxDeliveryData.push(DeliveryMethodUserPreferenceEnum.POSTAL)
        }
      } else {
        otherGdprData.push(elem)
      }
    })

    return { taxDeliveryData, otherGdprData }
  }

  /**
   * Apply legacy-shaped GDPR input to a user: routes tax-delivery items to
   * `User.taxDeliveryMethod`, consent items to `UserConsents`, and drops the
   * rest (`UserGdprData` is no longer written to).
   *
   * @deprecated Exists only to serve the deprecated subscribe / unsubscribe
   * input boundary. Do not call from new code; new code should call
   * `setUserConsents` (and the relevant delivery-method setter) directly with
   * the new consent shape. Slated for deletion together with the legacy
   * subscribe/unsubscribe endpoints.
   */
  async changeUserGdprData(userId: string, gdprData: ResponseGdprUserDataDto[]) {
    const user = await this.getUserById(userId)
    if (!user) {
      throw this.throwerErrorGuard.NotFoundException(
        UserErrorsEnum.USER_NOT_FOUND,
        UserErrorsResponseEnum.USER_NOT_FOUND
      )
    }

    const { taxDeliveryData, otherGdprData } = this.separateTaxDeliveryData(gdprData)
    if (taxDeliveryData.length > 1) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
        'Delivery method set more than once at the same time'
      )
    }

    const consentData: { consentType: ConsentEnum; isGranted: boolean }[] = []
    for (const elem of otherGdprData) {
      const consent = this.gdprShapeToConsent(elem)
      if (consent) {
        consentData.push(consent)
      } else {
        this.logger.error(
          this.throwerErrorGuard.InternalServerErrorException(
            ErrorsEnum.INTERNAL_SERVER_ERROR,
            'Invalid consents error',
            `Deprecated GDPR data shape encountered: ${JSON.stringify(elem)}`
          )
        )
      }
    }

    if (taxDeliveryData.length > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          taxDeliveryMethod: taxDeliveryData[0],
        },
      })
    }

    await this.setUserConsents(userId, user.externalId, consentData)
  }

  /**
   * Apply legacy-shaped GDPR input to a legal person: routes consent items to
   * `LegalPersonConsents` and drops anything else.
   *
   * @deprecated Exists only to serve the deprecated subscribe / unsubscribe
   * input boundary. Do not call from new code; new code should call
   * `setLegalPersonConsents` directly with the new consent shape. Slated for
   * deletion together with the legacy subscribe/unsubscribe endpoints.
   */
  async changeLegalPersonGdprData(legalPersonId: string, gdprData: ResponseGdprUserDataDto[]) {
    const legalPerson = await this.getLegalPersonById(legalPersonId)
    if (!legalPerson) {
      throw this.throwerErrorGuard.NotFoundException(
        UserErrorsEnum.USER_NOT_FOUND,
        UserErrorsResponseEnum.USER_NOT_FOUND
      )
    }

    const consentData: { consentType: ConsentEnum; isGranted: boolean }[] = []
    for (const elem of gdprData) {
      const consent = this.gdprShapeToConsent(elem)
      if (consent) {
        consentData.push(consent)
      }
    }

    await this.setLegalPersonConsents(legalPersonId, legalPerson.externalId, consentData)
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

  async setDeliveryMethodPreference(
    sub: string,
    deliveryMethodPreference: DeliveryMethodUserPreferenceEnum
  ) {
    await this.prisma.user.update({
      where: { externalId: sub },
      data: { taxDeliveryMethod: deliveryMethodPreference },
    })

    await this.bloomreachOutboxService.trackEventConsents(
      [
        {
          category: GDPRCategoryEnum.TAXES,
          type: GDPRTypeEnum.FORMAL_COMMUNICATION,
          subType:
            deliveryMethodPreference === DeliveryMethodUserPreferenceEnum.CITY_ACCOUNT
              ? GDPRSubTypeEnum.subscribe
              : GDPRSubTypeEnum.unsubscribe,
        },
      ],
      sub,
      undefined,
      false
    )
  }
}

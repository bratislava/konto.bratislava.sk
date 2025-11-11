import { Injectable } from '@nestjs/common'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'

import { ACTIVE_USER_FILTER, PrismaService } from '../../../prisma/prisma.service'
import { prismaExclude } from '../../../utils/handlers/prisma.handlers'
import {
  ResponseGdprLegalPersonDataDto,
  ResponseLegalPersonDataSimpleDto,
} from '../../dtos/gdpr.legalperson.dto'
import {
  ResponseGdprUserDataDto,
  UserOfficialCorrespondenceChannelEnum,
} from '../../dtos/gdpr.user.dto'
import { LineLoggerSubservice } from '../../../utils/subservices/line-logger.subservice'
import { BloomreachService } from '../../../bloomreach/bloomreach.service'
import { UserErrorsEnum, UserErrorsResponseEnum } from '../../user.error.enum'
import { GDPRCategoryEnum, GDPRSubTypeEnum, GDPRTypeEnum, LegalPerson, User } from '@prisma/client'
import { ErrorsEnum, ErrorsResponseEnum } from '../../../utils/guards/dtos/error.dto'
import { DeliveryMethodActiveAndLockedDto } from '../../dtos/deliveryMethod.dto'
import { DeliveryMethodEnum, DeliveryMethodUserEnum, Prisma } from '@prisma/client'
import { CognitoGetUserData } from '../../../utils/global-dtos/cognito.dto'

@Injectable()
export class DatabaseSubserviceUser {
  private readonly logger: LineLoggerSubservice

  constructor(
    private prisma: PrismaService,
    private bloomreachService: BloomreachService,
    private throwerErrorGuard: ThrowerErrorGuard
  ) {
    this.logger = new LineLoggerSubservice(DatabaseSubserviceUser.name)
  }

  /**
   * Gets or creates a user from database using cognito user data.
   * @param {CognitoGetUserData} cognitoUserData - The cognito user data.
   * @param {boolean} isAdminCall - Whether the call is made by an admin to bypass the deceased user check.
   */
  async getOrCreateUser(cognitoUserData: CognitoGetUserData, isAdminCall: boolean = false) {
    const userData = {
      externalId: cognitoUserData.idUser,
      email: cognitoUserData.email,
      registeredAt: cognitoUserData.UserCreateDate,
    }

    let userWhere: Prisma.UserWhereUniqueInput = { email: userData.email }

    let user = await this.prisma.user.findUnique({
      where: userWhere,
    })
    if (!user) {
      userWhere = { externalId: userData.externalId }
      user = await this.prisma.user.findUnique({
        where: userWhere,
      })
    }

    if (!user) {
      // user not found, create new one
      user = await this.prisma.user.create({
        data: userData,
      })

      return this.postprocessUser(userData.externalId, user, true)
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

    if (user.email !== userData.email) {
      this.logger.log(
        `Email changed for user ${userData.externalId}. Old email: ${user.email}, new email: ${userData.email}.`
      )
    }

    user = await this.prisma.user.update({
      where: userWhere,
      data: userData,
    })
    return this.postprocessUser(userData.externalId, user)
  }

  async postprocessUser(externalId: string, user: User, changeGdprData: boolean = false) {
    if (changeGdprData) {
      await this.changeUserGdprData(user.id, [
        {
          type: GDPRTypeEnum.MARKETING,
          category: GDPRCategoryEnum.ESBS,
          subType: GDPRSubTypeEnum.subscribe,
        },
      ])
    }

    await this.bloomreachService.trackCustomer(externalId)
    return prismaExclude(user, ['ifo'])
  }

  async getOrCreateLegalPerson(
    cognitoUserData: CognitoGetUserData
  ): Promise<ResponseLegalPersonDataSimpleDto> {
    const legalPersonData = {
      externalId: cognitoUserData.idUser,
      email: cognitoUserData.email,
      registeredAt: cognitoUserData.UserCreateDate,
    }

    let legalPersonWhere: Prisma.LegalPersonWhereUniqueInput = { email: legalPersonData.email }

    let legalPerson = await this.prisma.legalPerson.findUnique({
      where: legalPersonWhere,
    })
    if (!legalPerson) {
      legalPersonWhere = { externalId: legalPersonData.externalId }
      legalPerson = await this.prisma.legalPerson.findUnique({
        where: legalPersonWhere,
      })
    }

    if (!legalPerson) {
      // legal person not found, create new one
      legalPerson = await this.prisma.legalPerson.create({
        data: legalPersonData,
      })

      return this.postprocessLegalPerson(legalPersonData.externalId, legalPerson, true)
    }

    // TODO: we are missing attribute for isDeceased,
    // if we are implemeting it, let's add admin call,
    // same as in getOrCreateUser

    // user found, update data

    if (legalPerson.email !== legalPersonData.email) {
      this.logger.log(
        `Email changed for legal person ${legalPersonData.externalId}. Old email: ${legalPerson.email}, new email: ${legalPersonData.email}.`
      )
    }

    legalPerson = await this.prisma.legalPerson.update({
      where: legalPersonWhere,
      data: legalPersonData,
    })
    return this.postprocessLegalPerson(legalPersonData.externalId, legalPerson)
  }

  async postprocessLegalPerson(
    externalId: string,
    legalPerson: LegalPerson,
    changeGdprData: boolean = false
  ) {
    if (changeGdprData) {
      await this.changeLegalPersonGdprData(legalPerson.id, [
        {
          type: GDPRTypeEnum.MARKETING,
          category: GDPRCategoryEnum.ESBS,
          subType: GDPRSubTypeEnum.subscribe,
        },
      ])
    }

    await this.bloomreachService.trackCustomer(externalId)
    return legalPerson
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

  async removeBirthNumber(externalId: string) {
    const user = await this.prisma.user.update({
      where: {
        externalId: externalId,
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
        externalId: externalId,
      },
      data: {
        birthNumber: null,
        ico: null,
      },
    })
    return user
  }

  // is this ok?
  async getUserGdprData(userId: string): Promise<ResponseGdprUserDataDto[]> {
    const data: ResponseGdprUserDataDto[] = await this.prisma.$queryRawUnsafe(`
        SELECT DISTINCT ON(category, "type")
          category,
          "type",
          "subType"
        FROM(
          SELECT 
            category,
            "type",
            "subType",
            "createdAt"
          FROM
            public."UserGdprData"
          WHERE
            "userId" = '${userId}'
        ) as main
        ORDER BY
          category asc,
          "type" asc,
          "createdAt" desc`)
    return data
  }

  // is this ok?
  async getLegalPersonGdprData(legalPersonId: string): Promise<ResponseGdprLegalPersonDataDto[]> {
    const data: ResponseGdprLegalPersonDataDto[] = await this.prisma.$queryRawUnsafe(`
        SELECT DISTINCT ON(category, "type")
          category,
          "type",
          "subType"
        FROM(
          SELECT 
            category,
            "type",
            "subType",
            "createdAt"
          FROM
            public."LegalPersonGdprData"
          WHERE
            "legalPersonId" = '${legalPersonId}'
        ) as main
        ORDER BY
          category asc,
          "type" asc,
          "createdAt" desc`)
    return data
  }

  async getOfficialCorrespondenceChannel(
    userId: string
  ): Promise<UserOfficialCorrespondenceChannelEnum | null> {
    const delivery = await this.getActiveAndLockedDeliveryMethodsWithDates({ id: userId })
    const active = delivery.active?.deliveryMethod
    switch (active) {
      case DeliveryMethodEnum.EDESK:
        return UserOfficialCorrespondenceChannelEnum.EDESK
      case DeliveryMethodEnum.CITY_ACCOUNT:
        return UserOfficialCorrespondenceChannelEnum.EMAIL
      case DeliveryMethodEnum.POSTAL:
        return UserOfficialCorrespondenceChannelEnum.POSTAL
      default:
        return null
    }
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
            date: user.taxDeliveryMethodCityAccountDate ?? undefined,
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

  private separateTaxDeliveryData(gdprData: ResponseGdprUserDataDto[]) {
    const taxDeliveryData: DeliveryMethodUserEnum[] = []
    const otherGdprData: ResponseGdprUserDataDto[] = []

    gdprData.forEach((elem) => {
      if (this.isTaxDeliveryData(elem)) {
        if (elem.subType === GDPRSubTypeEnum.subscribe) {
          taxDeliveryData.push(DeliveryMethodUserEnum.CITY_ACCOUNT)
        } else {
          taxDeliveryData.push(DeliveryMethodUserEnum.POSTAL)
        }
      } else {
        otherGdprData.push(elem)
      }
    })

    return { taxDeliveryData, otherGdprData }
  }

  async changeUserGdprData(userId: string, gdprData: ResponseGdprUserDataDto[]) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })
    if (!user) {
      throw this.throwerErrorGuard.NotFoundException(
        UserErrorsEnum.USER_NOT_FOUND,
        UserErrorsResponseEnum.USER_NOT_FOUND
      )
    }

    // TODO we want to separate this into an endpoint
    const { taxDeliveryData } = this.separateTaxDeliveryData(gdprData)
    if (taxDeliveryData.length > 1) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
        'Delivery method set more than once at the same time'
      )
    }

    if (taxDeliveryData.length > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          taxDeliveryMethod: taxDeliveryData[0],
          ...(taxDeliveryData[0] === DeliveryMethodUserEnum.CITY_ACCOUNT && {
            taxDeliveryMethodCityAccountDate: new Date(),
          }),
        },
      })
    }

    await this.prisma.userGdprData.createMany({
      data: gdprData.map((elem) => ({
        type: elem.type,
        category: elem.category,
        subType: elem.subType,
        userId: user.id,
      })),
    })

    await this.bloomreachService.trackEventConsents(gdprData, user.externalId, user.id, false)
  }

  async changeLegalPersonGdprData(legalPersonId: string, gdprData: ResponseGdprUserDataDto[]) {
    const legalPerson = await this.prisma.legalPerson.findUnique({
      where: { id: legalPersonId },
    })
    if (!legalPerson) {
      throw this.throwerErrorGuard.NotFoundException(
        UserErrorsEnum.USER_NOT_FOUND,
        UserErrorsResponseEnum.USER_NOT_FOUND
      )
    }
    await this.prisma.legalPersonGdprData.createMany({
      data: gdprData.map((elem) => ({
        type: elem.type,
        category: elem.category,
        subType: elem.subType,
        legalPersonId: legalPerson.id,
      })),
    })

    await this.bloomreachService.trackEventConsents(
      gdprData,
      legalPerson.externalId,
      legalPerson.id,
      true
    )
  }
}

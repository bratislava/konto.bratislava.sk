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
import { GDPRCategoryEnum, GDPRSubTypeEnum, GDPRTypeEnum } from '@prisma/client'
import { ErrorsEnum, ErrorsResponseEnum } from '../../../utils/guards/dtos/error.dto'
import { DeliveryMethodActiveAndLockedDto } from '../../dtos/deliveryMethod.dto'
import { DeliveryMethodEnum, DeliveryMethodUserEnum, Prisma } from '@prisma/client'

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

  async getOrCreateUser(externalId: string | null, email: string) {
    let user = await this.prisma.user.findUnique({
      where: { email: email },
    })
    if (user?.isDeceased) {
      throw this.throwerErrorGuard.ForbiddenException(
        UserErrorsEnum.USER_IS_DECEASED,
        UserErrorsResponseEnum.USER_IS_DECEASED
      )
    }
    if (user && externalId) {
      user = await this.prisma.user.update({
        where: {
          email: email,
          ...ACTIVE_USER_FILTER,
        },
        data: {
          externalId: externalId,
        },
      })
      await this.bloomreachService.trackCustomer(externalId)
    } else if (!user && externalId) {
      user = await this.prisma.user.findUnique({
        where: { externalId: externalId },
      })
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            externalId: externalId,
            email: email,
          },
        })
        await this.bloomreachService.trackCustomer(externalId)
        await this.changeUserGdprData(user.id, [
          {
            type: GDPRTypeEnum.MARKETING,
            category: GDPRCategoryEnum.ESBS,
            subType: GDPRSubTypeEnum.subscribe,
          },
        ])
      } else if (user.email != email) {
        const oldEmail = user.email
        user = await this.prisma.user.update({
          where: { externalId },
          data: { email },
        })
        await this.bloomreachService.trackCustomer(externalId)
        this.logger.log(
          `Email changed for user ${externalId}. Old email: ${oldEmail}, new email: ${email}.`
        )
      }
    } else {
      user = await this.prisma.user.upsert({
        where: {
          email: email,
        },
        update: {
          externalId: externalId,
          email: email,
        },
        create: {
          externalId: externalId,
          email: email,
        },
      })
      if (externalId) {
        await this.bloomreachService.trackCustomer(externalId)
      }
    }

    return prismaExclude(user, ['ifo'])
  }

  async getOrCreateLegalPerson(
    externalId: string | null,
    email: string
  ): Promise<ResponseLegalPersonDataSimpleDto> {
    let legalPerson = await this.prisma.legalPerson.findUnique({
      where: { email: email },
    })
    if (legalPerson && externalId) {
      legalPerson = await this.prisma.legalPerson.update({
        where: {
          email: email,
        },
        data: {
          externalId: externalId,
        },
      })
      await this.bloomreachService.trackCustomer(externalId)
    } else if (!legalPerson && externalId) {
      legalPerson = await this.prisma.legalPerson.findUnique({
        where: { externalId: externalId },
      })
      if (!legalPerson) {
        legalPerson = await this.prisma.legalPerson.create({
          data: {
            externalId: externalId,
            email: email,
          },
        })
        await this.bloomreachService.trackCustomer(externalId)
        await this.changeLegalPersonGdprData(legalPerson.id, [
          {
            type: GDPRTypeEnum.MARKETING,
            category: GDPRCategoryEnum.ESBS,
            subType: GDPRSubTypeEnum.subscribe,
          },
        ])
      } else if (legalPerson.email != email) {
        const oldEmail = legalPerson.email
        legalPerson = await this.prisma.legalPerson.update({
          where: { externalId },
          data: { email },
        })
        await this.bloomreachService.trackCustomer(externalId)
        this.logger.log(
          `Email changed for legal person ${externalId}. Old email: ${oldEmail}, new email: ${email}.`
        )
      }
    } else {
      legalPerson = await this.prisma.legalPerson.upsert({
        where: {
          email: email,
        },
        update: {
          externalId: externalId,
          email: email,
        },
        create: {
          externalId: externalId,
          email: email,
        },
      })
      if (externalId) {
        await this.bloomreachService.trackCustomer(externalId)
      }
    }
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

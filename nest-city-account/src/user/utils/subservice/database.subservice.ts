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
        await this.changeUserGdprData(user.id, [
          {
            type: GDPRTypeEnum.LICENSE,
            category: GDPRCategoryEnum.ESBS,
            subType: GDPRSubTypeEnum.subscribe,
          },
          {
            type: GDPRTypeEnum.MARKETING,
            category: GDPRCategoryEnum.ESBS,
            subType: GDPRSubTypeEnum.subscribe,
          },
        ])
        await this.bloomreachService.trackCustomer(externalId)
      } else if (user.email != email) {
        const oldEmail = user.email
        user = await this.prisma.user.update({
          where: { externalId },
          data: { email },
        })
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
      await this.changeUserGdprData(user.id, [
        {
          type: GDPRTypeEnum.LICENSE,
          category: GDPRCategoryEnum.ESBS,
          subType: GDPRSubTypeEnum.subscribe,
        },
      ])
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
        await this.changeLegalPersonGdprData(legalPerson.id, [
          {
            type: GDPRTypeEnum.LICENSE,
            category: GDPRCategoryEnum.ESBS,
            subType: GDPRSubTypeEnum.subscribe,
          },
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
      await this.changeLegalPersonGdprData(legalPerson.id, [
        {
          type: GdprType.LICENSE,
          category: GdprCategory.ESBS,
          subType: GdprSubType.SUB,
        },
      ])
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
  ): Promise<UserOfficialCorrespondenceChannelEnum> {
    const hasEdesk = await this.prisma.physicalEntity.findUnique({
      where: {
        userId,
      },
    })
    if (hasEdesk?.activeEdesk) {
      return UserOfficialCorrespondenceChannelEnum.EDESK
    }
    const lastSub = await this.prisma.userGdprData.findFirst({
      where: {
        userId,
        category: GdprCategory.TAXES,
        type: GdprType.FORMAL_COMMUNICATION,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    if (lastSub?.subType === GdprSubType.SUB) {
      return UserOfficialCorrespondenceChannelEnum.EMAIL
    }
    return UserOfficialCorrespondenceChannelEnum.POSTAL
  }

  async getShowEmailCommunicationBanner(userId: string): Promise<boolean> {
    const formalCommunicationSubscription = await this.prisma.userGdprData.findFirst({
      where: {
        userId,
        type: GdprType.FORMAL_COMMUNICATION,
        category: GdprCategory.TAXES,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    const hasEdesk = await this.prisma.physicalEntity.findUnique({
      where: {
        userId,
      },
    })
    if (formalCommunicationSubscription || hasEdesk?.activeEdesk) {
      return false
    }
    return true
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

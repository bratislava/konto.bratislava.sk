import { Injectable } from '@nestjs/common'

import { PrismaService } from '../../../prisma/prisma.service'
import { prismaExclude } from '../../../utils/handlers/prisma.handlers'
import {
  ResponseGdprLegalPersonDataDto,
  ResponseLegalPersonDataSimpleDto,
} from '../../dtos/gdpr.legalperson.dto'
import {
  GdprCategory,
  GdprDataDto,
  GdprSubType,
  GdprType,
  ResponseGdprUserDataDto,
  UserOfficialCorrespondenceChannelEnum,
} from '../../dtos/gdpr.user.dto'
import { LineLoggerSubservice } from '../../../utils/subservices/line-logger.subservice'
import { ErrorsEnum, ErrorsResponseEnum } from '../../../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../../../utils/guards/errors.guard'
import { DeliveryMethodActiveAndLockedDto } from '../../dtos/deliveryMethod.dto'
import { DeliveryMethodEnum, PhysicalEntity, Prisma, User, UserGdprData } from '@prisma/client'
import {
  SubserviceErrorsEnum,
  SubserviceErrorsResponseEnum,
} from '../../../utils/subservices/subservice.errors.enum'

type UserWithDeliveryData = User & {
  physicalEntity: Pick<PhysicalEntity, 'activeEdesk'> | null
} & {
  userGdprData: Pick<UserGdprData, 'subType' | 'createdAt'>[] | null
}

@Injectable()
export class DatabaseSubserviceUser {
  private readonly logger: LineLoggerSubservice

  constructor(
    private prisma: PrismaService,
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
        await this.prisma.userGdprData.createMany({
          data: [
            {
              type: GdprType.LICENSE,
              category: GdprCategory.ESBS,
              subType: GdprSubType.SUB,
              userId: user.id,
            },
            {
              type: GdprType.MARKETING,
              category: GdprCategory.ESBS,
              subType: GdprSubType.SUB,
              userId: user.id,
            },
          ],
        })
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
      await this.prisma.userGdprData.create({
        data: {
          type: GdprType.LICENSE,
          category: GdprCategory.ESBS,
          subType: GdprSubType.SUB,
          userId: user.id,
        },
      })
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
        await this.prisma.legalPersonGdprData.createMany({
          data: [
            {
              type: GdprType.LICENSE,
              category: GdprCategory.ESBS,
              subType: GdprSubType.SUB,
              legalPersonId: legalPerson.id,
            },
            {
              type: GdprType.MARKETING,
              category: GdprCategory.ESBS,
              subType: GdprSubType.SUB,
              legalPersonId: legalPerson.id,
            },
          ],
        })
        await this.createLegalPersonGdprData(legalPerson.id, null)
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
      await this.prisma.legalPersonGdprData.create({
        data: {
          type: GdprType.LICENSE,
          category: GdprCategory.ESBS,
          subType: GdprSubType.SUB,
          legalPersonId: legalPerson.id,
        },
      })
      await this.createLegalPersonGdprData(legalPerson.id, null)
    }
    return legalPerson
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id: id } })
    return user
  }

  async getUserByExternalId(externalId: string) {
    const user = await this.prisma.user.findUnique({ where: { externalId } })
    return user
  }

  async getLegalPersonById(id: string) {
    const legalPerson = await this.prisma.legalPerson.findUnique({ where: { id: id } })
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

  async createUserGdprData(userId: string, gdprSubType: GdprSubType, gdprData: GdprDataDto[]) {
    const data = []
    for (const elem of gdprData) {
      data.push({
        category: elem.category,
        type: elem.type,
        subType: gdprSubType,
        userId: userId,
      })
    }
    const sendEmailData = gdprData.find((value) => {
      return value.category === GdprCategory.TAXES && value.type === GdprType.FORMAL_COMMUNICATION
    })
    if (sendEmailData && gdprSubType === GdprSubType.SUB) {
      //TODO - add template and create pdf and send to email
      // await this.mailgunSubservice.sendEmail('TBD - SUBSCRIPTION TAMPLATE', {
      //   to: email,
      //   variables: {
      //     firstName,
      //   },
      // })
    }
    await this.prisma.userGdprData.createMany({ data: data })
    return data
  }

  async createLegalPersonGdprData(
    legalPersonId: string,
    gdprSubType: GdprSubType | null,
    gdprData?: GdprDataDto[]
  ) {
    const data = []
    if (!gdprData) {
      for (const category in GdprCategory) {
        for (const type in GdprType) {
          if (type !== GdprType.LICENSE) {
            data.push({
              category: category,
              type: type,
              subType: gdprSubType,
              legalPersonId: legalPersonId,
            })
          }
        }
      }
    } else {
      for (const elem of gdprData) {
        data.push({
          category: elem.category,
          type: elem.type,
          subType: gdprSubType,
          legalPersonId: legalPersonId,
        })
      }
    }
    await this.prisma.legalPersonGdprData.createMany({ data: data })
    return data
  }

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

  // TODO DEPRECATED. Use `getActiveAndLockedDeliveryMethodsWithDates()` instead
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

  private parseActiveDeliveryMethod(user: UserWithDeliveryData) {
    if (user.physicalEntity?.activeEdesk) {
      return { deliveryMethod: DeliveryMethodEnum.EDESK }
    } else if (user.userGdprData?.[0]?.subType === GdprSubType.SUB) {
      if (user.userGdprData[0].createdAt) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          SubserviceErrorsEnum.CITY_ACCOUNT_DELIVERY_METHOD_WITHOUT_DATE,
          SubserviceErrorsResponseEnum.CITY_ACCOUNT_DELIVERY_METHOD_WITHOUT_DATE,
          undefined,
          user
        )
      }
      return {
        deliveryMethod: DeliveryMethodEnum.CITY_ACCOUNT,
        date: user.userGdprData[0].createdAt,
      }
    } else {
      return { deliveryMethod: DeliveryMethodEnum.POSTAL }
    }
  }

  async getActiveAndLockedDeliveryMethodsWithDates(
    where: Prisma.UserWhereUniqueInput
  ): Promise<DeliveryMethodActiveAndLockedDto> {
    const user = await this.prisma.user.findUnique({
      where,
      include: {
        userGdprData: {
          orderBy: {
            createdAt: 'desc',
          },
          where: {
            category: GdprCategory.TAXES,
            type: GdprType.FORMAL_COMMUNICATION,
          },
          take: 1,
          select: {
            subType: true,
            createdAt: true,
          },
        },
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

    if (user.taxDeliveryMethodAtLockDate && !user.taxDeliveryMethodCityAccountDate) {
    }

    const locked = user.taxDeliveryMethodAtLockDate
      ? {
          deliveryMethod: user.taxDeliveryMethodAtLockDate,
          date: user.taxDeliveryMethodCityAccountDate ?? undefined,
        }
      : undefined

    let active = this.parseActiveDeliveryMethod(user)

    return { active, locked }
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
}

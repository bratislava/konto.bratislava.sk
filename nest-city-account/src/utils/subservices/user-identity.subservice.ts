import { Injectable } from '@nestjs/common'

import { DeliveryMethodEnum, Prisma } from '@prisma/client'
import { CognitoUserAccountTypesEnum } from '../global-dtos/cognito.dto'
import { ACTIVE_USER_FILTER, PrismaService } from '../../prisma/prisma.service'
import { UserOfficialCorrespondenceChannelEnum } from '../../user/dtos/gdpr.user.dto'

@Injectable()
export class UserIdentitySubservice {
  constructor(private readonly prisma: PrismaService) {}

  async getOfficialCorrespondenceChannel(
    where: Prisma.UserWhereUniqueInput
  ): Promise<UserOfficialCorrespondenceChannelEnum | null> {
    const user = await this.prisma.user.findUnique({
      where,
      include: {
        physicalEntity: {
          select: { activeEdesk: true },
        },
      },
    })

    if (!user) {
      return null
    }

    const activeDeliveryMethod = user.physicalEntity?.activeEdesk
      ? DeliveryMethodEnum.EDESK
      : user.taxDeliveryMethod

    switch (activeDeliveryMethod) {
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

  async getVerifiedIdentifiers(
    externalId: string,
    accountType: CognitoUserAccountTypesEnum
  ): Promise<{ birthNumber?: string; ico?: string }> {
    if (accountType === CognitoUserAccountTypesEnum.PHYSICAL_ENTITY) {
      const user = await this.prisma.user.findUnique({
        where: {
          externalId,
          ...ACTIVE_USER_FILTER,
        },
        select: {
          birthNumber: true,
        },
      })

      return { birthNumber: user?.birthNumber ?? undefined }
    }

    if (
      accountType === CognitoUserAccountTypesEnum.LEGAL_ENTITY ||
      accountType === CognitoUserAccountTypesEnum.SELF_EMPLOYED_ENTITY
    ) {
      const legalPerson = await this.prisma.legalPerson.findUnique({
        where: {
          externalId,
        },
        select: {
          birthNumber: true,
          ico: true,
        },
      })

      return {
        birthNumber: legalPerson?.birthNumber ?? undefined,
        ico: legalPerson?.ico ?? undefined,
      }
    }

    return {}
  }
}

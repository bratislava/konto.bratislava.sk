import { Injectable } from '@nestjs/common'

import {
  BloomreachOutboxStatus,
  GDPRCategoryEnum,
  GDPRSubTypeEnum,
  GDPRTypeEnum,
} from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { GdprDataSubscriptionDto } from '../user/dtos/gdpr.user.dto'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import { toLogfmt } from '../utils/logging'
import { BloomreachPayloadBuilder } from './bloomreach-payload.builder'
import {
  BloomreachCommandNameEnum,
  BloomreachCustomerCommandData,
  BloomreachEventCommandData,
} from './bloomreach.types'

@Injectable()
export class BloomreachOutboxService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prisma: PrismaService,
    private readonly payloadBuilder: BloomreachPayloadBuilder,
    private readonly throwerErrorGuard: ThrowerErrorGuard
  ) {
    this.logger = new LineLoggerSubservice(BloomreachOutboxService.name)
  }

  async trackCustomer(cognitoId: string, phoneNumber?: string): Promise<void> {
    if (process.env.BLOOMREACH_INTEGRATION_STATE !== 'ACTIVE') {
      return
    }

    try {
      const command = await this.payloadBuilder.buildCustomerCommand(cognitoId, phoneNumber)

      await this.upsertPendingCustomerCommand(cognitoId, command.commandData)

      this.logger.debug(`Queued customers command for ${cognitoId}`)
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to queue customer tracking',
          toLogfmt({ cognitoId, hasPhoneNumber: !!phoneNumber }),
          error
        )
      )
    }
  }

  async trackEventConsents(
    gdprData: GdprDataSubscriptionDto[],
    cognitoId: string | null,
    userId?: string,
    isLegalPerson?: boolean
  ): Promise<void> {
    if (process.env.BLOOMREACH_INTEGRATION_STATE !== 'ACTIVE') {
      return
    }

    const userType =
      isLegalPerson === true ? 'legal_person' : isLegalPerson === false ? 'user' : 'unknown'

    if (!cognitoId) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `No externalId for ${userType}, skipping trackEventConsents`,
          toLogfmt({ userId, userType })
        )
      )
      return
    }

    try {
      const commands = this.payloadBuilder.buildConsentEventCommands(gdprData, cognitoId)

      await Promise.all(
        commands.map(({ commandData }) => this.upsertPendingEventCommand(cognitoId, commandData))
      )

      this.logger.debug(`Queued ${commands.length} consent events for ${userType} ${cognitoId}`)
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to queue consent events',
          toLogfmt({ cognitoId, userType, eventCount: gdprData.length }),
          error
        )
      )
    }
  }

  async anonymizeCustomer(cognitoId: string): Promise<void> {
    if (process.env.BLOOMREACH_INTEGRATION_STATE !== 'ACTIVE') {
      return
    }

    try {
      await this.trackEventConsents(
        [
          {
            type: GDPRTypeEnum.MARKETING,
            category: GDPRCategoryEnum.ESBS,
            subType: GDPRSubTypeEnum.unsubscribe,
          },
          {
            type: GDPRTypeEnum.GENERAL,
            category: GDPRCategoryEnum.ESBS,
            subType: GDPRSubTypeEnum.unsubscribe,
          },
          {
            type: GDPRTypeEnum.FORMAL_COMMUNICATION,
            category: GDPRCategoryEnum.TAXES,
            subType: GDPRSubTypeEnum.unsubscribe,
          },
        ],
        cognitoId
      )

      const { commandData } = this.payloadBuilder.buildAnonymizeCommand(cognitoId)

      await this.upsertPendingCustomerCommand(cognitoId, commandData)

      this.logger.debug(`Queued anonymize commands for ${cognitoId}`)
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to queue anonymize commands',
          toLogfmt({ cognitoId }),
          error
        )
      )
    }
  }

  private async upsertPendingEventCommand(
    cognitoId: string,
    commandData: BloomreachEventCommandData
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.bloomreachOutbox.findFirst({
        where: {
          cognitoId,
          commandName: BloomreachCommandNameEnum.CUSTOMERS_EVENTS,
          status: BloomreachOutboxStatus.PENDING,
          AND: [
            {
              commandData: {
                path: ['event_type'],
                equals: commandData.event_type,
              },
            },
            {
              commandData: {
                path: ['properties', 'category'],
                equals: commandData.properties.category,
              },
            },
          ],
        },
      })

      if (existing) {
        await tx.bloomreachOutbox.update({
          where: { id: existing.id },
          data: { commandData },
        })
      } else {
        await tx.bloomreachOutbox.create({
          data: {
            cognitoId,
            commandName: BloomreachCommandNameEnum.CUSTOMERS_EVENTS,
            commandData,
          },
        })
      }
    })
  }

  // Prisma's upsert requires a @@unique constraint, but we can't add one on
  // (cognitoId, commandName, status) — multiple COMPLETED/FAILED rows for the
  // same combo are valid. A partial unique index (WHERE status = 'PENDING')
  // would work in PostgreSQL, but Prisma doesn't support partial indexes.
  private async upsertPendingCustomerCommand(
    cognitoId: string,
    commandData: BloomreachCustomerCommandData
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.bloomreachOutbox.findFirst({
        where: {
          cognitoId,
          commandName: BloomreachCommandNameEnum.CUSTOMERS,
          status: BloomreachOutboxStatus.PENDING,
        },
      })

      if (existing) {
        await tx.bloomreachOutbox.update({
          where: { id: existing.id },
          data: {
            commandData: {
              customer_ids: { ...existing.commandData.customer_ids, ...commandData.customer_ids },
              properties: { ...existing.commandData.properties, ...commandData.properties },
            },
          },
        })
      } else {
        await tx.bloomreachOutbox.create({
          data: {
            cognitoId,
            commandName: BloomreachCommandNameEnum.CUSTOMERS,
            commandData,
          },
        })
      }
    })
  }
}

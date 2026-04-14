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

  async trackCustomer(externalId: string, phoneNumber?: string): Promise<void> {
    if (process.env.BLOOMREACH_INTEGRATION_STATE !== 'ACTIVE') {
      return
    }

    try {
      const command = await this.payloadBuilder.buildCustomerCommand(externalId, phoneNumber)

      await this.upsertPendingCustomerCommand(externalId, command.commandData)

      this.logger.debug(`Queued customers command for ${externalId}`)
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to queue customer tracking',
          toLogfmt({ externalId, hasPhoneNumber: !!phoneNumber }),
          error
        )
      )
    }
  }

  async trackEventConsents(
    gdprData: GdprDataSubscriptionDto[],
    externalId: string | null,
    userId?: string,
    isLegalPerson?: boolean
  ): Promise<void> {
    if (process.env.BLOOMREACH_INTEGRATION_STATE !== 'ACTIVE') {
      return
    }

    const userType =
      isLegalPerson === true ? 'legal_person' : isLegalPerson === false ? 'user' : 'unknown'

    if (!externalId) {
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
      const commands = this.payloadBuilder.buildConsentEventCommands(gdprData, externalId)

      await Promise.all(
        commands.map(({ commandData }) => this.upsertPendingEventCommand(externalId, commandData))
      )

      this.logger.debug(`Queued ${commands.length} consent events for ${userType} ${externalId}`)
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to queue consent events',
          toLogfmt({ externalId, userType, eventCount: gdprData.length }),
          error
        )
      )
    }
  }

  async anonymizeCustomer(externalId: string): Promise<void> {
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
        externalId
      )

      const { commandData } = this.payloadBuilder.buildAnonymizeCommand(externalId)

      await this.upsertPendingCustomerCommand(externalId, commandData)

      this.logger.debug(`Queued anonymize commands for ${externalId}`)
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to queue anonymize commands',
          toLogfmt({ externalId }),
          error
        )
      )
    }
  }

  private async upsertPendingEventCommand(
    externalId: string,
    commandData: BloomreachEventCommandData
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.bloomreachOutbox.findFirst({
        where: {
          externalId,
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
            externalId,
            commandName: BloomreachCommandNameEnum.CUSTOMERS_EVENTS,
            commandData,
          },
        })
      }
    })
  }

  // Prisma's upsert requires a @@unique constraint, but we can't add one on
  // (externalId, commandName, status) — multiple COMPLETED/FAILED rows for the
  // same combo are valid. A partial unique index (WHERE status = 'PENDING')
  // would work in PostgreSQL, but Prisma doesn't support partial indexes.
  private async upsertPendingCustomerCommand(
    externalId: string,
    commandData: BloomreachCustomerCommandData
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.bloomreachOutbox.findFirst({
        where: {
          externalId,
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
            externalId,
            commandName: BloomreachCommandNameEnum.CUSTOMERS,
            commandData,
          },
        })
      }
    })
  }
}

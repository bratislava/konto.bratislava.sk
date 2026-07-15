import { Injectable } from '@nestjs/common'

import { BloomreachOutboxStatus } from '../generated/prisma/enums'
import { PrismaService } from '../prisma/prisma.service'
import {
  BloomreachCommandNameEnum,
  BloomreachCustomerCommandData,
  BloomreachEventCommandData,
  Consent,
} from './bloomreach.types'
import { BloomreachPayloadBuilder } from './bloomreach-payload.builder'
import { mergeCustomerCommandData } from './utils/merge-commands.utils'

@Injectable()
export class BloomreachOutboxWriterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payloadBuilder: BloomreachPayloadBuilder
  ) {}

  async queueCustomerCommand(externalId: string, phoneNumber?: string): Promise<void> {
    const { commandData } = await this.payloadBuilder.buildCustomerCommand(externalId, phoneNumber)

    await this.upsertPendingCustomerCommand(externalId, commandData)
  }

  async queueAnonymizeCommand(externalId: string): Promise<void> {
    const { commandData } = this.payloadBuilder.buildAnonymizeCommand(externalId)

    await this.upsertPendingCustomerCommand(externalId, commandData)
  }

  async queueConsentEvents(consents: Consent[], externalId: string): Promise<void> {
    const commands = this.payloadBuilder.buildConsentEventCommands(consents, externalId)

    await Promise.all(
      commands.map(async ({ commandData }) =>
        this.upsertPendingEventCommand(externalId, commandData)
      )
    )
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
            commandData: mergeCustomerCommandData(
              existing.commandData as BloomreachCustomerCommandData,
              commandData
            ),
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

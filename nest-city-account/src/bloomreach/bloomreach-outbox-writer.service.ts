import { Injectable } from '@nestjs/common'

import { BloomreachCommandName, BloomreachOutboxStatus } from '../generated/prisma/enums'
import { PrismaService } from '../prisma/prisma.service'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { toLogfmt } from '../utils/logging'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import {
  BloomreachCustomerCommandData,
  BloomreachEventCommandData,
  Consent,
  isBloomreachEventCommandData,
} from './bloomreach.types'
import { BloomreachPayloadBuilder } from './bloomreach-payload.builder'
import {
  isAnonymizationCommand,
  isExistingHigherPriorityEventCommand,
  mergeCustomerCommandData,
} from './utils/merge-commands.utils'
import {
  isBloomreachOutboxDedupConflictError,
  isTerminalOverrideError,
} from './utils/outbox-errors.utils'
import { lockOutboxDedupKey } from './utils/outbox-lock.utils'

@Injectable()
export class BloomreachOutboxWriterService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prisma: PrismaService,
    private readonly payloadBuilder: BloomreachPayloadBuilder,
    private readonly throwerErrorGuard: ThrowerErrorGuard
  ) {
    this.logger = new LineLoggerSubservice(BloomreachOutboxWriterService.name)
  }

  async queueCustomerCommand(externalId: string, phoneNumber?: string): Promise<void> {
    const { commandData } = await this.payloadBuilder.buildCustomerCommand(externalId, phoneNumber)

    await this.upsertPendingCustomerCommand(externalId, commandData)
  }

  async queueAnonymizeCommand(externalId: string): Promise<void> {
    const { commandData } = this.payloadBuilder.buildAnonymizeCommand(externalId)

    await this.upsertPendingCustomerCommand(externalId, commandData)
  }

  async queueConsentEvents(
    consents: Consent[],
    externalId: string,
    terminal = false
  ): Promise<void> {
    const commands = this.payloadBuilder.buildConsentEventCommands(consents, externalId)

    await Promise.all(
      commands.map(async ({ commandData }) =>
        this.upsertPendingEventCommand(externalId, commandData, terminal)
      )
    )
  }

  private async upsertPendingEventCommand(
    externalId: string,
    commandData: BloomreachEventCommandData,
    terminal: boolean
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await lockOutboxDedupKey(
        tx,
        externalId,
        BloomreachCommandName.CUSTOMERS_EVENTS,
        commandData.event_type,
        commandData.properties.category
      )

      const existing = await tx.bloomreachOutbox.findFirst({
        where: {
          externalId,
          commandName: BloomreachCommandName.CUSTOMERS_EVENTS,
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
        if (!isBloomreachEventCommandData(existing.commandData)) {
          throw this.throwerErrorGuard.InternalServerErrorException(
            ErrorsEnum.INTERNAL_SERVER_ERROR,
            'Bloomreach outbox entry has commandName CUSTOMERS_EVENTS but commandData is not event command data',
            toLogfmt({ externalId, entryId: existing.id })
          )
        }

        const existingData = existing.commandData

        if (
          isExistingHigherPriorityEventCommand(
            { isTerminal: existing.isTerminal, timestamp: existingData.timestamp },
            { isTerminal: terminal, timestamp: commandData.timestamp }
          )
        ) {
          return
        }

        await tx.bloomreachOutbox.update({
          where: { id: existing.id },
          data: {
            commandData,
            isTerminal: terminal,
          },
        })
      } else {
        try {
          await tx.bloomreachOutbox.create({
            data: {
              externalId,
              commandName: BloomreachCommandName.CUSTOMERS_EVENTS,
              commandData,
              isTerminal: terminal,
            },
          })
        } catch (error) {
          if (isTerminalOverrideError(error)) {
            this.logger.warn(
              `Skipped queuing consent event - a terminal entry for this dedup key is at least as recent, ${toLogfmt(
                {
                  externalId,
                  eventType: commandData.event_type,
                  category: commandData.properties.category,
                }
              )}`
            )
            return
          }

          if (!isBloomreachOutboxDedupConflictError(error)) {
            throw error
          }
          throw this.throwerErrorGuard.InternalServerErrorException(
            ErrorsEnum.INTERNAL_SERVER_ERROR,
            'bloomreach_outbox_events_pending_key violated - lockOutboxDedupKey should have prevented this, investigate a locking bug',
            toLogfmt({
              externalId,
              eventType: commandData.event_type,
              category: commandData.properties.category,
            }),
            error
          )
        }
      }
    })
  }

  private async upsertPendingCustomerCommand(
    externalId: string,
    commandData: BloomreachCustomerCommandData
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await lockOutboxDedupKey(tx, externalId, BloomreachCommandName.CUSTOMERS)

      const existing = await tx.bloomreachOutbox.findFirst({
        where: {
          externalId,
          commandName: BloomreachCommandName.CUSTOMERS,
          status: BloomreachOutboxStatus.PENDING,
        },
      })

      if (existing) {
        const merged = mergeCustomerCommandData(
          existing.commandData as BloomreachCustomerCommandData,
          commandData
        )

        await tx.bloomreachOutbox.update({
          where: { id: existing.id },
          data: {
            commandData: merged,
            isTerminal: isAnonymizationCommand(merged),
          },
        })
      } else {
        try {
          await tx.bloomreachOutbox.create({
            data: {
              externalId,
              commandName: BloomreachCommandName.CUSTOMERS,
              commandData,
              isTerminal: isAnonymizationCommand(commandData),
            },
          })
        } catch (error) {
          if (!isBloomreachOutboxDedupConflictError(error)) {
            throw error
          }
          throw this.throwerErrorGuard.InternalServerErrorException(
            ErrorsEnum.INTERNAL_SERVER_ERROR,
            'bloomreach_outbox_customers_pending_key violated - lockOutboxDedupKey should have prevented this, investigate a locking bug',
            toLogfmt({ externalId }),
            error
          )
        }
      }
    })
  }
}
